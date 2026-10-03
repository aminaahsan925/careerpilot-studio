import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { buildCareerState } from "./career-state.server";
import { saveReadinessAuto } from "./readiness.server";
import { ingestProjectEvidence } from "./evidence/ingestion";
import { str } from "./coerce";

/** Stable slug for evidence source identity (DB ids churn on every save). */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project";

type Client = SupabaseClient<Database>;


export type ProjectInput = {
  name: string;
  description?: string;
  technologies: string[];
  projectUrl?: string;
  projectType: "personal" | "academic" | "freelance" | "open-source" | "hackathon";
  completed?: boolean;
};

export type UserProject = {
  id: string;
  name: string;
  description: string | null;
  technologies: string[];
  projectUrl: string | null;
  projectType: string;
  completed: boolean;
  position: number;
};

/** Load all projects for a user, ordered by position. */
export async function loadProjects(supabase: Client, userId: string): Promise<UserProject[]> {
  const { data, error } = await supabase
    .from("user_projects")
    .select("*")
    .eq("user_id", userId)
    .order("position");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    technologies: Array.isArray(row.technologies) ? (row.technologies as string[]) : [],
    projectUrl: (row.project_url as string | null) ?? null,
    projectType: (row.project_type as string) ?? "personal",
    completed: (row.completed as boolean) ?? false,
    position: (row.position as number) ?? 0,
  }));
}

/**
 * Replaces all projects for the user with the supplied list.
 * Each project's technologies are synced to skill_evidence as project-backed
 * evidence (strength 2), matching the pattern used by syncResumeEvidence.
 */
export async function saveProjects(
  supabase: Client,
  userId: string,
  projects: ProjectInput[],
): Promise<{ count: number }> {
  // Delete existing projects
  await supabase.from("user_projects").delete().eq("user_id", userId);

  if (!projects.length) {
    // Refresh readiness since evidence may have changed
    await saveReadinessAuto(
      supabase,
      userId,
      await buildCareerState(supabase, userId),
    );
    return { count: 0 };
  }

  const rows = projects.slice(0, 20).map((p, i) => ({
    user_id: userId,
    name: str(p.name, 160) || `Project ${i + 1}`,
    description: str(p.description, 600) || null,
    technologies: (p.technologies ?? [])
      .map((t) => str(t, 80))
      .filter(Boolean)
      .slice(
        0,
        15,
      ) as unknown as Database["public"]["Tables"]["user_projects"]["Insert"]["technologies"],
    project_url: p.projectUrl ? str(p.projectUrl, 500) : null,
    project_type: ["personal", "academic", "freelance", "open-source", "hackathon"].includes(
      p.projectType,
    )
      ? p.projectType
      : "personal",
    completed: p.completed ?? false,
    position: i,
  }));

  const { error } = await supabase.from("user_projects").insert(rows as never);
  if (error) throw error;

  // Sync all project technologies to skill_evidence
  const allTechs = projects.flatMap((p) => p.technologies ?? []);
  await syncProjectEvidence(supabase, userId, allTechs);

  // Phase 2: ingest each project into the evidence layer (chunk + embed +
  // evidence items). Stable synthetic source ids — user_projects rows are
  // deleted and re-inserted on every save, so DB ids would orphan evidence.
  // Failures must never break the save response.
  const seenSourceIds = new Set<string>();
  for (const [i, p] of projects.entries()) {
    const sourceId = `project:${slug(p.name || `project-${i + 1}`)}`;
    seenSourceIds.add(sourceId);
    try {
      await ingestProjectEvidence(supabase, userId, {
        id: sourceId,
        name: p.name || `Project ${i + 1}`,
        description: p.description ?? null,
        technologies: p.technologies ?? [],
        project_url: p.projectUrl ?? null,
      });
    } catch (err) {
      console.error(
        "[evidence] project ingestion failed:",
        err instanceof Error ? err.message : String(err),
      );
    }
  }
  await pruneStaleProjectEvidence(supabase, userId, seenSourceIds);

  // Refresh readiness
  await saveReadinessAuto(
    supabase,
    userId,
    await buildCareerState(supabase, userId),
  );

  return { count: rows.length };
}

/**
 * Remove evidence_items / evidence_sources for projects that no longer exist.
 * Chunks cascade via evidence_chunks.evidence_id FK.
 */
async function pruneStaleProjectEvidence(
  supabase: Client,
  userId: string,
  seenSourceIds: Set<string>,
) {
  // NOTE: evidence_* tables postdate the generated Database types.
  const db = supabase as unknown as SupabaseClient<any>;

  const { data: items, error: itemsErr } = await db
    .from("evidence_items")
    .select("id, source_id")
    .eq("user_id", userId)
    .eq("source_type", "project");
  if (itemsErr) {
    console.error("[evidence] prune items failed:", itemsErr.message);
  } else {
    const stale = ((items ?? []) as any[])
      .filter((r) => !seenSourceIds.has(String(r.source_id)))
      .map((r) => r.id);
    if (stale.length) {
      const { error } = await db.from("evidence_items").delete().in("id", stale);
      if (error) console.error("[evidence] prune items failed:", error.message);
    }
  }

  const { data: sources, error: sourcesErr } = await db
    .from("evidence_sources")
    .select("id, source_id")
    .eq("user_id", userId)
    .eq("domain", "candidate")
    .eq("source_type", "project");
  if (sourcesErr) {
    console.error("[evidence] prune sources failed:", sourcesErr.message);
  } else {
    const stale = ((sources ?? []) as any[])
      .filter((r) => !seenSourceIds.has(String(r.source_id)))
      .map((r) => r.id);
    if (stale.length) {
      const { error } = await db.from("evidence_sources").delete().in("id", stale);
      if (error) console.error("[evidence] prune sources failed:", error.message);
    }
  }
}

/**
 * Records project technologies as evidence (strength 2 = project-backed).
 * This mirrors syncResumeEvidence but uses source='project' and strength=2,
 * which signals that the skill is demonstrated by a real artefact.
 */
async function syncProjectEvidence(supabase: Client, userId: string, technologies: string[]) {
  const names = Array.from(
    new Map(
      technologies
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => [t.toLowerCase(), t]),
    ).values(),
  ).slice(0, 40);
  if (!names.length) return;

  const { data: existing } = await supabase
    .from("skill_evidence")
    .select("id, skill_name, source")
    .eq("user_id", userId)
    .eq("source", "project");

  const have = new Set((existing ?? []).map((e) => (e.skill_name ?? "").toLowerCase()));
  const wanted = new Set(
    Array.from(
      new Map(
        technologies
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => [t.toLowerCase(), t] as const),
      ).values(),
    ).map((n) => n.toLowerCase()),
  );

  // Phase 2: delete stale project evidence for technologies the user removed.
  // Previously rows were only ever inserted, so deleted projects haunted the
  // ledger forever.
  const staleIds = (existing ?? [])
    .filter((e) => !wanted.has((e.skill_name ?? "").toLowerCase()))
    .map((e) => e.id)
    .filter(Boolean);
  if (staleIds.length) {
    const { error: delError } = await supabase
      .from("skill_evidence")
      .delete()
      .eq("user_id", userId)
      .in("id", staleIds);
    if (delError) throw delError;
  }

  const rows = names
    .filter((n) => !have.has(n.toLowerCase()))
    .map((n) => ({
      user_id: userId,
      skill_name: n,
      source: "project",
      detail: "Listed in a user project",
      strength: 2,
    }));

  if (!rows.length) return;
  const { error } = await supabase.from("skill_evidence").insert(rows as never);
  if (error) throw error;
}
