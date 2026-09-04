import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { buildCareerState } from "./career-state.server";
import { saveReadiness } from "./readiness.server";

type Client = SupabaseClient<Database>;

const str = (v: unknown, max = 300) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

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
    await saveReadiness(supabase, userId, await buildCareerState(supabase, userId));
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

  // Refresh readiness
  await saveReadiness(supabase, userId, await buildCareerState(supabase, userId));

  return { count: rows.length };
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
