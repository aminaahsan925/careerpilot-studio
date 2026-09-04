/* ------------------------------------------------------------------ *
 * Market Truth — dataset metadata & freshness
 *
 * Version stamp, research date, and the report's "DATA STABILITY
 * CLASSIFICATION" table mapped onto the dataset's field groups so
 * consumers can label how much to trust each number and when it is due
 * for a refresh.
 * ------------------------------------------------------------------ */

import type { MarketTruthFieldGroup, RefreshCadence, StabilityEntry } from "./types";

/**
 * Date the underlying internet research was performed.  Everything in
 * this dataset reflects the hiring market as of this date — nothing is
 * live, and nothing is generated at request time.
 */
export const LAST_RESEARCHED = "2026-08-31";

/** Dataset version. Bump on every research pass; consumers may cache against it. */
export const MARKET_TRUTH_VERSION = "2026.08.31";

/** Human-readable provenance line, safe to render in the UI. */
export const MARKET_TRUTH_PROVENANCE =
  "Market Truth Report: Entry-Level Tech Hiring Expectations 2025-2026 — 8 roles, researched 2026-08-31";

/* ------------------------------------------------------------------ */
/* Stability classification                                            */
/* ------------------------------------------------------------------ */

/** The report's stability table, one row per dataset field group. */
export const STABILITY_CLASSIFICATION: readonly StabilityEntry[] = [
  {
    fieldGroup: "mustHaveSkills",
    dataPoint: "Must-have technical skills per role",
    stability: "stable",
    refreshCadence: "annually",
    reason: "Changes over 2-3 year cycles",
  },
  {
    fieldGroup: "toolPopularity",
    dataPoint: "Tool/framework popularity rankings",
    stability: "moderately_stable",
    refreshCadence: "every_6_months",
    reason: null,
  },
  {
    fieldGroup: "aiSkillDemand",
    dataPoint: "AI skill demand percentages",
    stability: "volatile",
    refreshCadence: "quarterly",
    reason: "Changing rapidly",
  },
  {
    fieldGroup: "pakistanSalaries",
    dataPoint: "Pakistan PKR salary ranges",
    stability: "volatile",
    refreshCadence: "quarterly",
    reason: "Currency fluctuation plus inflation",
  },
  {
    fieldGroup: "usdSalaries",
    dataPoint: "USD salary ranges",
    stability: "moderately_stable",
    refreshCadence: "every_6_months",
    reason: null,
  },
  {
    fieldGroup: "whatJuniorsLack",
    dataPoint: '"What\'s missing in juniors" insights',
    stability: "stable",
    refreshCadence: "annually",
    reason: "Changes slowly",
  },
  {
    fieldGroup: "juniorHiringShare",
    dataPoint: "Junior hiring share (7% vs 15%)",
    stability: "moderately_stable",
    refreshCadence: "annually",
    reason: "Trend direction is clear",
  },
  {
    fieldGroup: "aiAutomation",
    dataPoint: "AI automation of tasks",
    stability: "volatile",
    refreshCadence: "quarterly",
    reason: null,
  },
  {
    fieldGroup: "freelanceRates",
    dataPoint: "Freelance platform rates",
    stability: "volatile",
    refreshCadence: "quarterly",
    reason: null,
  },
];

const STABILITY_BY_FIELD_GROUP: Record<MarketTruthFieldGroup, StabilityEntry> =
  STABILITY_CLASSIFICATION.reduce(
    (acc, entry) => {
      acc[entry.fieldGroup] = entry;
      return acc;
    },
    {} as Record<MarketTruthFieldGroup, StabilityEntry>,
  );

/** Stability + refresh cadence for a field group. Total — every group is classified. */
export function getStability(fieldGroup: MarketTruthFieldGroup): StabilityEntry {
  return STABILITY_BY_FIELD_GROUP[fieldGroup];
}

const CADENCE_MONTHS: Record<RefreshCadence, number> = {
  quarterly: 3,
  every_6_months: 6,
  annually: 12,
};

/**
 * ISO date (YYYY-MM-DD) on which a field group's data is due for a
 * refresh, derived from `LAST_RESEARCHED` plus its cadence.
 *
 * Pure and deterministic — it does not read the current time.  The day of
 * month is clamped so a 31st never rolls into the following month.
 */
export function refreshDueDateFor(fieldGroup: MarketTruthFieldGroup): string {
  const entry = getStability(fieldGroup);
  const researched = new Date(`${LAST_RESEARCHED}T00:00:00.000Z`);
  const targetMonth = researched.getUTCMonth() + CADENCE_MONTHS[entry.refreshCadence];
  const year = researched.getUTCFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(researched.getUTCDate(), lastDayOfMonth);
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

/** `true` when `asOf` (ISO date) is on or after the group's refresh due date. */
export function isStale(fieldGroup: MarketTruthFieldGroup, asOf: string): boolean {
  return asOf >= refreshDueDateFor(fieldGroup);
}
