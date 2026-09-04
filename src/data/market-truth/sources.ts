/* ------------------------------------------------------------------ *
 * Market Truth — source registry
 *
 * The "KEY SOURCES" section of the research report, plus the shorthand
 * citation constants used throughout the dataset.  Nothing here is
 * generated: every entry is a source that was actually consulted for the
 * 2026-08-31 research pass.
 * ------------------------------------------------------------------ */

import type { Citation, MarketSource, SourceId } from "./types";

/** The report's KEY SOURCES, in the order it lists them. */
export const SOURCES: readonly MarketSource[] = [
  {
    id: "only-frontend-jobs-2026",
    name: "OnlyFrontendJobs 2026",
    url: "https://www.onlyfrontendjobs.com/blog/most-in-demand-frontend-skills-2026",
    focus: "Analysis of 3,000+ frontend job postings — skill demand percentages and YoY growth",
  },
  {
    id: "ardura-consulting-2026",
    name: "Ardura Consulting 2026",
    url: "https://ardura.consulting/blog/junior-developer-crisis-2026-why-companies-stopped-hiring-entry-level/",
    focus:
      "Junior hiring crisis report — ATS rejection rate, inflated requirements, certificate saturation",
  },
  {
    id: "stack-overflow-2025",
    name: "Stack Overflow Blog / Developer Survey 2025",
    url: "https://survey.stackoverflow.co/2025/",
    focus: "AI usage among developers, CS graduate employment data, technology rankings",
  },
  {
    id: "paktechjobs-2026",
    name: "PakTechJobs 2026",
    url: "https://www.paktechjobs.com/salaries",
    focus: "Pakistan salary data by role, city and experience level",
  },
  {
    id: "mentorcruise-2026",
    name: "MentorCruise 2026",
    url: "https://mentorcruise.com/blog/entry-level-ux-designer-jobs-in-2026-what-actually-gets-you-hired/",
    focus: "Entry-level UX designer hiring market analysis",
  },
  {
    id: "crosscheck-2026",
    name: "Crosscheck 2026",
    url: "https://crosscheck.cloud/blogs/how-to-become-qa-engineer-2026/",
    focus: "QA engineer roadmap, framework adoption and salary data",
  },
  {
    id: "sprout-2026",
    name: "Sprout 2026",
    url: "https://www.usesprout.com/blog/entry-level-data-analyst-jobs",
    focus: "Entry-level data analyst guide — required skills and salary benchmarks",
  },
  {
    id: "dev-community-fullstack-2026",
    name: "DEV Community full-stack posting review 2026",
    url: "https://dev.to/francistrdev/i-reviewed-full-stack-job-postings-for-2026-here-is-what-they-are-looking-for-49ie",
    focus: "Review of 2026 full-stack job postings — expected stack",
  },
  {
    id: "stanford-digital-economy",
    name: "Stanford Digital Economy Study",
    url: null,
    focus: "Employment decline for developers aged 22-25 since the late-2022 peak",
  },
  {
    id: "jetbrains-2025",
    name: "JetBrains, October 2025",
    url: null,
    focus: "85% of developers regularly use AI tools for coding",
  },
  {
    id: "salary-aggregators",
    name: "Glassdoor / Levels.fyi / PayScale + Indeed, LinkedIn, ZipRecruiter listings",
    url: null,
    focus: "Salary aggregation and live listing ranges across roles and markets",
  },
] as const;

const SOURCE_INDEX: Record<SourceId, MarketSource> = SOURCES.reduce(
  (acc, source) => {
    acc[source.id] = source;
    return acc;
  },
  {} as Record<SourceId, MarketSource>,
);

/** Look up a KEY SOURCE by id. Total — every `SourceId` is registered. */
export function getSource(id: SourceId): MarketSource {
  return SOURCE_INDEX[id];
}

/** Resolve a citation to a linkable URL, when the underlying source has one. */
export function citationUrl(citation: Citation): string | null {
  return citation.sourceId ? SOURCE_INDEX[citation.sourceId].url : null;
}

/**
 * Build a citation.
 *
 * `label` must reproduce how the research report attributes the claim;
 * `sourceId` is supplied only when that attribution is one of the KEY SOURCES.
 */
export function cite(label: string, sourceId?: SourceId): Citation {
  return { label, sourceId: sourceId ?? null };
}

/* ------------------------------------------------------------------ */
/* Shorthand citations used repeatedly across the dataset             */
/* ------------------------------------------------------------------ */

export const C = {
  onlyFrontendJobs: cite(
    "OnlyFrontendJobs 2026 analysis of 3,000+ postings",
    "only-frontend-jobs-2026",
  ),
  ardura: cite("Ardura Consulting 2026", "ardura-consulting-2026"),
  stackOverflow: cite("Stack Overflow Blog / Developer Survey 2025", "stack-overflow-2025"),
  pakTechJobs: cite("PakTechJobs 2026", "paktechjobs-2026"),
  mentorCruise: cite("MentorCruise 2026", "mentorcruise-2026"),
  crosscheck: cite("Crosscheck 2026 QA roadmap", "crosscheck-2026"),
  sprout: cite("Sprout 2026 entry-level data analyst guide", "sprout-2026"),
  devFullStack: cite(
    "DEV Community full-stack posting review 2026",
    "dev-community-fullstack-2026",
  ),
  stanford: cite("Stanford Digital Economy Study", "stanford-digital-economy"),
  jetBrains: cite("JetBrains, October 2025", "jetbrains-2025"),
  /** Used where the report quotes a range without naming a single publisher. */
  aggregators: cite(
    "Glassdoor / Levels.fyi / PayScale and Indeed, LinkedIn, ZipRecruiter listings",
    "salary-aggregators",
  ),
} as const;
