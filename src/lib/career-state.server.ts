import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

/* ------------------------------------------------------------------ *
 * The single Career State every CareerPilot feature reads from.
 * ------------------------------------------------------------------ */

export type EvidenceSource = "claim" | "resume" | "project" | "github" | "certification" | "course";

export type StateSkill = {
  name: string;
  proficiency: number;
  /** Highest evidence strength found for this skill (0 = claim only). */
  evidenceStrength: number;
  sources: EvidenceSource[];
};

export type StateGap = {
  skill: string;
  status: "matched" | "partial" | "missing" | "no_evidence";
  priority: "high" | "medium" | "low";
  evidence: string | null;
  requiredLevel: string | null;
  whyItMatters: string | null;
  action: string | null;
  proofTask: string | null;
};

export type StateProject = {
  name: string;
  description: string | null;
  technologies: string[];
  projectUrl: string | null;
  projectType: string;
  completed: boolean;
};

export type CareerState = {
  userId: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    currentRole: string | null;
    educationLevel: string | null;
    degree: string | null;
    university: string | null;
    graduationYear: number | null;
  };
  targetRole: string | null;
  targetIndustry: string | null;
  targetJob: {
    id: string;
    title: string;
    company: string | null;
    parsed: Record<string, unknown>;
  } | null;
  skills: StateSkill[];
  evidenceCount: number;
  projects: StateProject[];
  resume: {
    hasResume: boolean;
    atsScore: number | null;
    resumeScore: number | null;
    careerMatch: number | null;
    strengths: string[];
    weaknesses: string[];
    detectedSkills: string[];
  };
  gaps: StateGap[];
  roadmap: { total: number; completed: number; stages: { title: string; completed: boolean }[] };
  weeklyGoals: { title: string; completed: boolean }[];
  applications: { company: string; role: string; status: string }[];
  readiness: {
    overall: number;
    breakdown: { label: string; score: number }[];
    blockers: { problem: string; evidence: string; impact: string; action: string }[];
    stage: string | null;
    nextAction: string | null;
  } | null;
};

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export function weekStart(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export async function buildCareerState(supabase: Client, userId: string): Promise<CareerState> {
  const [
    profileRes,
    goalRes,
    jobRes,
    skillsRes,
    evidenceRes,
    analysisRes,
    gapsRes,
    stagesRes,
    goalsRes,
    appsRes,
    readinessRes,
    projectsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("career_goals").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("target_jobs")
      .select("id, title, company, parsed, description")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("user_skills").select("proficiency, skills(name)").eq("user_id", userId),
    supabase.from("skill_evidence").select("skill_name, source, strength").eq("user_id", userId),
    supabase
      .from("resume_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("skill_gaps").select("*").eq("user_id", userId).order("position"),
    supabase
      .from("roadmap_stages")
      .select("title, completed")
      .eq("user_id", userId)
      .order("position"),
    supabase
      .from("weekly_goals")
      .select("title, completed, week_start")
      .eq("user_id", userId)
      .eq("week_start", weekStart())
      .order("position"),
    supabase.from("applications").select("company, role_title, status").eq("user_id", userId),
    supabase
      .from("readiness_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_projects")
      .select("name, description, technologies, project_url, project_type, completed")
      .eq("user_id", userId)
      .order("position"),
  ]);

  const profile = profileRes.data;
  const evidenceRows = evidenceRes.data ?? [];

  const evidenceFor = (name: string) => {
    const rows = evidenceRows.filter(
      (e) => (e.skill_name ?? "").toLowerCase() === name.toLowerCase(),
    );
    return {
      strength: rows.reduce((max, r) => Math.max(max, r.strength ?? 0), 0),
      sources: Array.from(new Set(rows.map((r) => r.source as EvidenceSource))),
    };
  };

  const skills: StateSkill[] = (skillsRes.data ?? [])
    .map((r) => {
      const s = r.skills as unknown as { name?: string } | null;
      if (!s?.name) return null;
      const ev = evidenceFor(s.name);
      return {
        name: s.name,
        proficiency: (r.proficiency as number) ?? 50,
        evidenceStrength: ev.strength,
        sources: ev.sources.length ? ev.sources : (["claim"] as EvidenceSource[]),
      };
    })
    .filter((s): s is StateSkill => s !== null);

  // Skills that only exist as evidence (e.g. detected in the resume).
  for (const row of evidenceRows) {
    const name = row.skill_name ?? "";
    if (!name || skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) continue;
    const ev = evidenceFor(name);
    skills.push({ name, proficiency: 50, evidenceStrength: ev.strength, sources: ev.sources });
  }

  const analysis = analysisRes.data;
  const stages = stagesRes.data ?? [];
  const snapshot = readinessRes.data;

  return {
    userId,
    profile: {
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      currentRole: profile?.current_role ?? null,
      educationLevel: profile?.education_level ?? null,
      degree: profile?.degree ?? null,
      university: profile?.university ?? null,
      graduationYear: profile?.graduation_year ?? null,
    },
    targetRole: goalRes.data?.target_role ?? null,
    targetIndustry: goalRes.data?.target_industry ?? null,
    targetJob: jobRes.data
      ? {
          id: jobRes.data.id as string,
          title: jobRes.data.title as string,
          company: (jobRes.data.company as string | null) ?? null,
          parsed: (jobRes.data.parsed as Record<string, unknown>) ?? {},
        }
      : null,
    skills,
    evidenceCount: evidenceRows.filter((e) => (e.strength ?? 0) > 0).length,
    projects: (projectsRes.data ?? []).map((row) => ({
      name: (row.name as string) ?? "",
      description: (row.description as string | null) ?? null,
      technologies: Array.isArray(row.technologies) ? (row.technologies as string[]) : [],
      projectUrl: (row.project_url as string | null) ?? null,
      projectType: (row.project_type as string) ?? "personal",
      completed: (row.completed as boolean) ?? false,
    })),
    resume: {
      hasResume: Boolean(analysis),
      atsScore: analysis?.ats_score ?? null,
      resumeScore: analysis?.resume_score ?? null,
      careerMatch: analysis?.career_match ?? null,
      strengths: asStrings(analysis?.strengths),
      weaknesses: asStrings(analysis?.weaknesses),
      detectedSkills: asStrings(analysis?.detected_skills),
    },
    gaps: (gapsRes.data ?? []).map((g) => ({
      skill: g.skill as string,
      status: g.status as StateGap["status"],
      priority: g.priority as StateGap["priority"],
      evidence: (g.evidence as string | null) ?? null,
      requiredLevel: (g.required_level as string | null) ?? null,
      whyItMatters: (g.why_it_matters as string | null) ?? null,
      action: (g.action as string | null) ?? null,
      proofTask: (g.proof_task as string | null) ?? null,
    })),
    roadmap: {
      total: stages.length,
      completed: stages.filter((s) => s.completed).length,
      stages: stages.map((s) => ({ title: s.title as string, completed: s.completed as boolean })),
    },
    weeklyGoals: (goalsRes.data ?? []).map((g) => ({
      title: g.title as string,
      completed: g.completed as boolean,
    })),
    applications: (appsRes.data ?? []).map((a) => ({
      company: a.company as string,
      role: a.role_title as string,
      status: a.status as string,
    })),
    readiness: snapshot
      ? {
          overall: snapshot.overall as number,
          breakdown: (snapshot.breakdown as unknown as { label: string; score: number }[]) ?? [],
          blockers:
            (snapshot.blockers as unknown as CareerState["readiness"] extends null
              ? never
              : { problem: string; evidence: string; impact: string; action: string }[]) ?? [],
          stage: (snapshot.stage as string | null) ?? null,
          nextAction: (snapshot.next_action as string | null) ?? null,
        }
      : null,
  };
}

/** Compact, factual prompt context — the single source every AI feature uses. */
export function careerStateToPrompt(state: CareerState): string {
  const lines: string[] = [];
  const name = [state.profile.firstName, state.profile.lastName].filter(Boolean).join(" ");
  if (name) lines.push(`Name: ${name}`);
  if (state.profile.currentRole) lines.push(`Current role: ${state.profile.currentRole}`);
  const education = [state.profile.degree, state.profile.university, state.profile.graduationYear]
    .filter(Boolean)
    .join(", ");
  if (education) lines.push(`Education: ${education}`);
  lines.push(`Target role: ${state.targetRole ?? "not chosen yet"}`);
  if (state.targetIndustry) lines.push(`Target industry: ${state.targetIndustry}`);
  if (state.targetJob) {
    lines.push(
      `Active target job: ${state.targetJob.title}${state.targetJob.company ? ` @ ${state.targetJob.company}` : ""}`,
    );
    const req = state.targetJob.parsed?.["required_skills"];
    if (Array.isArray(req) && req.length) lines.push(`Job requires: ${req.join(", ")}`);
  }

  lines.push(
    state.skills.length
      ? `Skills (evidence 0=claim only, 3=strong): ${state.skills
          .map(
            (s) =>
              `${s.name} ${s.proficiency}% [evidence ${s.evidenceStrength}: ${s.sources.join("/")}]`,
          )
          .join("; ")}`
      : "Skills: none recorded yet",
  );

  if (state.resume.hasResume) {
    lines.push(
      `Resume analysis — ATS ${state.resume.atsScore}/100, resume ${state.resume.resumeScore}/100, career match ${state.resume.careerMatch}/100.`,
    );
    if (state.resume.weaknesses.length)
      lines.push(`Resume gaps: ${state.resume.weaknesses.slice(0, 5).join("; ")}`);
  } else {
    lines.push("No resume has been analysed yet.");
  }

  if (state.projects.length) {
    lines.push(
      `Projects (${state.projects.length}): ${state.projects
        .map(
          (p) =>
            `${p.name}${p.technologies.length ? ` [${p.technologies.slice(0, 6).join(", ")}]` : ""}${p.projectUrl ? ` (${p.projectUrl})` : ""}`,
        )
        .join("; ")}`,
    );
  } else {
    lines.push("No projects recorded yet.");
  }

  if (state.gaps.length) {
    lines.push(
      `Skill gaps: ${state.gaps
        .map((g) => `${g.skill} (${g.status}, ${g.priority} priority)`)
        .join("; ")}`,
    );
  }

  if (state.readiness) {
    lines.push(
      `Career readiness: ${state.readiness.overall}/100 — ${state.readiness.breakdown
        .map((b) => `${b.label} ${b.score}`)
        .join(", ")}. Stage: ${state.readiness.stage ?? "unknown"}.`,
    );
    if (state.readiness.blockers.length)
      lines.push(`Top blockers: ${state.readiness.blockers.map((b) => b.problem).join("; ")}`);
  }

  lines.push(
    state.roadmap.total
      ? `Roadmap (${state.roadmap.completed}/${state.roadmap.total} stages complete): ${state.roadmap.stages
          .map((s) => `${s.title}${s.completed ? " ✓" : ""}`)
          .join(" → ")}`
      : "No roadmap generated yet.",
  );

  if (state.weeklyGoals.length)
    lines.push(
      `This week's goals: ${state.weeklyGoals
        .map((g) => `${g.title}${g.completed ? " ✓" : ""}`)
        .join("; ")}`,
    );

  if (state.applications.length)
    lines.push(
      `Applications: ${state.applications
        .map((a) => `${a.role} @ ${a.company} (${a.status})`)
        .slice(0, 10)
        .join("; ")}`,
    );

  return lines.join("\n");
}
