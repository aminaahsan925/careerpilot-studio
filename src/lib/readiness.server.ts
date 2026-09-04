import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { CareerState } from "./career-state.server";

type Client = SupabaseClient<Database>;

export const READINESS_METHOD = "v1";

export type ReadinessCategory = { label: string; score: number; explanation: string };
export type Blocker = { problem: string; evidence: string; impact: string; action: string };

export type Readiness = {
  overall: number;
  breakdown: ReadinessCategory[];
  blockers: Blocker[];
  stage: string;
  nextAction: string;
};

const BASE_WEIGHTS: Record<string, number> = {
  "Technical Skills": 0.3,
  "Project Evidence": 0.2,
  Resume: 0.2,
  "Portfolio Evidence": 0.15,
  "Interview Readiness": 0.15,
};

/**
 * When no resume is uploaded, redistribute the Resume weight (20%) to
 * Project Evidence (+10%) and Portfolio Evidence (+10%) so the overall
 * score is NOT permanently capped at 80%.
 */
function effectiveWeights(hasResume: boolean): Record<string, number> {
  if (hasResume) return { ...BASE_WEIGHTS };
  return {
    "Technical Skills": 0.3,
    "Project Evidence": 0.3,
    Resume: 0,
    "Portfolio Evidence": 0.25,
    "Interview Readiness": 0.15,
  };
}

const pct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Deterministic, explainable readiness. No AI percentage is invented — every
 * number below is computed from data the student actually has in CareerPilot.
 */
export function computeReadiness(state: CareerState): Readiness {
  const gaps = state.gaps;
  const evidenced = state.skills.filter((s) => s.evidenceStrength >= 1);
  const projectBacked = state.skills.filter((s) =>
    s.sources.some((src) => src === "project" || src === "github"),
  );

  /* --- Technical skills: coverage of the requirements we know about --- */
  let technical: number;
  let technicalWhy: string;
  if (gaps.length) {
    const scored = gaps.reduce(
      (sum, g) =>
        sum +
        (g.status === "matched"
          ? 1
          : g.status === "partial"
            ? 0.5
            : g.status === "no_evidence"
              ? 0.4
              : 0),
      0,
    );
    technical = pct((scored / gaps.length) * 100);
    technicalWhy = `${gaps.filter((g) => g.status === "matched").length} of ${gaps.length} required skills fully matched.`;
  } else if (state.skills.length) {
    technical = pct(Math.min(state.skills.length, 8) * 7);
    technicalWhy = `${state.skills.length} skills recorded, but no target job has been analysed to check them against.`;
  } else {
    technical = 0;
    technicalWhy = "No skills recorded yet.";
  }

  /* --- Project evidence --- */
  const evidenceBase = state.skills.length || 1;
  const projectEvidence = state.skills.length
    ? pct((projectBacked.length / evidenceBase) * 100)
    : 0;
  const projectWhy = state.skills.length
    ? projectBacked.length === 0
      ? "Zero skills are backed by a project. Everything is a claim."
      : `${projectBacked.length} of ${state.skills.length} skills have project evidence. The rest are unproven.`
    : "No skills or projects recorded yet.";

  /* --- Resume --- */
  const resumeScore = state.resume.hasResume ? pct(state.resume.resumeScore ?? 0) : 0;
  const resumeWhy = state.resume.hasResume
    ? `Resume scored ${state.resume.resumeScore}/100 with an ATS score of ${state.resume.atsScore}/100.`
    : "No resume uploaded. You cannot pass ATS screening without one.";

  /* --- Portfolio evidence (any non-claim source at all) --- */
  const portfolio = state.skills.length ? pct((evidenced.length / evidenceBase) * 100) : 0;
  const portfolioWhy = state.skills.length
    ? evidenced.length === 0
      ? "Nothing has been verified. All skills are self-reported claims."
      : `${evidenced.length} of ${state.skills.length} skills have evidence. The rest are claims only.`
    : "Nothing submitted as evidence yet.";

  /* --- Interview readiness: roadmap progress + real interview activity --- */
  const roadmapPct = state.roadmap.total
    ? (state.roadmap.completed / state.roadmap.total) * 100
    : 0;
  const interviewed = state.applications.filter((a) =>
    ["interview", "offer", "hired"].includes(a.status.toLowerCase()),
  ).length;
  const interview = pct(roadmapPct * 0.7 + Math.min(interviewed, 3) * 10);
  const interviewWhy = state.roadmap.total
    ? `${state.roadmap.completed}/${state.roadmap.total} roadmap stages complete; ${interviewed} interview-stage application(s).`
    : "No roadmap generated. You have no structured preparation plan.";

  const breakdown: ReadinessCategory[] = [
    { label: "Technical Skills", score: technical, explanation: technicalWhy },
    { label: "Project Evidence", score: projectEvidence, explanation: projectWhy },
    { label: "Resume", score: resumeScore, explanation: resumeWhy },
    { label: "Portfolio Evidence", score: portfolio, explanation: portfolioWhy },
    { label: "Interview Readiness", score: interview, explanation: interviewWhy },
  ];

  const weights = effectiveWeights(state.resume.hasResume);

  const overall = pct(breakdown.reduce((sum, c) => sum + c.score * (weights[c.label] ?? 0), 0));

  /* --- Blockers: problem → evidence → why it matters → what to do next --- */
  const blockers: Blocker[] = [];

  for (const gap of gaps
    .filter((g) => g.priority === "high" && g.status !== "matched")
    .slice(0, 3)) {
    blockers.push({
      problem: `You are missing ${gap.skill}`,
      evidence:
        gap.evidence ??
        `The target job requires ${gap.skill}. You have zero demonstrated work in this area.`,
      impact: gap.whyItMatters ?? "This is a dealbreaker for this role. Employers will skip you.",
      action: gap.proofTask ?? gap.action ?? `Build something that demonstrates ${gap.skill}. Now.`,
    });
  }

  if (!state.resume.hasResume) {
    const hasProjects = state.projects.length > 0;
    if (hasProjects) {
      blockers.push({
        problem: "No resume uploaded",
        evidence:
          "You have projects but no resume. ATS systems will filter you out before a human ever sees your work.",
        impact:
          "Without a resume, you cannot pass automated screening. Your projects are invisible to most recruiters.",
        action: "Upload your resume on the Resume page. This is not optional — it is table stakes.",
      });
    } else {
      blockers.push({
        problem: "You have zero evidence",
        evidence: "No resume. No projects. Nothing to show an employer.",
        impact: "Every skill you listed is a claim. Recruiters need proof, and you have none.",
        action:
          "Add your projects or upload your resume. Until you do, your readiness score is meaningless.",
      });
    }
  }

  if (state.skills.length && projectBacked.length === 0) {
    blockers.push({
      problem: "All your skills are claims",
      evidence: `You listed ${state.skills.length} skills but zero have a project or repository behind them.`,
      impact:
        "Unproven skills are worthless in a job application. Evidence is what separates candidates.",
      action:
        "Build one portfolio project that demonstrates your most important target skill. This week.",
    });
  }

  if (!state.targetJob && state.targetRole) {
    blockers.push({
      problem: "No real job analysed",
      evidence: `Your goal is ${state.targetRole}, but you haven't analysed a single real job posting.`,
      impact:
        "Your gap analysis is generic guesswork. Without a real posting, you're preparing blind.",
      action:
        "Paste a real job description on the Career Target page. Know exactly what they want.",
    });
  }

  if (!state.targetRole) {
    blockers.unshift({
      problem: "No career target chosen",
      evidence: "You haven't picked a target role. Everything is directionless.",
      impact:
        "Without a destination, gaps, roadmap, and readiness are all meaningless. You can't prepare for 'something'.",
      action: "Pick a target role. Run career discovery if you're unsure — but pick one.",
    });
  }

  /* --- Stage + next best action --- */
  const hasProjects = state.projects.length > 0;
  let stage: string;
  if (!state.targetRole) stage = "No direction yet";
  else if (!state.resume.hasResume && !hasProjects) stage = "No evidence yet";
  else if (!gaps.length) stage = "Identifying gaps";
  else if (state.roadmap.total && state.roadmap.completed >= state.roadmap.total)
    stage = "Applying";
  else if (projectBacked.length === 0 && !hasProjects) stage = "Skills without proof";
  else if (overall >= 70) stage = "Job ready";
  else stage = "Closing gaps";

  const nextAction =
    blockers[0]?.action ??
    state.weeklyGoals.find((g) => !g.completed)?.title ??
    "Keep working through your roadmap and log the evidence you create.";

  return { overall, breakdown, blockers: blockers.slice(0, 5), stage, nextAction };
}

/** Computes readiness from the current state and stores an explainable snapshot. */
export async function saveReadiness(
  supabase: Client,
  userId: string,
  state: CareerState,
): Promise<Readiness> {
  const readiness = computeReadiness(state);
  const { error } = await supabase.from("readiness_snapshots").insert({
    user_id: userId,
    target_job_id: state.targetJob?.id ?? null,
    target_role: state.targetRole,
    overall: readiness.overall,
    breakdown: readiness.breakdown as never,
    blockers: readiness.blockers as never,
    stage: readiness.stage,
    next_action: readiness.nextAction,
    method_version: READINESS_METHOD,
  });
  if (error) throw error;
  return readiness;
}
