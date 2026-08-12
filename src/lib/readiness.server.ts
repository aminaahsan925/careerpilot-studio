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

const WEIGHTS: Record<string, number> = {
  "Technical Skills": 0.3,
  "Project Evidence": 0.2,
  Resume: 0.2,
  "Portfolio Evidence": 0.15,
  "Interview Readiness": 0.15,
};

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
      (sum, g) => sum + (g.status === "matched" ? 1 : g.status === "partial" ? 0.5 : g.status === "no_evidence" ? 0.4 : 0),
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
    ? `${projectBacked.length} of ${state.skills.length} skills are demonstrated by a project or repository.`
    : "No skills or projects recorded yet.";

  /* --- Resume --- */
  const resumeScore = state.resume.hasResume ? pct(state.resume.resumeScore ?? 0) : 0;
  const resumeWhy = state.resume.hasResume
    ? `Resume scored ${state.resume.resumeScore}/100 with an ATS score of ${state.resume.atsScore}/100.`
    : "No resume has been uploaded and analysed.";

  /* --- Portfolio evidence (any non-claim source at all) --- */
  const portfolio = state.skills.length ? pct((evidenced.length / evidenceBase) * 100) : 0;
  const portfolioWhy = state.skills.length
    ? `${evidenced.length} of ${state.skills.length} skills have supporting evidence; the rest are claims only.`
    : "Nothing has been submitted as evidence yet.";

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
    : "No roadmap generated yet, so preparation progress can't be measured.";

  const breakdown: ReadinessCategory[] = [
    { label: "Technical Skills", score: technical, explanation: technicalWhy },
    { label: "Project Evidence", score: projectEvidence, explanation: projectWhy },
    { label: "Resume", score: resumeScore, explanation: resumeWhy },
    { label: "Portfolio Evidence", score: portfolio, explanation: portfolioWhy },
    { label: "Interview Readiness", score: interview, explanation: interviewWhy },
  ];

  const overall = pct(
    breakdown.reduce((sum, c) => sum + c.score * (WEIGHTS[c.label] ?? 0), 0),
  );

  /* --- Blockers: problem → evidence → why it matters → what to do next --- */
  const blockers: Blocker[] = [];

  for (const gap of gaps
    .filter((g) => g.priority === "high" && g.status !== "matched")
    .slice(0, 3)) {
    blockers.push({
      problem: `Missing ${gap.skill}`,
      evidence:
        gap.evidence ??
        `The target job lists ${gap.skill} as required and your profile has no demonstrated ${gap.skill} work.`,
      impact: gap.whyItMatters ?? "Likely weakness for this role.",
      action: gap.proofTask ?? gap.action ?? `Build something that demonstrates ${gap.skill}.`,
    });
  }

  if (!state.resume.hasResume) {
    blockers.push({
      problem: "No analysed resume",
      evidence: "You haven't uploaded a resume for analysis yet.",
      impact: "CareerPilot can't verify any of your claimed skills or check ATS compatibility.",
      action: "Upload your resume on the Resume page to get a real analysis.",
    });
  }

  if (state.skills.length && projectBacked.length === 0) {
    blockers.push({
      problem: "No project evidence",
      evidence: `All ${state.skills.length} of your skills are claims with no project or repository behind them.`,
      impact: "Recruiters discount unproven skills, and evidence is what separates similar candidates.",
      action: "Build one portfolio project that demonstrates your most important target skill.",
    });
  }

  if (!state.targetJob && state.targetRole) {
    blockers.push({
      problem: "No specific target job analysed",
      evidence: `Your goal is ${state.targetRole}, but no real job description has been analysed.`,
      impact: "Gap analysis stays generic without a real posting to compare against.",
      action: "Paste a real internship or job description on the Career Target page.",
    });
  }

  if (!state.targetRole) {
    blockers.unshift({
      problem: "No career target chosen",
      evidence: "No target role is set on your profile.",
      impact: "Everything downstream — gaps, roadmap, readiness — needs a destination.",
      action: "Pick a target role, or run career discovery to get suggestions.",
    });
  }

  /* --- Stage + next best action --- */
  let stage: string;
  if (!state.targetRole) stage = "Discovering direction";
  else if (!state.resume.hasResume) stage = "Assessing profile";
  else if (!gaps.length) stage = "Identifying gaps";
  else if (state.roadmap.total && state.roadmap.completed >= state.roadmap.total) stage = "Applying";
  else if (projectBacked.length === 0) stage = "Building projects";
  else if (overall >= 70) stage = "Job ready";
  else stage = "Closing skill gaps";

  const nextAction =
    blockers[0]?.action ??
    (state.weeklyGoals.find((g) => !g.completed)?.title ??
      "Keep working through your roadmap and log the evidence you create.");

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
