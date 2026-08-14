import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { groqChat, parseJsonObject, stringList } from "./ai.server";
import { buildCareerState, careerStateToPrompt, type CareerState } from "./career-state.server";
import { saveReadiness, type Readiness } from "./readiness.server";

type Client = SupabaseClient<Database>;

const str = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);

export type DiagnosisBlocker = {
  problem: string;
  evidence: string;
  why_it_matters: string;
  impact: string;
  fix: string;
};

export type DiagnosisPriority = {
  title: string;
  impact: "high" | "medium" | "low";
  reason: string;
  action: string;
  evidence_to_produce: string;
};

export type NextBestAction = {
  action: string;
  why: string;
  evidence_to_produce: string;
  estimated_effort: string;
};

export type CareerDiagnosis = {
  id: string;
  createdAt: string;
  targetRole: string | null;
  targetJobLabel: string | null;
  stage: string | null;
  readiness: { overall: number | null; breakdown: { label: string; score: number; explanation?: string }[] };
  strengths: string[];
  blockers: DiagnosisBlocker[];
  priorities: DiagnosisPriority[];
  nextBestAction: NextBestAction | null;
  sequence: { when: "now" | "next" | "after"; action: string }[];
  progressNote: string | null;
  evidenceSummary: {
    demonstrated: string[];
    claimed_only: string[];
    unknown: string[];
  };
};

const SYSTEM = `You are CareerPilot's career diagnostician. You turn a student's REAL recorded career state into an honest gap → action diagnosis.

Return ONLY JSON:
{
 "strengths": string[] (2-5, each grounded in something actually recorded; empty array if nothing is recorded),
 "blockers": [{"problem": string, "evidence": string, "why_it_matters": string, "impact": string, "fix": string}] (exactly the 3 highest-impact reasons this student is not competitive yet; fewer only if the data truly supports fewer),
 "priorities": [{"title": string, "impact": "high"|"medium"|"low", "reason": string, "action": string, "evidence_to_produce": string}] (3-6, ordered most important first),
 "next_best_action": {"action": string, "why": string, "evidence_to_produce": string, "estimated_effort": string},
 "sequence": [{"when":"now","action":string},{"when":"next","action":string},{"when":"after","action":string}],
 "evidence_summary": {"demonstrated": string[], "claimed_only": string[], "unknown": string[]},
 "progress_note": string (max 200 chars: what changed since the previous diagnosis, or "" if there is no previous diagnosis)
}

Hard rules:
- Use ONLY facts in the CAREER STATE. Never invent projects, jobs, skills, scores or requirements.
- A skill with evidence 0 is CLAIMED, not demonstrated. Say "Claimed skill — insufficient practical evidence." where that applies.
- If an area cannot be judged, put it in "unknown" and say "Not enough evidence to confidently assess this area."
- Match every recommendation to the student's CURRENT STAGE. Never recommend advanced work when foundations are missing, and never suggest applying to senior roles for a beginner.
- Prefer evidence-producing actions ("build and publish X") over passive learning ("watch a course").
- next_best_action must be ONE specific, realistic, high-impact task tied to a real gap. Never "keep improving your skills".
- Never predict hiring outcomes or guarantee employment.
- Keep every string under 220 characters.`;

function stageGuidance(state: CareerState, readiness: Readiness): string {
  const stages = [
    "FOUNDATION",
    "SKILL BUILDING",
    "PROJECT BUILDING",
    "PORTFOLIO BUILDING",
    "APPLICATION READY",
    "INTERVIEW PREPARATION",
    "ACTIVE JOB SEARCH",
  ];
  return `Computed stage: ${readiness.stage}. Deterministic readiness: ${readiness.overall}/100 (${readiness.breakdown
    .map((b) => `${b.label} ${b.score} — ${b.explanation}`)
    .join(" | ")}).
Deterministic blockers already detected: ${
    readiness.blockers.length
      ? readiness.blockers.map((b) => `${b.problem} (${b.evidence})`).join(" | ")
      : "none"
  }.
Valid progression stages: ${stages.join(" → ")}. Recommend work appropriate to the computed stage only.
Skills with real evidence: ${
    state.skills.filter((s) => s.evidenceStrength >= 1).map((s) => s.name).join(", ") || "none"
  }.
Claimed-only skills: ${
    state.skills.filter((s) => s.evidenceStrength < 1).map((s) => s.name).join(", ") || "none"
  }.`;
}

function mapRow(row: Record<string, unknown>): CareerDiagnosis {
  return {
    id: row["id"] as string,
    createdAt: row["created_at"] as string,
    targetRole: (row["target_role"] as string | null) ?? null,
    targetJobLabel: (row["target_job_label"] as string | null) ?? null,
    stage: (row["stage"] as string | null) ?? null,
    readiness: {
      overall: (row["readiness_overall"] as number | null) ?? null,
      breakdown: (row["readiness_breakdown"] as CareerDiagnosis["readiness"]["breakdown"]) ?? [],
    },
    strengths: (row["strengths"] as string[]) ?? [],
    blockers: (row["blockers"] as DiagnosisBlocker[]) ?? [],
    priorities: (row["priorities"] as DiagnosisPriority[]) ?? [],
    nextBestAction: (row["next_best_action"] as NextBestAction | null) ?? null,
    sequence: (row["sequence"] as CareerDiagnosis["sequence"]) ?? [],
    progressNote: (row["progress_note"] as string | null) ?? null,
    evidenceSummary:
      (row["evidence_summary"] as CareerDiagnosis["evidenceSummary"]) ?? {
        demonstrated: [],
        claimed_only: [],
        unknown: [],
      },
  };
}

export async function loadLatestDiagnosis(
  supabase: Client,
  userId: string,
): Promise<CareerDiagnosis | null> {
  const { data, error } = await supabase
    .from("career_diagnoses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as unknown as Record<string, unknown>) : null;
}

/**
 * The Career Gap → Action engine. Reads the single Career State, recomputes the
 * deterministic readiness snapshot, then asks the model to explain the gaps and
 * produce ONE next best action. Nothing here invents student data.
 */
export async function runCareerDiagnosis(
  supabase: Client,
  userId: string,
): Promise<CareerDiagnosis> {
  const state = await buildCareerState(supabase, userId);
  if (!state.targetRole) {
    throw new Error(
      "Choose a target career first — CareerPilot can't diagnose gaps without a destination.",
    );
  }

  // Deterministic readiness is authoritative; the model never invents the number.
  const readiness = await saveReadiness(supabase, userId, state);
  const previous = await loadLatestDiagnosis(supabase, userId);

  const previousBlock = previous
    ? `=== PREVIOUS DIAGNOSIS (${previous.createdAt.slice(0, 10)}) ===
Blockers: ${previous.blockers.map((b) => b.problem).join("; ") || "none"}
Next best action was: ${previous.nextBestAction?.action ?? "none"}`
    : "=== PREVIOUS DIAGNOSIS ===\nNone — this is the first diagnosis.";

  const raw = await groqChat(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `=== CAREER STATE ===\n${careerStateToPrompt(state)}\n\n=== COMPUTED SIGNALS ===\n${stageGuidance(
          state,
          readiness,
        )}\n\n${previousBlock}`,
      },
    ],
    { json: true, maxTokens: 2600, temperature: 0.35 },
  );

  const out = parseJsonObject<Record<string, unknown>>(raw);

  const blockers: DiagnosisBlocker[] = (
    Array.isArray(out["blockers"]) ? (out["blockers"] as Record<string, unknown>[]) : []
  )
    .map((b) => ({
      problem: str(b["problem"], 200),
      evidence: str(b["evidence"], 300),
      why_it_matters: str(b["why_it_matters"], 300),
      impact: str(b["impact"], 300),
      fix: str(b["fix"], 300),
    }))
    .filter((b) => b.problem)
    .slice(0, 3);

  const validImpact = ["high", "medium", "low"];
  const priorities: DiagnosisPriority[] = (
    Array.isArray(out["priorities"]) ? (out["priorities"] as Record<string, unknown>[]) : []
  )
    .map((p) => {
      const impact = str(p["impact"], 10).toLowerCase();
      return {
        title: str(p["title"], 160),
        impact: (validImpact.includes(impact) ? impact : "medium") as DiagnosisPriority["impact"],
        reason: str(p["reason"], 300),
        action: str(p["action"], 300),
        evidence_to_produce: str(p["evidence_to_produce"], 300),
      };
    })
    .filter((p) => p.title)
    .slice(0, 6);

  const nbaRaw = (out["next_best_action"] as Record<string, unknown>) ?? {};
  const nextBestAction: NextBestAction | null = str(nbaRaw["action"], 240)
    ? {
        action: str(nbaRaw["action"], 240),
        why: str(nbaRaw["why"], 300),
        evidence_to_produce: str(nbaRaw["evidence_to_produce"], 300),
        estimated_effort: str(nbaRaw["estimated_effort"], 80),
      }
    : blockers[0]
      ? {
          action: blockers[0].fix,
          why: blockers[0].why_it_matters,
          evidence_to_produce: "Publish the result so it can be linked from your resume.",
          estimated_effort: "",
        }
      : null;

  const order: Record<string, CareerDiagnosis["sequence"][number]["when"]> = {
    now: "now",
    next: "next",
    after: "after",
  };
  const sequence = (Array.isArray(out["sequence"]) ? (out["sequence"] as Record<string, unknown>[]) : [])
    .map((s) => ({
      when: order[str(s["when"], 10).toLowerCase()] ?? "next",
      action: str(s["action"], 240),
    }))
    .filter((s) => s.action)
    .slice(0, 3);

  const ev = (out["evidence_summary"] as Record<string, unknown>) ?? {};
  const evidenceSummary = {
    demonstrated: stringList(ev["demonstrated"], 12),
    claimed_only: stringList(ev["claimed_only"], 12),
    unknown: stringList(ev["unknown"], 12),
  };

  const { data, error } = await supabase
    .from("career_diagnoses")
    .insert({
      user_id: userId,
      target_role: state.targetRole,
      target_job_id: state.targetJob?.id ?? null,
      target_job_label: state.targetJob
        ? `${state.targetJob.title}${state.targetJob.company ? ` @ ${state.targetJob.company}` : ""}`
        : null,
      stage: readiness.stage,
      readiness_overall: readiness.overall,
      readiness_breakdown: readiness.breakdown as never,
      strengths: stringList(out["strengths"], 6) as never,
      blockers: blockers as never,
      priorities: priorities as never,
      next_best_action: (nextBestAction ?? {}) as never,
      sequence: sequence as never,
      progress_note: previous ? str(out["progress_note"], 300) || null : null,
      evidence_summary: evidenceSummary as never,
    } as never)
    .select("*")
    .single();
  if (error) throw error;

  return mapRow(data as unknown as Record<string, unknown>);
}
