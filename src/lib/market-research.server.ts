import type { SupabaseClient } from "@supabase/supabase-js";

import {
  citationUrl,
  LAST_RESEARCHED,
  matchRoleProfile,
  PAKISTAN_MARKET,
  TOP_REJECTION_REASONS,
  type RoleTruthProfile,
  type SalaryBand,
} from "@/data/market-truth";
import { groqChat, parseJsonObject, type ChatMsg } from "./ai.server";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

/* ------------------------------------------------------------------ *
 * Market Reality · Research Layer
 *
 * Collects structured market evidence for a student's target role.
 * Kept separate from the analysis layer (market.server.ts) so the
 * evidence source can be swapped without touching presentation, as long
 * as it implements MarketResearchProvider and returns MarketEvidence.
 *
 * The default provider reads `@/data/market-truth` — researched, cited
 * data with a known collection date. It makes no network calls and costs
 * nothing to run.
 *
 * Fields the dataset does not cover are returned EMPTY on purpose. An
 * empty list is honest; a model-generated list presented as research is
 * not. `GroqResearchProvider` is retained below for comparison and is
 * explicitly NOT research — see its doc comment.
 *
 * Server-only file (.server.ts) — never imported from client code.
 * ------------------------------------------------------------------ */

export type MarketResearchQuery = {
  targetRole: string;
  targetIndustry: string | null;
  /** Optional localization filter. Global is the default view. */
  location?: string;
  education: string | null;
  experience: string | null;
};

/** Pre-loaded profile + goal data so callers can avoid duplicate DB queries. */
export type MarketResearchInputs = {
  targetRole: string;
  targetIndustry: string | null;
  education: string | null;
  experience: string | null;
};

export type MarketEvidence = {
  collectedAt: string; // ISO timestamp
  provider: string; // "market-truth-dataset" | "groq-llm" | "web-search" | etc.
  /**
   * When the underlying facts were actually researched (YYYY-MM-DD).
   * Distinct from `collectedAt`, which is only when this object was built.
   * A model recalling its training data has no meaningful research date.
   */
  researchedOn: string | null;
  pakistanMarket: {
    demand: string;
    hiringCities: string[];
    commonRequirements: string[];
    frequentTechnologies: string[];
    entryLevelExpectations: string[];
    experienceRequirements: string[];
    remoteOpportunities: string;
    patterns: string[];
  };
  globalMarket: {
    demand: string;
    commonTechnologies: string[];
    commonResponsibilities: string[];
    experienceExpectations: string[];
    remotePatterns: string[];
    pakistanVsInternational: string[];
  };
  employerEvidence: {
    recurringSkills: string[];
    recurringTechnologies: string[];
    recurringResponsibilities: string[];
    experiencePatterns: string[];
    toolsAndPlatforms: string[];
    cloudRequirements: string[];
    aiRequirements: string[];
  };
  technologySignals: {
    current: { name: string; evidence: string }[];
    stable: { name: string; evidence: string }[];
    growing: { name: string; evidence: string }[];
    emerging: { name: string; evidence: string }[];
    declining: { name: string; evidence: string }[];
  };
  aiImpact: {
    currentEvidence: string[];
    expectedEvolution: string[];
  };
  salaryInsights: {
    entryLevel: string;
    midLevel: string;
    seniorLevel: string;
    currency: string;
    notes: string[];
  };
  sources: {
    type: string;
    description: string;
    date: string;
  }[];
};

export interface MarketResearchProvider {
  collectEvidence(query: MarketResearchQuery): Promise<MarketEvidence>;
}

/* ------------------------------------------------------------------ */
/* Default provider — the researched dataset                           */
/* ------------------------------------------------------------------ */

function bandText(band: SalaryBand, label: string): string {
  const unit = band.currency === "PKR" ? "PKR" : "USD";
  const per = band.period === "month" ? "/month" : "/year";
  const range = `${band.min.toLocaleString("en-US")}–${band.max.toLocaleString("en-US")} ${unit}${per}`;
  const source = band.source ? ` [${band.source.label}]` : "";
  return `${label}: ${range}${band.note ? ` — ${band.note}` : ""}${source}`;
}

/** `statement [Source label]`, so a citation survives into the prompt and UI. */
function cited(statement: { statement: string; source: { label: string } | null }): string {
  return statement.source
    ? `${statement.statement} [${statement.source.label}]`
    : statement.statement;
}

function requirementText(entry: { skill: string; note: string | null }): string {
  return entry.note ? `${entry.skill} — ${entry.note}` : entry.skill;
}

/**
 * Builds market evidence from the researched, cited dataset.
 *
 * No network calls, no model, no cost. Deterministic for a given role, so
 * the Market Reality screen and the Flight Plan cannot disagree.
 *
 * Where the dataset genuinely has nothing (hiring cities, per-city
 * posting counts, "declining" technology verdicts) the field stays empty
 * rather than being filled in by a model. That absence is the point.
 */
export class MarketTruthProvider implements MarketResearchProvider {
  async collectEvidence(query: MarketResearchQuery): Promise<MarketEvidence> {
    const match = matchRoleProfile(query.targetRole);
    return buildDatasetEvidence(match.profile, match.isFallback);
  }
}

function buildDatasetEvidence(profile: RoleTruthProfile, isFallback: boolean): MarketEvidence {
  const scopeNote = isFallback
    ? "This role is outside the eight researched roles, so the figures below are general entry-level expectations rather than role-specific research."
    : "";

  const salaryBands = [
    bandText(profile.salary.globalRemoteUSD, "Junior, fully-remote global"),
    profile.salary.usOnSite ? bandText(profile.salary.usOnSite, "Entry level, US on-site") : null,
    ...profile.salary.additionalBands.map((entry) => bandText(entry.band, entry.label)),
  ].filter((line): line is string => line !== null);

  return {
    collectedAt: new Date().toISOString(),
    provider: "market-truth-dataset",
    researchedOn: LAST_RESEARCHED,
    pakistanMarket: {
      demand: [profile.headline, scopeNote].filter(Boolean).join(" "),
      /* The dataset names software houses as the entry path but does not
         rank hiring by city, so this stays empty rather than guessed. */
      hiringCities: [],
      commonRequirements: profile.mustHaveSkills.map(requirementText),
      frequentTechnologies: profile.commonTools.map((tool) => tool.skill),
      entryLevelExpectations: profile.portfolioExpectations.items.map(cited),
      experienceRequirements: profile.portfolioExpectations.typicalExperience
        ? [profile.portfolioExpectations.typicalExperience]
        : [],
      remoteOpportunities: profile.salary.pakistanRemoteIntl
        ? bandText(
            profile.salary.pakistanRemoteIntl,
            "Remote work for international clients pays materially more than local on-site work",
          )
        : "",
      patterns: [
        ...PAKISTAN_MARKET.hiringNorms.map(cited),
        ...profile.pakistanSpecifics.map(cited),
      ],
    },
    globalMarket: {
      demand: [profile.headline, profile.aiImpact.stabilityNote, scopeNote]
        .filter(Boolean)
        .join(" "),
      commonTechnologies: profile.commonTools.map((tool) => tool.skill),
      commonResponsibilities: profile.evidenceEmployersTrust.map(cited),
      experienceExpectations: profile.portfolioExpectations.typicalExperience
        ? [profile.portfolioExpectations.typicalExperience]
        : [],
      remotePatterns: profile.salary.pakistanRemoteIntl
        ? [bandText(profile.salary.globalRemoteUSD, "Global remote benchmark")]
        : [],
      pakistanVsInternational: [],
    },
    employerEvidence: {
      recurringSkills: profile.mustHaveSkills.map(requirementText),
      recurringTechnologies: profile.commonTools.map(requirementText),
      recurringResponsibilities: [],
      /* Why candidates get filtered out is researched; how employers phrase
         experience requirements is not. */
      experiencePatterns: [
        ...profile.whatJuniorsLack.map(cited),
        ...TOP_REJECTION_REASONS.slice(0, 3).map((reason) => `${reason.title} — ${reason.detail}`),
      ],
      toolsAndPlatforms: profile.commonTools.map((tool) => tool.skill),
      cloudRequirements: [],
      aiRequirements: profile.aiImpact.emergingSkills,
    },
    technologySignals: {
      current: profile.commonTools.map((tool) => ({
        name: tool.skill,
        evidence: tool.note ?? (tool.source ? `Researched: ${tool.source.label}` : ""),
      })),
      stable: profile.mustHaveSkills.map((skill) => ({
        name: skill.skill,
        evidence: skill.note ?? "Non-negotiable for this role — missing it ends the application.",
      })),
      growing: profile.differentiators.map((skill) => ({
        name: skill.skill,
        evidence: skill.note ?? "Researched differentiator for juniors in this role.",
      })),
      emerging: profile.aiImpact.emergingSkills.map((name) => ({
        name,
        evidence: "Growing fast enough to be a hiring differentiator right now.",
      })),
      /* We do not call a technology "declining" without a cited verdict. */
      declining: [],
    },
    aiImpact: {
      currentEvidence: profile.aiImpact.automatedByAi.map(cited),
      expectedEvolution: [...profile.aiImpact.stillValued, ...profile.aiImpact.notes.map(cited)],
    },
    salaryInsights: {
      entryLevel: salaryBands.join(" · "),
      /* The dataset researched entry level only. Saying nothing beats
         inventing mid and senior figures. */
      midLevel: "",
      seniorLevel: "",
      currency: "USD",
      notes: [
        "Global compensation varies by country, employment model, experience, and total package.",
        ...profile.salary.additionalBands.map((entry) => bandText(entry.band, entry.label)),
      ].slice(0, 4),
    },
    sources: datasetSources(profile),
  };
}

/** Real citations from the dataset, deduped, with URLs where they exist. */
function datasetSources(profile: RoleTruthProfile): MarketEvidence["sources"] {
  const citations = [
    ...profile.mustHaveSkills.map((skill) => skill.source),
    ...profile.commonTools.map((tool) => tool.source),
    ...profile.whatJuniorsLack.map((truth) => truth.source),
    ...profile.evidenceEmployersTrust.map((truth) => truth.source),
    ...profile.aiImpact.automatedByAi.map((truth) => truth.source),
    profile.salary.globalRemoteUSD.source,
    profile.salary.usOnSite?.source ?? null,
    ...profile.salary.additionalBands.map((entry) => entry.band.source),
    ...TOP_REJECTION_REASONS.flatMap((reason) => reason.sources),
  ];

  const seen = new Set<string>();
  const sources: MarketEvidence["sources"] = [];
  for (const citation of citations) {
    if (!citation || seen.has(citation.label)) continue;
    seen.add(citation.label);
    const url = citationUrl(citation);
    sources.push({
      type: url ?? "researched-source",
      description: citation.label,
      date: LAST_RESEARCHED,
    });
  }
  return sources.slice(0, 24);
}

/* ------------------------------------------------------------------ */
/* Groq-based provider — not research                                  */
/* ------------------------------------------------------------------ */

/**
 * Asks the model what it remembers about a role's market.
 *
 * This is model recall, NOT research: there is no live fetch, no source
 * that can be checked, and no meaningful "as of" date. It is kept behind
 * the provider seam so a real search provider can slot in later, but it
 * is no longer the default and its output must never be labelled
 * researched or cited in the UI.
 */
export class GroqResearchProvider implements MarketResearchProvider {
  async collectEvidence(query: MarketResearchQuery): Promise<MarketEvidence> {
    const messages: ChatMsg[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildResearchPrompt(query) },
    ];

    const raw = await groqChat(messages, {
      json: true,
      maxTokens: 4000,
      temperature: 0.3,
    });

    const data = parseJsonObject<Record<string, unknown>>(raw);
    return shapeEvidence(data);
  }
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/**
 * Collect market evidence for a student's target role.
 *
 * Accepts either:
 *  - Pre-loaded inputs (when the caller already fetched profile + goal), or
 *  - Falls back to loading them from Supabase.
 *
 * This avoids duplicate DB queries when the analysis layer has already
 * loaded the user's career goal.
 */
export async function collectMarketEvidence(
  supabase: Client,
  userId: string,
  preloaded?: MarketResearchInputs,
): Promise<MarketEvidence> {
  let inputs: MarketResearchInputs;

  if (preloaded) {
    inputs = preloaded;
  } else {
    /* Load Phase 1 inputs in parallel ------------------------------ */
    const [profileRes, goalRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("career_goals").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const profile = profileRes.data;
    const goal = goalRes.data;
    const targetRole = goal?.target_role?.trim();

    if (!targetRole) {
      throw new Error("No target role found. Please complete Phase 1 (Know Me) first.");
    }

    inputs = {
      targetRole,
      targetIndustry: goal?.target_industry ?? null,
      education: profile?.education_level ?? null,
      experience: profile?.experience ?? null,
    };
  }

  /* Build the research query ------------------------------------- */
  const query: MarketResearchQuery = {
    targetRole: inputs.targetRole,
    targetIndustry: inputs.targetIndustry,
    location: "Global",
    education: inputs.education,
    experience: inputs.experience,
  };

  /* Collect evidence --------------------------------------------- *
   * The researched dataset is the default source: cited, dated, free to
   * run and identical for every student with the same target role. Swap
   * in a real search provider here once one is available. */
  const provider: MarketResearchProvider = new MarketTruthProvider();
  return provider.collectEvidence(query);
}

/* ------------------------------------------------------------------ */
/* Prompt construction                                                 */
/* ------------------------------------------------------------------ */

function buildResearchPrompt(query: MarketResearchQuery): string {
  const lines: string[] = [];
  lines.push("Collect market evidence for this career role:");
  lines.push("");
  lines.push(`Target role: ${query.targetRole}`);
  if (query.targetIndustry) lines.push(`Target industry: ${query.targetIndustry}`);
  lines.push(`Location focus: ${query.location ?? "Global"}`);
  if (query.education) lines.push(`Candidate education level: ${query.education}`);
  if (query.experience) lines.push(`Candidate experience: ${query.experience}`);
  lines.push("");
  lines.push("Return ONLY the JSON object described in the system instructions.");
  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are a market research data collector. Your job is to collect structured market evidence about a specific career role.

CRITICAL RULES:
- Global market evidence is the primary output. Do not assume a country, city, currency, or region.
- Only provide localized market evidence when the user explicitly supplies a location filter.
- Do NOT fabricate statistics, company names, URLs, or job-posting counts.
- Do NOT fabricate percentages or exact numbers.
- Report what you reliably know about current market conditions from your training data.
- Be honest about uncertainty. If data is limited, say so.
- Focus on: current demand, employer requirements, technology landscape, hiring patterns.
- Separate global market, optional localized market, and employer evidence.
- For technology signals, classify as current/stable/growing/emerging/declining WITH a brief evidence note for each.
- Do NOT label a technology 'declining' just because it's old — only if market evidence supports that.
- For AI impact, separate what companies currently ask for vs. expected future evolution.
- Use neutral, evidence-based language.

Return a JSON object with EXACTLY this structure:
{
  "pakistanMarket": {
    "demand": "one paragraph on current demand for this role in Pakistan",
    "hiringCities": ["city1", "city2", ...],                  // 3-6 Pakistani cities where hiring concentrates
    "commonRequirements": ["requirement1", ...],              // 4-8 requirements common in Pakistani postings
    "frequentTechnologies": ["technology1", ...],             // 4-8 technologies most requested in Pakistan
    "entryLevelExpectations": ["expectation1", ...],          // 4-6 realistic entry-level expectations in Pakistan
    "experienceRequirements": ["requirement1", ...],          // 3-6 experience expectations employers state
    "remoteOpportunities": "one paragraph on remote work availability for this role from Pakistan",
    "patterns": ["pattern1", ...]                             // 3-6 hiring patterns observed in Pakistan
  },
  "globalMarket": {
    "demand": "one paragraph on global demand for this role",
    "commonTechnologies": ["technology1", ...],               // 4-8 technologies common globally
    "commonResponsibilities": ["responsibility1", ...],       // 4-8 responsibilities common globally
    "experienceExpectations": ["expectation1", ...],          // 3-6 global experience expectations
    "remotePatterns": ["pattern1", ...],                      // 3-5 remote/hybrid patterns globally
    "pakistanVsInternational": ["comparison1", ...]           // 3-5 concrete Pakistan vs international comparisons
  },
  "employerEvidence": {
    "recurringSkills": ["skill1", ...],                       // 5-8 skills recurring across postings
    "recurringTechnologies": ["technology1", ...],            // 5-8 technologies recurring across postings
    "recurringResponsibilities": ["responsibility1", ...],    // 4-8 responsibilities recurring across postings
    "experiencePatterns": ["pattern1", ...],                  // 3-6 patterns in how employers frame experience
    "toolsAndPlatforms": ["tool1", ...],                      // 4-8 tools/platforms (IDEs, CI/CD, trackers, etc.)
    "cloudRequirements": ["requirement1", ...],               // 3-6 cloud/platform requirements mentioned by employers
    "aiRequirements": ["requirement1", ...]                   // 3-6 AI-related requirements employers mention
  },
  "technologySignals": {
    "current": [ { "name": "React", "evidence": "brief evidence note" }, ... ],  // 4-8 dominant technologies right now
    "stable":   [ { "name": "...", "evidence": "..." }, ... ],  // 3-6 established, still-demanded technologies
    "growing":  [ { "name": "...", "evidence": "..." }, ... ],  // 3-6 technologies with rising adoption
    "emerging": [ { "name": "...", "evidence": "..." }, ... ],  // 2-5 early-stage technologies
    "declining":[ { "name": "...", "evidence": "..." }, ... ]   // 0-5 technologies with genuinely shrinking demand; may be empty
  },
  "aiImpact": {
    "currentEvidence": ["what employers currently ask for regarding AI tools/skills", ...],   // 3-6 items
    "expectedEvolution": ["how the role is expected to evolve because of AI", ...]            // 3-6 items
  },
  "salaryInsights": {
    "entryLevel": "typical entry-level compensation description (include PKR range if known)",
    "midLevel": "typical mid-level compensation description",
    "seniorLevel": "typical senior-level compensation description",
    "currency": "PKR",
    "notes": ["note about compensation trends, benefits, equity, etc."]  // 2-4 notes
  },
  "sources": [
    { "type": "job-boards", "description": "patterns common across general job boards", "date": "recent" },
    ...  // 2-5 source categories relied on; type is a CATEGORY (e.g. "job-boards", "tech-community", "industry-reports"), never a URL
  ]
}`;

/* ------------------------------------------------------------------ */
/* Defensive shaping                                                   */
/* ------------------------------------------------------------------ */

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown, max = 10): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

function obj(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function signalArray(v: unknown, max = 8): { name: string; evidence: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      const rec = obj(item);
      return { name: str(rec["name"]), evidence: str(rec["evidence"]) };
    })
    .filter((s) => s.name.length > 0)
    .slice(0, max);
}

function sourceArray(v: unknown, max = 6): { type: string; description: string; date: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      const rec = obj(item);
      return {
        type: str(rec["type"]),
        description: str(rec["description"]),
        date: str(rec["date"]),
      };
    })
    .filter((s) => s.type.length > 0 || s.description.length > 0)
    .slice(0, max);
}

function shapeSalaryInsights(v: unknown): MarketEvidence["salaryInsights"] {
  const sal = obj(v);
  return {
    entryLevel: str(sal["entryLevel"]),
    midLevel: str(sal["midLevel"]),
    seniorLevel: str(sal["seniorLevel"]),
    currency: str(sal["currency"]) || "PKR",
    notes: strArray(sal["notes"], 4),
  };
}

/**
 * Coerce an arbitrary parsed LLM payload into a fully-formed
 * MarketEvidence. Every field gets a safe default so the analysis
 * layer never sees undefined.
 */
function shapeEvidence(data: Record<string, unknown>): MarketEvidence {
  const pk = obj(data["pakistanMarket"]);
  const global = obj(data["globalMarket"]);
  const employer = obj(data["employerEvidence"]);
  const tech = obj(data["technologySignals"]);
  const ai = obj(data["aiImpact"]);

  return {
    collectedAt: new Date().toISOString(),
    provider: "groq-llm",
    /* Model recall has no research date. Null keeps the UI from claiming one. */
    researchedOn: null,
    pakistanMarket: {
      demand: str(pk["demand"]),
      hiringCities: strArray(pk["hiringCities"], 6),
      commonRequirements: strArray(pk["commonRequirements"], 8),
      frequentTechnologies: strArray(pk["frequentTechnologies"], 8),
      entryLevelExpectations: strArray(pk["entryLevelExpectations"], 6),
      experienceRequirements: strArray(pk["experienceRequirements"], 6),
      remoteOpportunities: str(pk["remoteOpportunities"]),
      patterns: strArray(pk["patterns"], 6),
    },
    globalMarket: {
      demand: str(global["demand"]),
      commonTechnologies: strArray(global["commonTechnologies"], 8),
      commonResponsibilities: strArray(global["commonResponsibilities"], 8),
      experienceExpectations: strArray(global["experienceExpectations"], 6),
      remotePatterns: strArray(global["remotePatterns"], 5),
      pakistanVsInternational: strArray(global["pakistanVsInternational"], 5),
    },
    employerEvidence: {
      recurringSkills: strArray(employer["recurringSkills"], 8),
      recurringTechnologies: strArray(employer["recurringTechnologies"], 8),
      recurringResponsibilities: strArray(employer["recurringResponsibilities"], 8),
      experiencePatterns: strArray(employer["experiencePatterns"], 6),
      toolsAndPlatforms: strArray(employer["toolsAndPlatforms"], 8),
      cloudRequirements: strArray(employer["cloudRequirements"], 6),
      aiRequirements: strArray(employer["aiRequirements"], 6),
    },
    technologySignals: {
      current: signalArray(tech["current"], 8),
      stable: signalArray(tech["stable"], 6),
      growing: signalArray(tech["growing"], 6),
      emerging: signalArray(tech["emerging"], 5),
      declining: signalArray(tech["declining"], 5),
    },
    aiImpact: {
      currentEvidence: strArray(ai["currentEvidence"], 6),
      expectedEvolution: strArray(ai["expectedEvolution"], 6),
    },
    salaryInsights: shapeSalaryInsights(data["salaryInsights"]),
    sources: sourceArray(data["sources"], 6),
  };
}
