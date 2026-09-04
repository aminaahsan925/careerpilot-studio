/* ------------------------------------------------------------------ *
 * Market Truth — internal builders
 *
 * Tiny pure constructors that keep the dataset files readable while
 * guaranteeing every record is fully populated (explicit `null` instead
 * of absent keys, so consumers never deal with `undefined`).
 * ------------------------------------------------------------------ */

import type { Citation, SalaryBand, SkillRequirement, StatFact, TruthStatement } from "./types";

/** A skill / tool expectation, optionally with the report's qualifier and source. */
export function skill(name: string, note?: string, source?: Citation): SkillRequirement {
  return { skill: name, note: note ?? null, source: source ?? null };
}

/** A market claim, optionally attributed. */
export function truth(statement: string, source?: Citation): TruthStatement {
  return { statement, source: source ?? null };
}

/** A quantified fact. Pass `numeric`/`unit` only when the value is a single number. */
export function stat(
  label: string,
  value: string,
  detail: string,
  source?: Citation,
  numeric?: number,
  unit?: string,
): StatFact {
  return {
    label,
    value,
    numeric: numeric ?? null,
    unit: unit ?? null,
    detail,
    source: source ?? null,
  };
}

/** Monthly PKR band (the unit every Pakistan salary in the report uses). */
export function pkrMonth(min: number, max: number, source: Citation, note?: string): SalaryBand {
  return { min, max, currency: "PKR", period: "month", source, note: note ?? null };
}

/** Annual USD band (the unit every US / global-remote salary in the report uses). */
export function usdYear(min: number, max: number, source: Citation, note?: string): SalaryBand {
  return { min, max, currency: "USD", period: "year", source, note: note ?? null };
}
