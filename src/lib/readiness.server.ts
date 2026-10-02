import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { CareerState } from "./career-state.server";
import { computeCoverage } from "./evidence/matching";
import type {
  EvidenceInput,
  RequirementImportance,
  RequirementInput,
} from "./evidence/matching";

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

/* ------------------------------------------------------------------ */
/* Shared deterministic scorers (used by v1 and v2-evidence)            */
/* ------------------------------------------------------------------ */

function scoreResume(state: CareerState): { score: number; explanation: string } {
  const score = state.resume.hasResume ? pct(state.resume.resumeScore ?? 0) : 0;
  const explanation = state.resume.hasResume
    ? `Resume scored ${state.resume.resumeScore}/100 with an ATS score of ${state.resume.atsScore}/100.`
    : "No resume uploaded. You cannot pass ATS screening without one.";
  return { score, explanation };
}

function scoreInterview(state: CareerState): { score: number; explanation: string } {
  const roadmapPct = state.roadmap.total
    ? (state.roadmap.completed / state.roadmap.total) * 100
    : 0;
  const interviewed = state.applications.filter((a) =>
    ["interview", "offer", "hired"].includes(a.status.toLowerCase()),
  ).length;
  const score = pct(roadmapPct * 0.7 + Math.min(interviewed, 3) * 10);
  const explanation = state.roadmap.total
    ? `${state.roadmap.completed}/${state.roadmap.total} roadmap stages complete; ${interviewed} interview-stage application(s).`
    : "No roadmap generated. You have no structured preparation plan.";
  return { score, explanation };
}

/**
 * Structural blockers shared by v1 and v2-evidence: problems that do not
 * depend on how skills were scored. Mutates the passed array.
 */
function addStructuralBlockers(
  blockers: Blocker[],
  state: CareerState,
  projectBackedCount: number,
  skillCount: number,
): void {
  const hasProjects = state.projects.length > 0;

  if (!state.resume.hasResume) {
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

  if (skillCount && projectBackedCount === 0) {
    blockers.push({
      problem: "All your skills are claims",
      evidence: `You listed ${skillCount} skills but zero have a project or repository behind them.`,
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
}

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
  const { score: resumeScore, explanation: resumeWhy } = scoreResume(state);

  /* --- Portfolio evidence (any non-claim source at all) --- */
  const portfolio = state.skills.length ? pct((evidenced.length / evidenceBase) * 100) : 0;
  const portfolioWhy = state.skills.length
    ? evidenced.length === 0
      ? "Nothing has been verified. All skills are self-reported claims."
      : `${evidenced.length} of ${state.skills.length} skills have evidence. The rest are claims only.`
    : "Nothing submitted as evidence yet.";

  /* --- Interview readiness: roadmap progress + real interview activity --- */
  const { score: interview, explanation: interviewWhy } = scoreInterview(state);

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

  addStructuralBlockers(blockers, state, projectBacked.length, state.skills.length);

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

/* ------------------------------------------------------------------ */
/* v2-evidence: readiness grounded in the evidence_items ledger         */
/*                                                                     */
/* Same output shape as v1, but the skill-related categories are        */
/* computed from evidence_items through the deterministic matcher      */
/* instead of the legacy skills array. v1 is untouched for backwards    */
/* compatibility; new flows should call saveReadinessV2.               */
/* ------------------------------------------------------------------ */

export const READINESS_METHOD_V2 = "v2-evidence";

export function computeReadinessV2(
  state: CareerState,
  evidence: EvidenceInput[],
): Readiness {
  // Requirements: skill gaps first (high priority -> must_have), else recorded skills.
  const requirements: RequirementInput[] = state.gaps.length
    ? state.gaps.map((g) => ({
        skill: g.skill,
        importance: (g.priority === "high" ? "must_have" : "preferred") as RequirementImportance,
      }))
    : state.skills.map((s) => ({ skill: s.name, importance: "preferred" as const }));

  const coverage = computeCoverage(requirements, evidence);

  const strongProjectSkills = new Set(
    evidence
      .filter(
        (e) =>
          e.evidence_strength >= 2 &&
          (e.source_type === "project" || e.source_type === "github"),
      )
      .map((e) => e.skill_key),
  );
  const evidencedSkills = new Set(
    evidence.filter((e) => e.evidence_strength >= 1).map((e) => e.skill_key),
  );
  const distinctSkills = new Set(evidence.map((e) => e.skill_key));
  const skillBase = Math.max(state.skills.length, distinctSkills.size, 1);

  const { score: resumeScore, explanation: resumeWhy } = scoreResume(state);
  const { score: interview, explanation: interviewWhy } = scoreInterview(state);

  const technicalWhy = coverage.mustHave.total
    ? `${coverage.mustHave.proven} of ${coverage.mustHave.total} must-have skills proven` +
      (coverage.mustHave.partial ? `, ${coverage.mustHave.partial} partially` : "") +
      `; ${coverage.criticalGaps.length} critical gap${coverage.criticalGaps.length === 1 ? "" : "s"}.`
    : "No target requirements analysed yet — scores reflect recorded evidence only.";

  const breakdown: ReadinessCategory[] = [
    { label: "Technical Skills", score: coverage.coveragePct, explanation: technicalWhy },
    {
      label: "Project Evidence",
      score: pct((strongProjectSkills.size / skillBase) * 100),
      explanation:
        strongProjectSkills.size === 0
          ? "Zero skills are demonstrated in a project artifact. Everything is a claim."
          : `${strongProjectSkills.size} of ${skillBase} skills demonstrated in project artifacts.`,
    },
    { label: "Resume", score: resumeScore, explanation: resumeWhy },
    {
      label: "Portfolio Evidence",
      score: pct((evidencedSkills.size / skillBase) * 100),
      explanation:
        evidencedSkills.size === 0
          ? "No evidence items recorded yet."
          : `${evidencedSkills.size} of ${skillBase} skills have supporting evidence.`,
    },
    { label: "Interview Readiness", score: interview, explanation: interviewWhy },
  ];

  const weights = effectiveWeights(state.resume.hasResume);
  const overall = pct(
    breakdown.reduce((sum, c) => sum + c.score * (weights[c.label] ?? 0), 0),
  );

  const blockers: Blocker[] = [];
  for (const gap of coverage.criticalGaps.slice(0, 3)) {
    blockers.push({
      problem: `You are missing ${gap.skill}`,
      evidence: `The target role requires ${gap.skill}. ${gap.reason}`,
      impact: "This is a dealbreaker for this role. Employers will skip you.",
      action: `Build something that demonstrates ${gap.skill}. Now.`,
    });
  }
  addStructuralBlockers(blockers, state, strongProjectSkills.size, skillBase);

  const hasProjects = state.projects.length > 0;
  const hasGaps = requirements.length > 0;
  let stage: string;
  if (!state.targetRole) stage = "No direction yet";
  else if (!state.resume.hasResume && !hasProjects) stage = "No evidence yet";
  else if (!hasGaps) stage = "Identifying gaps";
  else if (state.roadmap.total && state.roadmap.completed >= state.roadmap.total)
    stage = "Applying";
  else if (strongProjectSkills.size === 0 && !hasProjects) stage = "Skills without proof";
  else if (overall >= 70) stage = "Job ready";
  else stage = "Closing gaps";

  const nextAction =
    blockers[0]?.action ??
    state.weeklyGoals.find((g) => !g.completed)?.title ??
    "Keep working through your roadmap and log the evidence you create.";

  return { overall, breakdown, blockers: blockers.slice(0, 5), stage, nextAction };
}

/** Load the user's evidence ledger, score with v2-evidence, store the snapshot. */
export async function saveReadinessV2(
  supabase: Client,
  userId: string,
  state: CareerState,
): Promise<Readiness> {
  // NOTE: evidence_* tables postdate the generated Database types; regenerate
  // types with `supabase gen types` to drop this cast.
  const db = supabase as unknown as SupabaseClient<any>;
  const { data, error } = await db
    .from("evidence_items")
    .select("id, skill_key, evidence_strength, confidence, verification_status, source_type")
    .eq("user_id", userId);
  if (error) throw error;

  const readiness = computeReadinessV2(state, (data ?? []) as EvidenceInput[]);
  const { error: insertError } = await supabase.from("readiness_snapshots").insert({
    user_id: userId,
    target_job_id: state.targetJob?.id ?? null,
    target_role: state.targetRole,
    overall: readiness.overall,
    breakdown: readiness.breakdown as never,
    blockers: readiness.blockers as never,
    stage: readiness.stage,
    next_action: readiness.nextAction,
    method_version: READINESS_METHOD_V2,
  });
  if (insertError) throw insertError;
  return readiness;
}
