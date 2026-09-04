/* ------------------------------------------------------------------ *
 * Market Truth — type contracts
 *
 * Shape definitions for the versioned "market truth" dataset: the
 * honest, sourced source of truth about entry-level tech hiring that
 * both Job Mirror and the Diagnostic read from.
 *
 * Data provenance: `Market Truth Report: Entry-Level Tech Hiring
 * Expectations 2025-2026` (internet research, 8 roles + cross-cutting
 * truths).  Every quantitative claim in the dataset carries a
 * `Citation`.  See `LAST_RESEARCHED` / `SOURCES` in ./index.ts.
 *
 * Pure types only — no runtime values, no imports.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Sources & citations                                                 */
/* ------------------------------------------------------------------ */

/** Stable ids for the report's "KEY SOURCES" section. */
export type SourceId =
  | "only-frontend-jobs-2026"
  | "ardura-consulting-2026"
  | "stack-overflow-2025"
  | "paktechjobs-2026"
  | "mentorcruise-2026"
  | "crosscheck-2026"
  | "sprout-2026"
  | "dev-community-fullstack-2026"
  | "stanford-digital-economy"
  | "jetbrains-2025"
  | "salary-aggregators";

export type MarketSource = {
  id: SourceId;
  /** Display name, as cited in the research report. */
  name: string;
  /** Canonical URL, or `null` when the report cites a study without a link. */
  url: string | null;
  /** What this source is used for in the dataset. */
  focus: string;
};

/**
 * Attribution attached to a data point.
 *
 * `label` is the attribution exactly as the research report words it.
 * `sourceId` is set when that attribution maps to one of the KEY SOURCES,
 * so the UI can render a real link; secondary citations (a one-off Medium
 * analysis, a LinkedIn discussion, …) keep `sourceId: null`.
 */
export type Citation = {
  label: string;
  sourceId: SourceId | null;
};

/** A claim plus its attribution (`source: null` when the report states it unattributed). */
export type TruthStatement = {
  statement: string;
  source: Citation | null;
};

/** A quantified fact, kept machine-readable so the UI can chart or highlight it. */
export type StatFact = {
  label: string;
  /** Human-readable value, e.g. "6.1%" or "50,000+". */
  value: string;
  /** Numeric form when the value is a single number, else `null`. */
  numeric: number | null;
  /** Unit for `numeric`, e.g. "percent", "people", "percentage_points". */
  unit: string | null;
  detail: string;
  source: Citation | null;
};

/* ------------------------------------------------------------------ */
/* Skills                                                             */
/* ------------------------------------------------------------------ */

/**
 * A single skill / tool / differentiator expectation.
 *
 * `note` carries the report's qualifier verbatim where one exists
 * (e.g. TypeScript → "required by 71% of job postings").
 */
export type SkillRequirement = {
  skill: string;
  note: string | null;
  source: Citation | null;
};

/* ------------------------------------------------------------------ */
/* Salary                                                             */
/* ------------------------------------------------------------------ */

export type Currency = "PKR" | "USD";
export type SalaryPeriod = "month" | "year";

export type SalaryBand = {
  min: number;
  max: number;
  currency: Currency;
  period: SalaryPeriod;
  source: Citation;
  note: string | null;
};

/** An extra band the report reports alongside the main markets (e.g. "US — SDET"). */
export type LabelledSalaryBand = {
  label: string;
  band: SalaryBand;
};

export type RoleSalary = {
  /** Junior, on-site in Pakistan (PKR/month). */
  pakistanOnSite: SalaryBand;
  /** Based in Pakistan, working remotely for international clients (PKR/month). */
  pakistanRemoteIntl?: SalaryBand;
  /** Junior fully-remote global roles (USD/year). */
  globalRemoteUSD: SalaryBand;
  /** Entry level, on-site in the US (USD/year). */
  usOnSite?: SalaryBand;
  /** Specialisations / hubs the report calls out separately. */
  additionalBands: LabelledSalaryBand[];
};

/* ------------------------------------------------------------------ */
/* AI impact & portfolio                                              */
/* ------------------------------------------------------------------ */

export type AiImpactProfile = {
  /** Tasks AI has taken over — the work juniors used to be hired for. */
  automatedByAi: TruthStatement[];
  /** What still earns a junior a seat at the table. */
  stillValued: string[];
  /** Skills growing fast enough to be a hiring differentiator right now. */
  emergingSkills: string[];
  /** The report's "Stability:" verdict for this role's demand. */
  stabilityNote: string;
  /** Sourced market observations that qualify the above. */
  notes: TruthStatement[];
};

export type PortfolioExpectation = {
  /** Years of experience the market treats as "true entry level", when stated. */
  typicalExperience: string | null;
  items: TruthStatement[];
};

/* ------------------------------------------------------------------ */
/* Role profile                                                       */
/* ------------------------------------------------------------------ */

/** The eight researched roles. */
export type MarketTruthRoleId =
  | "frontend-react"
  | "backend-node-python"
  | "full-stack"
  | "data-analyst-scientist"
  | "mobile-flutter-react-native"
  | "devops-cloud"
  | "qa-automation"
  | "ui-ux-design";

/** Profile used when a free-text target role matches none of the eight. */
export type GenericRoleId = "generic-tech-role";

export type AnyRoleId = MarketTruthRoleId | GenericRoleId;

/** A weighted phrase used by `resolveRoleProfile` for fuzzy matching. */
export type RoleMatchKeyword = {
  /** Normalised phrase (lowercase, single-spaced, alphanumeric only). */
  phrase: string;
  /** Higher wins. 5-6 = names the role, 3-4 = strong signal, 1-2 = weak signal. */
  weight: number;
};

export type RoleTruthProfile = {
  roleId: AnyRoleId;
  displayName: string;
  /** One-line honest framing of the role's entry-level market. */
  headline: string;
  /** Free-text job titles that should resolve to this profile. */
  aliases: string[];
  /** Weighted keywords for fuzzy resolution when no alias matches. */
  matchKeywords: RoleMatchKeyword[];
  /** Non-negotiables. Missing one of these ends the application. */
  mustHaveSkills: SkillRequirement[];
  /** Tools that show up across postings for this role. */
  commonTools: SkillRequirement[];
  /** Nice-to-haves that actually make a junior stand out. */
  differentiators: SkillRequirement[];
  /** Why juniors get filtered out of this specific role. */
  whatJuniorsLack: TruthStatement[];
  /** Proof employers accept as real, in this role's terms. */
  evidenceEmployersTrust: TruthStatement[];
  portfolioExpectations: PortfolioExpectation;
  salary: RoleSalary;
  aiImpact: AiImpactProfile;
  /** Pakistan-specific hiring reality for this role (may be short — only what the report states). */
  pakistanSpecifics: TruthStatement[];
};

/* ------------------------------------------------------------------ */
/* Cross-cutting truths                                               */
/* ------------------------------------------------------------------ */

export type RejectionReason = {
  /** 1 = the report's top reason. */
  rank: number;
  title: string;
  detail: string;
  /** Supporting numbers, machine-readable where possible. */
  stats: StatFact[];
  sources: Citation[];
};

export type DegreeWithoutEvidenceReality = {
  headline: string;
  stats: StatFact[];
  /** Employer-side quotes the report reproduces. */
  quotes: TruthStatement[];
};

/** One tier of the evidence hierarchy. `rank: 1` is the strongest proof. */
export type EvidenceTier = {
  rank: number;
  label: string;
  detail: string;
};

export type PerceptionRealityPair = {
  studentsThink: string;
  employersCheck: string;
};

export type PakistanSalaryBenchmark = {
  role: string;
  /** Monthly PKR. */
  min: number;
  max: number;
  currency: "PKR";
  period: "month";
  /** City the figure is quoted for, when the report specifies one. */
  city: string | null;
  source: Citation;
};

export type EmployerExpectationContrast = {
  dimension: string;
  pakistaniEmployers: string;
  internationalClients: string;
};

export type PakistanMarketTruth = {
  hiringNorms: TruthStatement[];
  /** Software houses the report names as the primary entry path. */
  softwareHouses: string[];
  juniorSalaryBenchmarks: PakistanSalaryBenchmark[];
  freelanceReality: TruthStatement[];
  employerVsInternationalClient: EmployerExpectationContrast[];
};

/* ------------------------------------------------------------------ */
/* Stability / freshness metadata                                     */
/* ------------------------------------------------------------------ */

export type StabilityClass = "stable" | "moderately_stable" | "volatile";

export type RefreshCadence = "quarterly" | "every_6_months" | "annually";

/** Groups of dataset fields that age at the same rate. */
export type MarketTruthFieldGroup =
  | "mustHaveSkills"
  | "toolPopularity"
  | "aiSkillDemand"
  | "pakistanSalaries"
  | "usdSalaries"
  | "whatJuniorsLack"
  | "juniorHiringShare"
  | "aiAutomation"
  | "freelanceRates";

export type StabilityEntry = {
  fieldGroup: MarketTruthFieldGroup;
  /** The data point as the report's stability table names it. */
  dataPoint: string;
  stability: StabilityClass;
  refreshCadence: RefreshCadence;
  /** Why it moves (or doesn't). */
  reason: string | null;
};

/* ------------------------------------------------------------------ */
/* Role resolution                                                    */
/* ------------------------------------------------------------------ */

export type RoleMatch = {
  profile: RoleTruthProfile;
  roleId: AnyRoleId;
  /** How the match was made. */
  matchedBy: "alias" | "keywords" | "fallback";
  /** Accumulated keyword weight (0 for alias hits and fallbacks). */
  score: number;
  /** True when no researched role matched and GENERIC_FALLBACK was returned. */
  isFallback: boolean;
};
