import type { SupabaseClient } from "@supabase/supabase-js";

import {
  matchRoleProfile,
  TOP_REJECTION_REASONS,
  type RoleTruthProfile,
} from "@/data/market-truth";
import {
  matchCompanyTruth,
  type CompanyHiringTruth,
} from "@/data/company-truth";
import type { Database } from "@/integrations/supabase/types";
import { groqChat, parseJsonObject, stringList } from "./ai.server";
import { buildCareerState, careerStateToPrompt, type CareerState } from "./career-state.server";
import { benchmarkRole, type MarketBenchmark } from "./market-fit";
import { saveReadiness, type Readiness } from "./readiness.server";

type Client = SupabaseClient<Database>;

const str = (v: unknown, max = 300) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

export type DiagnosisBlocker = {
  problem: string;
  evidence: string;
  why_it_matters: string;
  impact: string;
  fix: string;
  biggest_bottleneck?: boolean;
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

export type CompanyRejectionDiagnosis = {
  companyId: string;
  companyName: string;
  companyTagline: string;
  rejectionRisk: number; // 0 - 100%
  riskTier: "Critical Screen-Out Risk" | "High Screen-Out Risk" | "Moderate Risk" | "Competitive Candidate";
  whyUnemployedReasons: {
    title: string;
    detail: string;
    recruiterPerspective: string;
    severity: "fatal" | "critical" | "warning";
  }[];
  whatIsLacking: {
    missingNonNegotiables: string[];
    projectDeficiencies: string[];
    cvAndAtsFlaws: string[];
  };
  prescription: {
    immediateCvFixes: string[];
    recommendedProofProject: {
      title: string;
      description: string;
      techStack: string[];
      mustHaveFeatures?: string[];
      unacceptableClones?: string[];
    };
    interviewPrepFocus: string[];
    fourWeekPlan: {
      week: number;
      focus: string;
      deliverables: string[];
    }[];
  };
};

export type CareerDiagnosis = {
  id: string;
  createdAt: string;
  targetRole: string | null;
  targetJobLabel: string | null;
  targetCompany: string | null;
  stage: string | null;
  readiness: {
    overall: number | null;
    breakdown: { label: string; score: number; explanation?: string }[];
  };
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
  marketBenchmark: MarketBenchmark | null;
  companyDiagnosis?: CompanyRejectionDiagnosis | null;
};

const SYSTEM = `You are CareerPilot's chief career diagnostician & senior technical hiring auditor.
Your mission is to deliver a brutally honest, evidence-based diagnostic answering:
1. "Why is this candidate unemployed / why will this specific company reject them right now?"
2. "What is lacking in them (missing non-negotiables, weak project proof, CV flaws)?"
3. "What exact step-by-step prescription must they execute to become employable?"

Rules of Brutal Honesty:
- Never flatter or invent strengths.
- If there are no projects or no live URLs, say: "Zero production evidence — all claims are unverified."
- If the candidate has tutorial clones (Todo, basic blog), explain why hiring managers dismiss them.
- Be concrete about the company's specific hiring bar (e.g. Systems Limited, NetSol, Arbisoft, etc.).
- Output ONLY valid JSON. Keep strings clear and high-impact.`;

/**
 * Generate a deterministic, grounded company rejection diagnosis
 * when AI is unavailable or as a baseline model.
 */
function buildDeterministicCompanyDiagnosis(
  company: CompanyHiringTruth,
  state: CareerState,
  benchmark: MarketBenchmark,
  readiness: Readiness,
): CompanyRejectionDiagnosis {
  const hasResume = state.resume.hasResume;
  const projectCount = state.projects.length;
  const verifiedSkills = state.skills.filter((s) => s.evidenceStrength >= 1).map((s) => s.name.toLowerCase());

  // Calculate rejection risk based on actual student evidence
  let riskScore = 85;
  if (hasResume) riskScore -= 10;
  if (projectCount >= 1) riskScore -= 12;
  if (projectCount >= 3) riskScore -= 10;
  riskScore -= Math.min(25, benchmark.mustHave.pct * 0.3);
  riskScore = Math.max(15, Math.min(95, Math.round(riskScore)));

  const riskTier: CompanyRejectionDiagnosis["riskTier"] =
    riskScore >= 75
      ? "Critical Screen-Out Risk"
      : riskScore >= 55
      ? "High Screen-Out Risk"
      : riskScore >= 35
      ? "Moderate Risk"
      : "Competitive Candidate";

  // Identify missing non-negotiables specifically for this company
  const missingNonNegotiables = company.hiringBar.nonNegotiables
    .filter((nn) => !verifiedSkills.some((vs) => nn.skill.toLowerCase().includes(vs) || vs.includes(nn.skill.toLowerCase())))
    .map((nn) => `${nn.skill} (${nn.whyRequired})`);

  // Build specific why-unemployed reasons grounded in candidate state
  const whyUnemployedReasons: CompanyRejectionDiagnosis["whyUnemployedReasons"] = [];

  if (projectCount === 0 && !hasResume) {
    whyUnemployedReasons.push({
      title: "Zero Tangible Evidence & Invisible to Recruiters",
      detail: `You have neither an uploaded resume nor any recorded projects. ${company.name} screening algorithms require verified technical footprints.`,
      recruiterPerspective: "We cannot invite a candidate for technical testing when there is zero public code or resume evidence.",
      severity: "fatal",
    });
  } else if (projectCount === 0) {
    whyUnemployedReasons.push({
      title: "Claims Without Project Proof",
      detail: `Your resume makes technical claims, but you have zero standalone projects proving you can ship software outside of course assignments.`,
      recruiterPerspective: `${company.name} interviewers discount unverified resume claims unless backed by public GitHub repositories with clean commits.`,
      severity: "fatal",
    });
  } else {
    whyUnemployedReasons.push({
      title: "Lack of Production-Grade Architecture",
      detail: `Your ${projectCount} project(s) lack production-level concerns like automated testing, database indexing, or containerization.`,
      recruiterPerspective: `${company.name} builds enterprise systems and rejects candidates whose projects are simple CRUD wrappers without error boundaries.`,
      severity: "critical",
    });
  }

  // Company-specific top rejection reasons
  company.rejectionTruths.slice(0, 3).forEach((truth) => {
    whyUnemployedReasons.push({
      title: truth.title,
      detail: truth.whyCompanyRejects,
      recruiterPerspective: truth.whatCandidateDidWrong,
      severity: truth.rank === 1 ? "critical" : "warning",
    });
  });

  const projectDeficiencies: string[] = [
    projectCount === 0
      ? "No public project repositories or live deployed URLs found."
      : `Projects do not demonstrate ${company.primaryStack.slice(0, 3).join(", ")} production design patterns.`,
    "Missing automated unit and integration tests (>60% test coverage).",
    "No containerization (Docker Compose) or automated CI/CD deployment pipelines.",
  ];

  const cvAndAtsFlaws: string[] = [
    !hasResume
      ? "No resume uploaded — completely blocked from initial ATS keyword parsing."
      : "Resume lists general tools rather than quantified engineering outcomes (e.g. 'Optimized query latency by 40%').",
    `Missing high-weight ATS keywords for ${company.name}: ${company.primaryStack.slice(0, 4).join(", ")}.`,
  ];

  return {
    companyId: company.id,
    companyName: company.name,
    companyTagline: company.tagline,
    rejectionRisk: riskScore,
    riskTier,
    whyUnemployedReasons: whyUnemployedReasons.slice(0, 4),
    whatIsLacking: {
      missingNonNegotiables: missingNonNegotiables.length > 0 ? missingNonNegotiables.slice(0, 4) : [company.hiringBar.nonNegotiables[0]!.skill],
      projectDeficiencies,
      cvAndAtsFlaws,
    },
    prescription: {
      immediateCvFixes: [
        "Reformat resume into single-column, ATS-friendly markdown/PDF with standard section headings.",
        `Inject ${company.name}'s non-negotiable tech keywords: ${company.primaryStack.slice(0, 3).join(", ")}.`,
        "Add live demo links and public GitHub repository URLs for every project.",
      ],
      recommendedProofProject: {
        title: company.projectExpectation.title,
        description: `Production-grade project featuring ${company.projectExpectation.mustHaveFeatures.slice(0, 3).join(", ")}. Avoid generic tutorial clones like ${company.projectExpectation.unacceptableClones.slice(0, 2).join(", ")}.`,
        techStack: company.projectExpectation.recommendedTechStack,
        mustHaveFeatures: company.projectExpectation.mustHaveFeatures,
        unacceptableClones: company.projectExpectation.unacceptableClones,
      },
      interviewPrepFocus: [
        `DSA: ${company.interviewPreparation.dsaFocus.slice(0, 3).join(", ")}`,
        `Core: ${company.interviewPreparation.coreTheory.slice(0, 3).join(", ")}`,
        `Company: ${company.interviewPreparation.behavioralKeys.slice(0, 2).join(", ")}`,
      ],
      fourWeekPlan: [
        {
          week: 1,
          focus: "CV Restructuring & Core Technical Foundations",
          deliverables: [
            "Rewrite resume using XYZ formula with live GitHub links",
            "Solve 15 LeetCode Easy/Medium problems on Arrays and HashMaps",
            "Study Database Normalization (1NF-3NF) & Indexing fundamentals",
          ],
        },
        {
          week: 2,
          focus: `Build Flagship Project for ${company.name}`,
          deliverables: [
            `Initialize ${company.projectExpectation.title} using ${company.primaryStack.slice(0, 2).join(" & ")}`,
            "Implement secure JWT authentication and role-based permissions",
            "Design normalized relational database schema with indexed foreign keys",
          ],
        },
        {
          week: 3,
          focus: "Production Polish, Testing & Deployment",
          deliverables: [
            "Write comprehensive unit test suite (>70% coverage)",
            "Containerize with Docker and set up GitHub Actions CI/CD",
            "Deploy live on cloud provider (Vercel / Render / AWS) with public API docs",
          ],
        },
        {
          week: 4,
          focus: "Interview Simulation & Targeted Applications",
          deliverables: [
            `Complete 3 mock technical interviews for ${company.name} entry roles`,
            "Prepare 2-minute architectural walk-through of your flagship project",
            `Apply directly to ${company.name} and network with engineering leads`,
          ],
        },
      ],
    },
  };
}

function mapRow(row: Record<string, unknown>): CareerDiagnosis {
  const meta = (row["market_benchmark"] as Record<string, unknown>) ?? {};
  const companyDiag = (meta["company_diagnosis"] as CompanyRejectionDiagnosis | undefined) ?? null;

  return {
    id: row["id"] as string,
    createdAt: row["created_at"] as string,
    targetRole: (row["target_role"] as string | null) ?? null,
    targetJobLabel: (row["target_job_label"] as string | null) ?? null,
    targetCompany: (row["target_company"] as string | null) ?? (meta["target_company"] as string | null) ?? null,
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
    evidenceSummary: (row["evidence_summary"] as CareerDiagnosis["evidenceSummary"]) ?? {
      demonstrated: [],
      claimed_only: [],
      unknown: [],
    },
    marketBenchmark: (meta["benchmark"] as MarketBenchmark | null) ?? readBenchmark(row["market_benchmark"]),
    companyDiagnosis: companyDiag,
  };
}

function readBenchmark(value: unknown): MarketBenchmark | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<MarketBenchmark>;
  return candidate.roleId ? (candidate as MarketBenchmark) : null;
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
  if (error) {
    console.error("[CareerPilot][loadLatestDiagnosis] database error", {
      userId,
      error: error.message,
    });
    throw error;
  }
  return data ? mapRow(data as unknown as Record<string, unknown>) : null;
}

/**
 * Runs the Enhanced Company-Specific Career Diagnosis.
 */
export async function runCareerDiagnosis(
  supabase: Client,
  userId: string,
  options: { company?: string; role?: string } = {},
): Promise<CareerDiagnosis> {
  console.info("[CareerPilot][diagnosis-engine] start", { userId, options });
  const state = await buildCareerState(supabase, userId);

  const targetRole = options.role?.trim() || state.targetRole || "Associate Software Engineer";
  const targetCompany = options.company?.trim() || state.targetJob?.company || "Systems Limited";

  const companyTruth = matchCompanyTruth(targetCompany);
  const roleMatch = matchRoleProfile(targetRole);
  const benchmark = benchmarkRole(targetRole, state.skills);
  const readiness = await saveReadiness(supabase, userId, state);
  const previous = await loadLatestDiagnosis(supabase, userId);

  // Generate the deterministic company rejection diagnosis baseline
  const deterministicCompanyDiag = buildDeterministicCompanyDiagnosis(
    companyTruth,
    state,
    benchmark,
    readiness,
  );

  let raw = "{}";
  try {
    const prompt = `=== CANDIDATE CAREER STATE ===
${careerStateToPrompt(state)}

=== TARGET ROLE & TARGET COMPANY ===
Target Role: ${targetRole}
Target Company: ${companyTruth.name} (${companyTruth.tier} - ${companyTruth.category})
Company Tagline: ${companyTruth.tagline}
Company Non-Negotiables: ${companyTruth.hiringBar.nonNegotiables.map((n) => n.skill).join(", ")}
Company Rejection Truths: ${companyTruth.rejectionTruths.map((t) => t.title).join("; ")}

=== BENCHMARK COVERAGE ===
Must-Have Skills Proven: ${benchmark.mustHave.covered}/${benchmark.mustHave.total} (${benchmark.mustHave.pct}%)
Unproven Must-Haves: ${benchmark.unprovenMustHaves.join(", ") || "none"}
Claimed Without Project Proof: ${benchmark.claimedOnlyMustHaves.join(", ") || "none"}

Return JSON with:
{
  "rejection_risk": number (0-100, estimate realistic screen-out risk at ${companyTruth.name}),
  "risk_tier": "Critical Screen-Out Risk" | "High Screen-Out Risk" | "Moderate Risk" | "Competitive Candidate",
  "strengths": string[] (2-4 true recorded strengths, empty if none),
  "why_unemployed_reasons": [
    {
      "title": string,
      "detail": string,
      "recruiter_perspective": string,
      "severity": "fatal" | "critical" | "warning"
    }
  ] (exactly 4 brutally honest reasons why ${companyTruth.name} would reject them today),
  "missing_non_negotiables": string[] (3-5 skills ${companyTruth.name} demands that candidate lacks),
  "project_deficiencies": string[] (2-4 specific flaws in project proof),
  "cv_and_ats_flaws": string[] (2-3 flaws in resume/presentation),
  "blockers": [
    {
      "problem": string,
      "evidence": string,
      "why_it_matters": string,
      "impact": string,
      "fix": string,
      "biggest_bottleneck": boolean
    }
  ],
  "priorities": [
    {
      "title": string,
      "impact": "high" | "medium" | "low",
      "reason": string,
      "action": string,
      "evidence_to_produce": string
    }
  ],
  "next_best_action": {
    "action": string,
    "why": string,
    "evidence_to_produce": string,
    "estimated_effort": string
  },
  "sequence": [
    {"when": "now", "action": string},
    {"when": "next", "action": string},
    {"when": "after", "action": string}
  ]
}`;

    raw = await groqChat(
      [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      { json: true, maxTokens: 2600, temperature: 0.35 },
    );
  } catch (err) {
    console.warn("[CareerPilot][diagnosis-engine] AI call failed, using deterministic hiring intelligence engine:", err);
    raw = "{}";
  }

  let out: Record<string, unknown> = {};
  try {
    out = parseJsonObject<Record<string, unknown>>(raw);
  } catch {
    out = {};
  }

  // Synthesize AI insights with deterministic hiring baseline
  const companyDiagnosis: CompanyRejectionDiagnosis = {
    companyId: companyTruth.id,
    companyName: companyTruth.name,
    companyTagline: companyTruth.tagline,
    rejectionRisk: typeof out["rejection_risk"] === "number" ? Math.max(10, Math.min(98, Math.round(out["rejection_risk"]))) : deterministicCompanyDiag.rejectionRisk,
    riskTier: (out["risk_tier"] as CompanyRejectionDiagnosis["riskTier"]) || deterministicCompanyDiag.riskTier,
    whyUnemployedReasons: Array.isArray(out["why_unemployed_reasons"]) && (out["why_unemployed_reasons"] as unknown[]).length > 0
      ? (out["why_unemployed_reasons"] as Record<string, unknown>[]).map((r) => ({
          title: str(r["title"], 120),
          detail: str(r["detail"], 250),
          recruiterPerspective: str(r["recruiter_perspective"], 250),
          severity: (["fatal", "critical", "warning"].includes(String(r["severity"])) ? r["severity"] : "critical") as "fatal" | "critical" | "warning",
        })).slice(0, 4)
      : deterministicCompanyDiag.whyUnemployedReasons,
    whatIsLacking: {
      missingNonNegotiables: Array.isArray(out["missing_non_negotiables"]) && (out["missing_non_negotiables"] as string[]).length > 0
        ? stringList(out["missing_non_negotiables"], 5)
        : deterministicCompanyDiag.whatIsLacking.missingNonNegotiables,
      projectDeficiencies: Array.isArray(out["project_deficiencies"]) && (out["project_deficiencies"] as string[]).length > 0
        ? stringList(out["project_deficiencies"], 4)
        : deterministicCompanyDiag.whatIsLacking.projectDeficiencies,
      cvAndAtsFlaws: Array.isArray(out["cv_and_ats_flaws"]) && (out["cv_and_ats_flaws"] as string[]).length > 0
        ? stringList(out["cv_and_ats_flaws"], 4)
        : deterministicCompanyDiag.whatIsLacking.cvAndAtsFlaws,
    },
    prescription: deterministicCompanyDiag.prescription,
  };

  const blockers: DiagnosisBlocker[] = readiness.blockers.slice(0, 3).map((blocker, index) => ({
    problem: blocker.problem,
    evidence: blocker.evidence,
    why_it_matters: blocker.impact,
    impact: blocker.impact,
    fix: blocker.action,
    biggest_bottleneck: index === 0,
  }));

  const priorities: DiagnosisPriority[] = (
    Array.isArray(out["priorities"]) ? (out["priorities"] as Record<string, unknown>[]) : []
  )
    .map((p) => {
      const impact = str(p["impact"], 10).toLowerCase();
      return {
        title: str(p["title"], 160),
        impact: (["high", "medium", "low"].includes(impact) ? impact : "medium") as DiagnosisPriority["impact"],
        reason: str(p["reason"], 300),
        action: str(p["action"], 300),
        evidence_to_produce: str(p["evidence_to_produce"], 300),
      };
    })
    .filter((p) => p.title)
    .slice(0, 6);

  if (priorities.length === 0 && blockers[0]) {
    priorities.push({
      title: blockers[0].problem,
      impact: "high",
      reason: blockers[0].why_it_matters || blockers[0].evidence || "Top detected blocker.",
      action: blockers[0].fix || blockers[0].evidence || "Produce demonstrable project evidence.",
      evidence_to_produce: blockers[0].evidence || "Add a link to the completed work as evidence.",
    });
  }

  const nbaRaw = (out["next_best_action"] as Record<string, unknown>) ?? {};
  const nextBestAction: NextBestAction = {
    action: readiness.nextAction || `Build ${companyTruth.projectExpectation.title} for ${companyTruth.name}`,
    why: str(nbaRaw["why"], 300) || blockers[0]?.why_it_matters || `${companyTruth.name} requires proof of production-grade engineering before scheduling technical rounds.`,
    evidence_to_produce: str(nbaRaw["evidence_to_produce"], 300) || "Deploy live application on cloud with public GitHub repository and documentation.",
    estimated_effort: str(nbaRaw["estimated_effort"], 80) || "2–3 weeks (15-20 hrs/week)",
  };

  const sequence = [
    { when: "now" as const, action: `Fix CV ATS format & address ${companyTruth.name} keywords` },
    { when: "next" as const, action: `Build & deploy ${companyTruth.projectExpectation.title}` },
    { when: "after" as const, action: `Practice DSA (${companyTruth.interviewPreparation.dsaFocus[0]}) & apply` },
  ];

  const demonstrated = state.skills
    .filter((skill) => skill.sources.some((source) => source === "github" || source === "project"))
    .map((skill) => skill.name);
  const claimedOnly = state.skills
    .filter((skill) => !skill.sources.some((source) => source !== "claim"))
    .map((skill) => skill.name);
  const evidenceSummary = {
    demonstrated: demonstrated.slice(0, 12),
    claimed_only: claimedOnly.slice(0, 12),
    unknown: state.gaps.filter((gap) => gap.status === "missing").map((gap) => gap.skill).slice(0, 12),
  };

  const compositeBenchmark = {
    ...benchmark,
    benchmark,
    target_company: companyTruth.name,
    company_diagnosis: companyDiagnosis,
  };

  const { data, error } = await supabase
    .from("career_diagnoses")
    .insert({
      user_id: userId,
      target_role: targetRole,
      target_job_label: `${targetRole} @ ${companyTruth.name}`,
      stage: readiness.stage,
      readiness_overall: readiness.overall,
      readiness_breakdown: readiness.breakdown as never,
      strengths: stringList(out["strengths"], 5) as never,
      blockers: blockers as never,
      priorities: priorities as never,
      next_best_action: nextBestAction as never,
      sequence: sequence as never,
      progress_note: previous ? str(out["progress_note"], 300) || null : null,
      evidence_summary: evidenceSummary as never,
      market_benchmark: compositeBenchmark as never,
    } as never)
    .select("*")
    .single();

  if (error) {
    console.error("[CareerPilot][diagnosis-engine] database insert error", error);
    throw error;
  }

  return mapRow(data as unknown as Record<string, unknown>);
}
