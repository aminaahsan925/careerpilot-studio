/* ------------------------------------------------------------------ *
 * Market Truth — the honest source of truth for entry-level tech hiring
 *
 * Single, versioned dataset shared by Job Mirror and the Diagnostic.
 * Every skill list, percentage, salary band and quote is copied from
 * `Market Truth Report: Entry-Level Tech Hiring Expectations 2025-2026`
 * (internet research pass, lastResearched = 2026-08-31) and carries the
 * report's own attribution.  Nothing here is seeded, randomised or
 * inferred — if the research did not state it, it is not in this module.
 *
 * This is a pure data + types module: no server imports, no environment
 * variables, no secrets, no side effects.  Safe to import from
 * `*.server.ts`, server functions, and client code alike.
 *
 * Usage:
 *   import { resolveRoleProfile, TOP_REJECTION_REASONS } from "@/data/market-truth";
 *   const profile = resolveRoleProfile(goal.target_role);
 * ------------------------------------------------------------------ */

import { GENERIC_FALLBACK, ROLE_IDS, ROLE_PROFILES } from "./roles";
import type { AnyRoleId, MarketTruthRoleId, RoleMatch, RoleTruthProfile } from "./types";

/* ------------------------------------------------------------------ */
/* Re-exports — everything a consumer needs from one entry point       */
/* ------------------------------------------------------------------ */

export type {
  AiImpactProfile,
  AnyRoleId,
  Citation,
  Currency,
  DegreeWithoutEvidenceReality,
  EmployerExpectationContrast,
  EvidenceTier,
  GenericRoleId,
  LabelledSalaryBand,
  MarketSource,
  MarketTruthFieldGroup,
  MarketTruthRoleId,
  PakistanMarketTruth,
  PakistanSalaryBenchmark,
  PerceptionRealityPair,
  PortfolioExpectation,
  RefreshCadence,
  RejectionReason,
  RoleMatch,
  RoleMatchKeyword,
  RoleSalary,
  RoleTruthProfile,
  SalaryBand,
  SalaryPeriod,
  SkillRequirement,
  SourceId,
  StabilityClass,
  StabilityEntry,
  StatFact,
  TruthStatement,
} from "./types";

export { GENERIC_FALLBACK, ROLE_IDS, ROLE_PROFILES } from "./roles";

export { citationUrl, getSource, SOURCES } from "./sources";

export {
  DEGREE_WITHOUT_EVIDENCE_REALITY,
  EVIDENCE_HIERARCHY,
  PAKISTAN_GENERAL_JUNIOR_BAND,
  PAKISTAN_MARKET,
  PERCEPTION_GAP_NOTES,
  PERCEPTION_VS_REALITY,
  TOP_REJECTION_REASONS,
} from "./cross-cutting";

export {
  getStability,
  isStale,
  LAST_RESEARCHED,
  MARKET_TRUTH_PROVENANCE,
  MARKET_TRUTH_VERSION,
  refreshDueDateFor,
  STABILITY_CLASSIFICATION,
} from "./meta";

/* ------------------------------------------------------------------ */
/* Role accessors                                                      */
/* ------------------------------------------------------------------ */

/** The eight researched profiles, in report order. */
export const ALL_ROLE_PROFILES: readonly RoleTruthProfile[] = ROLE_IDS.map(
  (id) => ROLE_PROFILES[id],
);

/** Stable slug → display name, for pickers and labels. */
export const ROLE_DISPLAY_NAMES: Record<MarketTruthRoleId, string> = ROLE_IDS.reduce(
  (acc, id) => {
    acc[id] = ROLE_PROFILES[id].displayName;
    return acc;
  },
  {} as Record<MarketTruthRoleId, string>,
);

/** Ready-made option list for selects. */
export const ROLE_OPTIONS: readonly { roleId: MarketTruthRoleId; displayName: string }[] =
  ROLE_IDS.map((id) => ({ roleId: id, displayName: ROLE_PROFILES[id].displayName }));

/** Look up a researched role by its stable slug. Total — never returns undefined. */
export function getRoleProfile(roleId: MarketTruthRoleId): RoleTruthProfile {
  return ROLE_PROFILES[roleId];
}

/**
 * Look up any profile id, including the generic fallback, from an
 * untrusted string (e.g. a persisted slug). Returns `null` if unknown.
 */
export function findRoleProfileById(roleId: string): RoleTruthProfile | null {
  if (roleId === GENERIC_FALLBACK.roleId) return GENERIC_FALLBACK;
  const known = ROLE_IDS.find((id) => id === roleId);
  return known ? ROLE_PROFILES[known] : null;
}

/* ------------------------------------------------------------------ */
/* Fuzzy role resolution                                               */
/* ------------------------------------------------------------------ */

/**
 * Words that describe seniority or employment shape rather than the role
 * itself.  Removed before alias matching so "Junior Data Analyst (Remote)"
 * still resolves to the "data analyst" alias.
 */
const NOISE_WORDS = new Set([
  "junior",
  "jr",
  "senior",
  "sr",
  "mid",
  "level",
  "entry",
  "fresh",
  "fresher",
  "graduate",
  "trainee",
  "intern",
  "internship",
  "associate",
  "remote",
  "onsite",
  "hybrid",
  "freelance",
  "contract",
  "fulltime",
  "parttime",
  "position",
  "role",
  "job",
  "i",
  "ii",
  "iii",
]);

/** Minimum keyword score required to claim a match rather than fall back. */
const MIN_KEYWORD_SCORE = 3;

/**
 * Lowercase, strip punctuation, collapse whitespace.
 * "Front-End Developer (Next.js)" → "front end developer next js"
 */
function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Normalised form with seniority / employment noise removed. */
function stripNoise(normalised: string): string {
  return normalised
    .split(" ")
    .filter((word) => word.length > 0 && !NOISE_WORDS.has(word))
    .join(" ");
}

/** Word-boundary-safe phrase containment on an already-normalised string. */
function containsPhrase(haystack: string, phrase: string): boolean {
  return ` ${haystack} `.includes(` ${phrase} `);
}

/**
 * Match a free-text target role to one of the eight researched profiles.
 *
 * Deterministic and pure:
 *  1. exact alias match (after normalisation and noise-word removal),
 *  2. otherwise weighted keyword scoring, highest score wins,
 *  3. ties break towards the earlier profile in `ROLE_IDS` (report order),
 *  4. below `MIN_KEYWORD_SCORE` the generic fallback is returned rather
 *     than guessing — the dataset never pretends to know a role it has
 *     not researched.
 */
export function matchRoleProfile(targetRole: string): RoleMatch {
  const normalised = normalise(targetRole);
  const core = stripNoise(normalised);

  if (normalised.length > 0) {
    for (const roleId of ROLE_IDS) {
      const profile = ROLE_PROFILES[roleId];
      const aliasHit = profile.aliases.some((alias) => {
        const normalisedAlias = normalise(alias);
        return normalisedAlias === normalised || normalisedAlias === core;
      });
      if (aliasHit) {
        return { profile, roleId, matchedBy: "alias", score: 0, isFallback: false };
      }
    }
  }

  let best: { profile: RoleTruthProfile; roleId: MarketTruthRoleId; score: number } | null = null;

  for (const roleId of ROLE_IDS) {
    const profile = ROLE_PROFILES[roleId];
    let score = 0;
    for (const keyword of profile.matchKeywords) {
      if (containsPhrase(normalised, keyword.phrase)) {
        score += keyword.weight;
      }
    }
    // Strict `>` keeps report order as the tie-break, so results are stable.
    if (score > 0 && (best === null || score > best.score)) {
      best = { profile, roleId, score };
    }
  }

  if (best && best.score >= MIN_KEYWORD_SCORE) {
    return {
      profile: best.profile,
      roleId: best.roleId,
      matchedBy: "keywords",
      score: best.score,
      isFallback: false,
    };
  }

  return {
    profile: GENERIC_FALLBACK,
    roleId: GENERIC_FALLBACK.roleId,
    matchedBy: "fallback",
    score: best?.score ?? 0,
    isFallback: true,
  };
}

/**
 * Resolve a free-text target role (e.g. "MERN developer", "react dev",
 * "Junior UI/UX Designer") to a researched profile, or `GENERIC_FALLBACK`
 * when the role is outside the eight covered by the research.
 */
export function resolveRoleProfile(targetRole: string): RoleTruthProfile {
  return matchRoleProfile(targetRole).profile;
}

/** Resolved role id, useful as a cache key alongside `MARKET_TRUTH_VERSION`. */
export function resolveRoleId(targetRole: string): AnyRoleId {
  return matchRoleProfile(targetRole).roleId;
}
