/* ------------------------------------------------------------------ *
 * Market Truth — cross-cutting hiring reality
 *
 * The report's "CROSS-CUTTING BRUTAL TRUTHS" and "PAKISTAN-MARKET
 * SPECIFIC REALITY" sections: findings that apply to every entry-level
 * tech role rather than to one of the eight profiles.
 *
 * Copied from `Market Truth Report: Entry-Level Tech Hiring Expectations
 * 2025-2026` (research pass 2026-08-31).  No figure here is estimated.
 * ------------------------------------------------------------------ */

import { pkrMonth, stat, truth } from "./builders";
import { C, cite } from "./sources";
import type {
  DegreeWithoutEvidenceReality,
  EvidenceTier,
  PakistanMarketTruth,
  PerceptionRealityPair,
  RejectionReason,
  TruthStatement,
} from "./types";

/* ------------------------------------------------------------------ */
/* Top reasons entry-level candidates get rejected (2025-2026)         */
/* ------------------------------------------------------------------ */

export const TOP_REJECTION_REASONS: readonly RejectionReason[] = [
  {
    rank: 1,
    title: "No evidence of real work",
    detail:
      'Tutorial projects, todo apps and calculator clones are "tutorial artifacts, not proof of skill". Recruiters cannot distinguish you from 10,000 other bootcamp graduates.',
    stats: [],
    sources: [cite("Gitconnected"), C.mentorCruise],
  },
  {
    rank: 2,
    title: "The junior hiring pipeline is broken",
    detail:
      "Companies have structurally reduced the number of juniors they take on, so the entry-level funnel itself has narrowed.",
    stats: [
      stat(
        "Share of juniors in new IT hires",
        "15% → 7%",
        "Dropped from 15% to 7% in three years",
        C.ardura,
        7,
        "percent",
      ),
      stat(
        "Junior hiring at high-AI-adoption companies",
        "-13%",
        "Companies that adopt AI at higher rates hire 13% fewer juniors",
        C.ardura,
        13,
        "percent",
      ),
      stat(
        "Entry-level tech hiring, 2024",
        "-25% YoY",
        "Entry-level tech hiring decreased 25% year over year in 2024",
        C.ardura,
        25,
        "percent",
      ),
      stat(
        "Employment for developers aged 22-25",
        "-20%",
        "Declined nearly 20% from its late-2022 peak",
        C.stanford,
        20,
        "percent",
      ),
    ],
    sources: [C.ardura, C.stackOverflow, C.stanford],
  },
  {
    rank: 3,
    title: "70% of applications are rejected by ATS before a human sees them",
    detail: "Keyword matching matters. Tailoring your resume to each posting is not optional.",
    stats: [
      stat(
        "Applications filtered by ATS",
        "70%",
        "Rejected automatically before any human review",
        C.ardura,
        70,
        "percent",
      ),
    ],
    sources: [C.ardura],
  },
  {
    rank: 4,
    title: '"3 years experience" for a "junior" role is the norm',
    detail: "When 500 people apply for one position, recruiters inflate requirements.",
    stats: [
      stat(
        'Postings labelled "entry-level" DevOps that truly are',
        "5%",
        'Analysis of 500 "entry-level" DevOps postings found only 5% were genuinely entry-level',
        cite("Medium / Osomude Yazudonu 2025"),
        5,
        "percent",
      ),
    ],
    sources: [C.ardura, cite("Medium / Osomude Yazudonu 2025")],
  },
  {
    rank: 5,
    title: "Cannot explain their own code",
    detail:
      "Hiring managers report that candidates who built projects with AI assistance cannot explain architectural decisions, debug without the AI tool, or discuss trade-offs.",
    stats: [],
    sources: [C.stackOverflow],
  },
  {
    rank: 6,
    title: "No Git or deployment experience",
    detail:
      "Everything runs on localhost. No understanding of CI/CD, environment variables or production concerns.",
    stats: [],
    sources: [],
  },
  {
    rank: 7,
    title: "AI is replacing the training ground",
    detail:
      "Tasks traditionally assigned to juniors — boilerplate code, simple refactoring, unit test generation, code documentation, simple debugging — are now done by AI tools.",
    stats: [
      stat(
        "Developers regularly using AI tools for coding",
        "85%",
        "The junior training ground is being absorbed by tooling this widely adopted",
        C.jetBrains,
        85,
        "percent",
      ),
    ],
    sources: [C.jetBrains],
  },
];

/* ------------------------------------------------------------------ */
/* Why "degree but no evidence" fails                                  */
/* ------------------------------------------------------------------ */

export const DEGREE_WITHOUT_EVIDENCE_REALITY: DegreeWithoutEvidenceReality = {
  headline:
    'Certificates and degrees have become "necessary but not sufficient" — everyone has them, so none of them differentiates.',
  stats: [
    stat(
      "CS graduate unemployment rate (US)",
      "6.1%",
      "Nearly one percentage point higher than liberal arts graduates",
      cite(
        "Federal Reserve labor market report via Stack Overflow Blog 2025",
        "stack-overflow-2025",
      ),
      6.1,
      "percent",
    ),
    stat(
      "CS graduates competing annually in Pakistan",
      "50,000+",
      "Over 50,000 CS graduates compete for far fewer relevant vacancies each year",
      cite("LinkedIn / Mahirah Naz analysis"),
      50_000,
      "graduates",
    ),
  ],
  quotes: [
    truth(
      'Certificates and degrees have become "necessary but not sufficient" — everyone has them, so none differentiates',
      C.ardura,
    ),
    truth(
      '"When everyone has an AWS/Azure/GCP certificate, none of them is a differentiator. Companies are looking for evidence of practical experience."',
      C.ardura,
    ),
  ],
};

/* ------------------------------------------------------------------ */
/* Evidence hierarchy — strongest to weakest                           */
/* ------------------------------------------------------------------ */

/** Ordered by `rank`: 1 is the strongest proof of skill, 7 the weakest. */
export const EVIDENCE_HIERARCHY: readonly EvidenceTier[] = [
  {
    rank: 1,
    label: "Production code at a real company",
    detail: "Internship or job — code that shipped to real users under review",
  },
  {
    rank: 2,
    label: "Deployed side projects with real users",
    detail: "Live, reachable, and used by someone other than you",
  },
  {
    rank: 3,
    label: "Open-source contributions with merged PRs",
    detail: "Merged, not opened — someone else accepted your work",
  },
  {
    rank: 4,
    label: "Published apps",
    detail: "App Store / Play Store — you completed a real release process",
  },
  {
    rank: 5,
    label: "Project portfolio with documentation and clean code",
    detail: "Readable code, meaningful commits, a README that explains decisions",
  },
  {
    rank: 6,
    label: "Certifications",
    detail: "Only as a supplement to the above, never as a replacement",
  },
  {
    rank: 7,
    label: "Degree",
    detail: "A baseline requirement, not a differentiator",
  },
];

/* ------------------------------------------------------------------ */
/* Perception vs reality                                               */
/* ------------------------------------------------------------------ */

/** The report's "What Students Think Matters" vs "What Employers Actually Check" table. */
export const PERCEPTION_VS_REALITY: readonly PerceptionRealityPair[] = [
  { studentsThink: "GPA", employersCheck: "Working deployed projects" },
  {
    studentsThink: "Degree from a prestigious university",
    employersCheck: "Can they explain their code and decisions?",
  },
  {
    studentsThink: "Number of certificates",
    employersCheck: "GitHub with real commit history showing progression",
  },
  {
    studentsThink: "List of technologies on the resume",
    employersCheck: "Can they solve a problem they haven't seen before?",
  },
  {
    studentsThink: "Tutorial completion badges",
    employersCheck: "Internship experience / real client work",
  },
  {
    studentsThink: '"I know React, Node, MongoDB…"',
    employersCheck: "Can they build and deploy something end-to-end?",
  },
  {
    studentsThink: "Broad technology exposure",
    employersCheck: "Deep expertise in one stack",
  },
];

/** The report's "Gap Between Student Perception and Employer Reality" notes. */
export const PERCEPTION_GAP_NOTES: readonly TruthStatement[] = [
  truth(
    'Students optimise for breadth ("I know 15 technologies"); employers want depth ("Can you build a production feature in one stack?")',
  ),
  truth(
    "Students spend money on more certificates; employers want one strong portfolio piece reviewed by someone with hiring experience",
  ),
  truth(
    "Students mass-apply to 300+ jobs; evidence shows 5 targeted applications with warm introductions outperform 100 cold applications",
    C.mentorCruise,
  ),
  truth(
    'Students fear they need to know everything; employers fear juniors who learned from AI and "don\'t understand fundamentals because they never practiced them"',
    C.ardura,
  ),
];

/* ------------------------------------------------------------------ */
/* Pakistan market                                                     */
/* ------------------------------------------------------------------ */

export const PAKISTAN_MARKET: PakistanMarketTruth = {
  hiringNorms: [
    truth(
      "50,000+ CS graduates annually compete for far fewer positions. The local market is intensely competitive.",
      cite("LinkedIn Pakistan industry analysis"),
    ),
    truth(
      "Software houses remain the primary entry path — they hire juniors under senior supervision",
    ),
    truth(
      'Startups in Pakistan hire selectively; "full-stack" roles dominate Lahore, Karachi and Islamabad',
    ),
    truth("MERN stack is the dominant local hiring stack"),
  ],
  softwareHouses: ["Arbisoft", "Systems Ltd", "10Pearls", "VentureDive", "Netsol", "TPS"],
  juniorSalaryBenchmarks: [
    {
      role: "MERN Developer",
      min: 40_000,
      max: 80_000,
      currency: "PKR",
      period: "month",
      city: null,
      source: C.pakTechJobs,
    },
    {
      role: "React Developer",
      min: 40_000,
      max: 75_000,
      currency: "PKR",
      period: "month",
      city: "Lahore",
      source: C.pakTechJobs,
    },
    {
      role: "Backend Developer",
      min: 50_000,
      max: 90_000,
      currency: "PKR",
      period: "month",
      city: "Karachi",
      source: C.pakTechJobs,
    },
    {
      role: "Full Stack Developer",
      min: 45_000,
      max: 90_000,
      currency: "PKR",
      period: "month",
      city: null,
      source: C.pakTechJobs,
    },
    {
      role: "AI/ML Engineer",
      min: 60_000,
      max: 120_000,
      currency: "PKR",
      period: "month",
      city: null,
      source: C.pakTechJobs,
    },
    {
      role: "DevOps Engineer",
      min: 60_000,
      max: 110_000,
      currency: "PKR",
      period: "month",
      city: null,
      source: C.pakTechJobs,
    },
    {
      role: "Data Scientist",
      min: 55_000,
      max: 110_000,
      currency: "PKR",
      period: "month",
      city: null,
      source: C.pakTechJobs,
    },
    {
      role: "Software Engineer (general)",
      min: 40_000,
      max: 90_000,
      currency: "PKR",
      period: "month",
      city: null,
      source: C.pakTechJobs,
    },
  ],
  freelanceReality: [
    truth(
      "Pakistan's freelance market was expected to reach $2 billion by 2025",
      cite("Facebook / Pakistan Connect"),
    ),
    truth(
      "Upwork and Fiverr are the major platforms; web development, mobile development and graphic design are the top categories",
    ),
    truth(
      "Success-story pattern: moving from PKR 70,000/month locally to $70,000/year remotely is achievable with 2-3 years experience and strong English",
      cite("FreelanceHeroPakistan"),
    ),
    truth(
      "The $1,000/month freelance milestone is achievable within months for web development, graphic design or digital marketing skills",
      cite("Facebook Enablers community"),
    ),
    truth(
      "International clients pay 2-4x local rates but require strong written English, self-management, time-zone flexibility and portfolio evidence",
    ),
  ],
  employerVsInternationalClient: [
    {
      dimension: "Preferred stack",
      pakistaniEmployers: "MERN / MEAN stack",
      internationalClients: "Specific stack mastery (React + Next.js, Python + FastAPI)",
    },
    {
      dimension: "Credentials",
      pakistaniEmployers: "Degree from a recognised university",
      internationalClients: "Portfolio and GitHub over credentials",
    },
    {
      dimension: "Work mode",
      pakistaniEmployers: "In-office or hybrid",
      internationalClients: "Self-managed, async communication",
    },
    {
      dimension: "English level",
      pakistaniEmployers: "Basic English acceptable",
      internationalClients: "B2+ English required",
    },
    {
      dimension: "Ramp-up expectation",
      pakistaniEmployers: "Willing to train gradually",
      internationalClients: "Expect productivity from week 1",
    },
    {
      dimension: "Compensation",
      pakistaniEmployers: "PKR 40-90K/month",
      internationalClients: "$500-2,000/month for juniors",
    },
  ],
};

/**
 * The general "Software Engineer" junior benchmark, kept separately so
 * consumers can show a market-wide band without picking a role.
 */
export const PAKISTAN_GENERAL_JUNIOR_BAND = pkrMonth(
  40_000,
  90_000,
  C.pakTechJobs,
  "Software Engineer (general), junior",
);
