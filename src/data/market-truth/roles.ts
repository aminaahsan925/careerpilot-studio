/* ------------------------------------------------------------------ *
 * Market Truth — per-role hiring reality (8 researched roles)
 *
 * Every figure, skill list, salary range and quote below is copied from
 * `Market Truth Report: Entry-Level Tech Hiring Expectations 2025-2026`
 * (research pass 2026-08-31).  Nothing here is generated, estimated or
 * randomised: if the report did not state it, it is not in this file.
 *
 * Quantitative claims carry the report's own attribution via `Citation`.
 * Where the report quotes a range without naming a publisher, the
 * citation falls back to the salary aggregators / live listings it lists
 * under "Sources consulted".
 * ------------------------------------------------------------------ */

import { pkrMonth, skill, truth, usdYear } from "./builders";
import { C, cite } from "./sources";
import type { MarketTruthRoleId, RoleTruthProfile } from "./types";

/* ================================================================== */
/* ROLE 1 — Frontend Developer (React)                                */
/* ================================================================== */

const FRONTEND_REACT: RoleTruthProfile = {
  roleId: "frontend-react",
  displayName: "Frontend Developer (React)",
  headline:
    "TypeScript is the floor, not a bonus. The single filter most juniors fail is writing a meaningful component test.",
  aliases: [
    "frontend developer",
    "front end developer",
    "frontend engineer",
    "front end engineer",
    "frontend web developer",
    "react developer",
    "react dev",
    "reactjs developer",
    "react js developer",
    "next js developer",
    "nextjs developer",
    "ui developer",
    "javascript developer",
    "client side developer",
    "vue developer",
    "angular developer",
  ],
  matchKeywords: [
    { phrase: "frontend", weight: 6 },
    { phrase: "front end", weight: 6 },
    { phrase: "ui developer", weight: 5 },
    { phrase: "ui engineer", weight: 5 },
    { phrase: "client side", weight: 4 },
    { phrase: "react", weight: 3 },
    { phrase: "reactjs", weight: 3 },
    { phrase: "react js", weight: 3 },
    { phrase: "next js", weight: 3 },
    { phrase: "nextjs", weight: 3 },
    { phrase: "vue", weight: 3 },
    { phrase: "vuejs", weight: 3 },
    { phrase: "angular", weight: 3 },
    { phrase: "svelte", weight: 3 },
    { phrase: "tailwind", weight: 2 },
    { phrase: "javascript", weight: 1 },
    { phrase: "typescript", weight: 1 },
    { phrase: "css", weight: 1 },
    { phrase: "html", weight: 1 },
  ],
  mustHaveSkills: [
    skill("JavaScript", "Deep, not surface-level"),
    skill(
      "TypeScript",
      "Required by 71% of job postings — this is now the baseline floor, not a bonus",
      C.onlyFrontendJobs,
    ),
    skill(
      "React",
      'Required by 68% of postings, but "knowing React" is no longer differentiating; interviews test internals — fiber reconciliation, render lifecycle, hooks pitfalls like stale closures in useEffect',
      C.onlyFrontendJobs,
    ),
    skill("HTML/CSS fundamentals", "Semantic HTML, Flexbox, Grid, responsive design"),
    skill("Git", "Branching, PRs, merge conflict resolution"),
  ],
  commonTools: [
    skill(
      "Next.js",
      "Mentioned in 52% of listings, +29% YoY growth; App Router, Server Components and Server Actions are the new standard",
      C.onlyFrontendJobs,
    ),
    skill("Tailwind CSS", "45% of postings, +31% YoY", C.onlyFrontendJobs),
    skill(
      "Jest + React Testing Library",
      "38% of postings. Most candidates fail here.",
      C.onlyFrontendJobs,
    ),
    skill("REST APIs with fetch/axios"),
    skill("Package managers — npm / pnpm / bun"),
  ],
  differentiators: [
    skill(
      "AI/LLM integration",
      "+180% YoY growth in mentions, +25-40% salary premium. Building streaming UIs with SSE/WebSockets for LLM responses is the #1 differentiator in 2026.",
      C.onlyFrontendJobs,
    ),
    skill("GraphQL", "27% of postings", C.onlyFrontendJobs),
    skill("React Native", "31% of postings — cross-platform bonus", C.onlyFrontendJobs),
    skill(
      "Accessibility (a11y)",
      "19% of postings but legally growing (EU Accessibility Act, ADA)",
      C.onlyFrontendJobs,
    ),
    skill("Web performance", "Core Web Vitals (LCP, INP, CLS), Chrome DevTools proficiency"),
    skill(
      "Design system engineering",
      "Building and maintaining component libraries with Storybook",
    ),
  ],
  whatJuniorsLack: [
    truth("Cannot write a meaningful component test — the #1 filter most candidates fail"),
    truth(
      "Only know React superficially — cannot explain why re-renders happen or debug performance issues",
    ),
    truth("Use plain JavaScript when the codebase is TypeScript; add `: any` everywhere"),
    truth("No deployed projects — only localhost demos and tutorial clones"),
    truth("Cannot read or produce a PR review"),
    truth(
      "Zero understanding of how the client-server boundary works, especially with React Server Components",
    ),
  ],
  evidenceEmployersTrust: [
    truth("Deployed, production-grade pages with measurably fast Core Web Vitals"),
    truth("GitHub repos showing real commit history, not single-commit uploads"),
    truth("A portfolio site that itself demonstrates the skills claimed"),
    truth("Contributions to open-source projects, even small PRs"),
    truth("Internship experience shipping to production"),
  ],
  portfolioExpectations: {
    typicalExperience: "0-2 years experience for true entry level",
    items: [
      truth(
        "2-3 deployed projects (not todo apps); at least one with authentication, data persistence and API integration",
      ),
      truth("One project should demonstrate TypeScript + Next.js in 2026"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(
      40_000,
      85_000,
      C.pakTechJobs,
      "PKR 40K-75K in Lahore, up to 85K in Islamabad",
    ),
    pakistanRemoteIntl: pkrMonth(
      100_000,
      200_000,
      C.aggregators,
      "Equivalent of roughly $350-700/month working for international clients",
    ),
    globalRemoteUSD: usdYear(
      45_000,
      75_000,
      C.aggregators,
      "Junior remote React roles; competitive, requires a strong portfolio",
    ),
    usOnSite: usdYear(65_000, 95_000, C.aggregators, "Entry level; higher in tech hubs"),
    additionalBands: [],
  },
  aiImpact: {
    automatedByAi: [
      truth(
        'AI tools (Copilot, Cursor) automate boilerplate component creation, reducing demand for "code typists"',
      ),
    ],
    stillValued: [
      "Architecture decisions",
      "Debugging complex state",
      "Building AI-integrated UIs (streaming chat, generative UI)",
    ],
    emergingSkills: [
      "AI-native frontend engineering — building UIs that interface with LLMs",
      "Streaming interfaces over SSE/WebSockets",
    ],
    stabilityNote:
      "React / TypeScript / Next.js demand is stable. AI integration demand is volatile — growing rapidly.",
    notes: [],
  },
  pakistanSpecifics: [
    truth("MERN stack dominates Pakistan hiring — MongoDB, Express, React, Node.js"),
    truth(
      '"React developer" is one of the most searched freelance categories; Upwork/Fiverr freelance remains a major income path',
    ),
    truth(
      "Local companies (Arbisoft, Systems Ltd, 10Pearls, VentureDive) hire juniors in the PKR 40-80K range",
    ),
    truth(
      "Remote international clients pay 2-4x local rates but demand higher English proficiency and self-management",
    ),
    truth(
      '"React + Next.js + Tailwind" is the sweet spot for both local and remote work in Pakistan',
    ),
  ],
};

/* ================================================================== */
/* ROLE 2 — Backend Developer (Node.js / Python)                      */
/* ================================================================== */

const BACKEND_NODE_PYTHON: RoleTruthProfile = {
  roleId: "backend-node-python",
  displayName: "Backend Developer (Node.js / Python)",
  headline:
    "One language deeply plus real SQL. Juniors get cut because they cannot design a schema or explain what happens between request and response.",
  aliases: [
    "backend developer",
    "back end developer",
    "backend engineer",
    "back end engineer",
    "node js developer",
    "nodejs developer",
    "node developer",
    "python developer",
    "django developer",
    "fastapi developer",
    "flask developer",
    "express developer",
    "api developer",
    "server side developer",
    "php developer",
    "laravel developer",
    "java developer",
    "dotnet developer",
    "net developer",
    "golang developer",
    "ruby on rails developer",
  ],
  matchKeywords: [
    { phrase: "backend", weight: 6 },
    { phrase: "back end", weight: 6 },
    { phrase: "server side", weight: 5 },
    { phrase: "nodejs", weight: 3 },
    { phrase: "node js", weight: 3 },
    { phrase: "express", weight: 3 },
    { phrase: "nestjs", weight: 3 },
    { phrase: "fastapi", weight: 3 },
    { phrase: "django", weight: 3 },
    { phrase: "flask", weight: 3 },
    { phrase: "laravel", weight: 3 },
    { phrase: "php", weight: 3 },
    { phrase: "java", weight: 3 },
    { phrase: "spring boot", weight: 3 },
    { phrase: "golang", weight: 3 },
    { phrase: "dotnet", weight: 3 },
    { phrase: "net core", weight: 3 },
    { phrase: "ruby on rails", weight: 3 },
    { phrase: "microservices", weight: 3 },
    { phrase: "rest api", weight: 2 },
    { phrase: "api", weight: 2 },
    { phrase: "python", weight: 2 },
    { phrase: "postgres", weight: 1 },
    { phrase: "sql", weight: 1 },
    { phrase: "database", weight: 1 },
  ],
  mustHaveSkills: [
    skill(
      "One language deeply",
      "Node.js (JavaScript/TypeScript) OR Python — depth in one, not surface knowledge of both",
    ),
    skill(
      "REST API design",
      "Verbs, status codes, authentication (JWT, OAuth), rate limiting, versioning",
    ),
    skill("SQL", "Joins, indexing, query optimisation. PostgreSQL is the most requested database."),
    skill("Git", "Branching, PRs, merge conflict resolution"),
    skill("Basic data structures and algorithms", "Enough to pass technical screens"),
  ],
  commonTools: [
    skill("Node.js track", "Express.js or Fastify, TypeScript, Prisma or Drizzle ORM, PostgreSQL"),
    skill("Python track", "Django or FastAPI, SQLAlchemy, PostgreSQL or MySQL"),
    skill("Docker", "Increasingly expected even at entry level"),
    skill("Redis", "Caching basics"),
    skill("Postman", "API testing"),
  ],
  differentiators: [
    skill("Cloud fundamentals", "AWS: EC2, S3, Lambda, RDS — or the equivalent on GCP/Azure"),
    skill("Message queues", "RabbitMQ, Redis Pub/Sub, Kafka basics"),
    skill("GraphQL", "Server-side implementation"),
    skill("CI/CD pipeline setup", "GitHub Actions"),
    skill("AI/ML API integration", "Calling and orchestrating LLM APIs from the backend"),
  ],
  whatJuniorsLack: [
    truth("Cannot design a database schema from requirements"),
    truth("No understanding of authentication beyond copying JWT tutorial code"),
    truth(
      "Cannot explain what happens between a request hitting the server and a response returning",
    ),
    truth("No experience with deployment — everything runs only on localhost"),
    truth("Cannot write or understand SQL beyond SELECT *"),
    truth("No awareness of error handling, logging or monitoring"),
  ],
  evidenceEmployersTrust: [
    truth("A deployed API with documentation (Swagger/OpenAPI)"),
    truth("A project with real database design — normalised, with migrations"),
    truth("GitHub showing incremental development, not a code dump"),
    truth("An internship where they touched production code"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth("A deployed, documented API is the baseline artefact for this role"),
      truth("At least one project with a normalised schema and migrations"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(50_000, 90_000, C.pakTechJobs, "Karachi backend data"),
    globalRemoteUSD: usdYear(50_000, 80_000, C.aggregators, "Entry level"),
    usOnSite: usdYear(70_000, 100_000, C.aggregators, "Entry level"),
    additionalBands: [],
  },
  aiImpact: {
    automatedByAi: [
      truth(
        'AI generates boilerplate CRUD endpoints effectively — the "code monkey" backend tasks are being automated',
      ),
    ],
    stillValued: ["System design thinking", "Security", "Data modelling", "Performance tuning"],
    emergingSkills: [
      "Python backend developers who add ML/AI pipeline skills gain significant advantage",
      "Orchestrating LLM APIs behind a production backend",
    ],
    stabilityNote:
      "Node.js and Python demand are both stable. FastAPI is growing rapidly. Django is stable but flat.",
    notes: [],
  },
  pakistanSpecifics: [
    truth("Backend Developer (Karachi) juniors sit at PKR 50,000-90,000/month", C.pakTechJobs),
    truth("MERN stack is the dominant local hiring stack, so Node.js has the widest local demand"),
    truth(
      "Software houses (Arbisoft, Systems Ltd, 10Pearls, VentureDive, Netsol, TPS) remain the primary entry path — they hire juniors under senior supervision",
    ),
  ],
};

/* ================================================================== */
/* ROLE 3 — Full Stack Developer                                      */
/* ================================================================== */

const FULL_STACK: RoleTruthProfile = {
  roleId: "full-stack",
  displayName: "Full Stack Developer",
  headline:
    'One deployed full-stack app with auth, CRUD and real data beats ten partial projects — and "jack of all trades, master of none" is the rejection line.',
  aliases: [
    "full stack developer",
    "fullstack developer",
    "full stack engineer",
    "fullstack engineer",
    "full stack web developer",
    "mern developer",
    "mern stack developer",
    "mean stack developer",
    "web developer",
    "software engineer",
    "software developer",
  ],
  matchKeywords: [
    { phrase: "full stack", weight: 7 },
    { phrase: "fullstack", weight: 7 },
    { phrase: "mern", weight: 6 },
    { phrase: "mean stack", weight: 5 },
    { phrase: "web developer", weight: 3 },
    { phrase: "web development", weight: 3 },
    { phrase: "software engineer", weight: 2 },
    { phrase: "software developer", weight: 2 },
    { phrase: "t3 stack", weight: 4 },
    { phrase: "mongodb", weight: 2 },
  ],
  mustHaveSkills: [
    skill("Frontend", "HTML, CSS, JavaScript/TypeScript, React — the dominant framework"),
    skill("Backend", "Node.js with Express/Fastify OR Python with Django/FastAPI"),
    skill("Database", "PostgreSQL (most requested) or MongoDB"),
    skill("Git/GitHub proficiency"),
    skill("REST APIs", "Both consumption and creation"),
  ],
  commonTools: [
    skill(
      "MERN stack or a modern equivalent with PostgreSQL",
      "Based on a review of 2026 full-stack job postings",
      C.devFullStack,
    ),
    skill("TypeScript across the stack", undefined, C.devFullStack),
    skill("Cloud services", "AWS basics", C.devFullStack),
    skill("CI/CD understanding", "GitHub Actions", C.devFullStack),
    skill("Docker basics", undefined, C.devFullStack),
  ],
  differentiators: [
    skill("AI/ML integration", "Building LLM-powered features end-to-end"),
    skill(
      "Next.js",
      "A full-stack framework that eliminates the need for a separate backend in many cases",
    ),
    skill("Data visualisation capability"),
    skill("Mobile cross-platform", "React Native"),
    skill("Agile/Scrum methodology experience"),
  ],
  whatJuniorsLack: [
    truth('"Jack of all trades, master of none" — shallow knowledge on both ends'),
    truth("Cannot debug a full request lifecycle from button click to database and back"),
    truth("No experience deploying a full application — frontend + backend + database"),
    truth("Only tutorial projects, no original problem-solving demonstrated"),
    truth("Cannot communicate technical concepts in interviews"),
    truth(
      'For freshers: "first get into the industry" — weak projects and basic DSA make the first job the hardest jump',
      cite("LinkedIn full-stack discussion"),
    ),
  ],
  evidenceEmployersTrust: [
    truth(
      "A single deployed full-stack application with authentication, CRUD and real data is worth more than 10 partial projects",
    ),
    truth("Clean GitHub with readable code, meaningful commit messages and README files"),
    truth("An internship at a software house, even 3 months"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth(
        "One end-to-end deployed application (frontend + backend + database) with authentication and CRUD",
      ),
      truth("Original problem-solving rather than tutorial reproductions"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(45_000, 90_000, C.pakTechJobs),
    globalRemoteUSD: usdYear(50_000, 80_000, C.aggregators),
    usOnSite: usdYear(60_000, 95_000, C.aggregators),
    additionalBands: [],
  },
  aiImpact: {
    automatedByAi: [
      truth(
        "AI coding assistants make juniors appear more productive but can mask a lack of understanding",
      ),
    ],
    stillValued: [
      "Understanding systems end-to-end",
      "Integrating AI tools into products",
      "Debugging across the full request lifecycle",
    ],
    emergingSkills: ["Shipping LLM-powered product features end-to-end"],
    stabilityNote:
      "The full-stack junior who understands systems and can integrate AI tools into products is valued; the one who just follows tutorials is being replaced.",
    notes: [
      truth(
        "Companies that adopt AI at higher rates are hiring juniors 13% less",
        cite("Reddit r/cscareerquestions citing industry reports"),
      ),
    ],
  },
  pakistanSpecifics: [
    truth("Full Stack juniors sit at PKR 45,000-90,000/month", C.pakTechJobs),
    truth("MERN Developer juniors sit at PKR 40,000-80,000/month", C.pakTechJobs),
    truth(
      '"Full-stack" roles dominate Lahore/Karachi/Islamabad; startups in Pakistan hire selectively',
    ),
    truth("MERN stack is the dominant local hiring stack"),
  ],
};

/* ================================================================== */
/* ROLE 4 — Data Analyst / Data Scientist (entry)                     */
/* ================================================================== */

const DATA_ANALYST_SCIENTIST: RoleTruthProfile = {
  roleId: "data-analyst-scientist",
  displayName: "Data Analyst / Data Scientist (entry)",
  headline:
    "SQL is non-negotiable and beautiful charts with no insight fail. This is one of the most AI-resilient entry paths because the work is judgement, not computation.",
  aliases: [
    "data analyst",
    "junior data analyst",
    "data scientist",
    "junior data scientist",
    "data science",
    "business intelligence analyst",
    "bi analyst",
    "bi developer",
    "analytics engineer",
    "machine learning engineer",
    "ml engineer",
    "ai ml engineer",
    "ai engineer",
    "data engineer",
    "statistician",
  ],
  matchKeywords: [
    { phrase: "data analyst", weight: 7 },
    { phrase: "data scientist", weight: 7 },
    { phrase: "data science", weight: 6 },
    { phrase: "business intelligence", weight: 6 },
    { phrase: "analytics", weight: 5 },
    { phrase: "machine learning", weight: 5 },
    { phrase: "ml engineer", weight: 5 },
    { phrase: "statistician", weight: 5 },
    { phrase: "ai engineer", weight: 4 },
    { phrase: "deep learning", weight: 4 },
    { phrase: "power bi", weight: 4 },
    { phrase: "tableau", weight: 4 },
    { phrase: "bi developer", weight: 4 },
    { phrase: "data engineer", weight: 4 },
    { phrase: "nlp", weight: 3 },
    { phrase: "pandas", weight: 3 },
    { phrase: "data", weight: 2 },
  ],
  mustHaveSkills: [
    skill(
      "SQL",
      "Non-negotiable — writing queries, joins and aggregations without hand-holding",
      C.sprout,
    ),
    skill("Excel / Google Sheets", "Pivot tables, VLOOKUP, basic formulas"),
    skill("One visualisation tool", "Tableau OR Power BI"),
    skill("Python or R", "Python preferred — pandas, NumPy basics"),
    skill("Basic statistics", "Distributions, hypothesis testing, regression"),
    skill("Data Scientist track adds: Python deeply", "scikit-learn and basic ML models"),
    skill("Data Scientist track adds: linear algebra and calculus fundamentals"),
    skill("Data Scientist track adds: Jupyter notebooks as the working environment"),
    skill(
      "Data Scientist track adds: a quantitative degree",
      "CS, Statistics or Maths is typically required for the scientist track",
    ),
  ],
  commonTools: [
    skill("SQL engines", "PostgreSQL, MySQL, BigQuery"),
    skill("Python data stack", "pandas, NumPy, matplotlib, seaborn"),
    skill("Tableau / Power BI"),
    skill("Excel", "Still heavily used"),
    skill("Jupyter / Google Colab"),
    skill("Git", "Increasingly expected"),
  ],
  differentiators: [
    skill("dbt", "Data build tool — analytics engineering"),
    skill("Airflow", "Basics, for pipeline understanding"),
    skill("A/B testing methodology"),
    skill("ML fundamentals", "For analyst roles this is the path to promotion"),
    skill(
      "Communication skills",
      '"If you can\'t explain what the data says to a non-technical stakeholder, the analysis loses its value"',
      C.sprout,
    ),
  ],
  whatJuniorsLack: [
    truth("Cannot write SQL beyond SELECT * — cannot join tables or write subqueries"),
    truth("No experience with messy, real-world data — only clean classroom datasets"),
    truth("Cannot tell a story with data: beautiful charts but no insight"),
    truth("Claim Python proficiency but cannot manipulate a DataFrame from scratch"),
    truth(
      "No portfolio showing a cleaned dataset walkthrough or a visualisation project driven by a business question",
    ),
  ],
  evidenceEmployersTrust: [
    truth(
      "A portfolio with 2-3 projects: a cleaned dataset walkthrough, a visualisation with a business question, and a quantifiable result",
    ),
    truth("A Kaggle profile with competition participation, even at modest ranking"),
    truth("An internship doing actual data work"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth("2-3 portfolio projects, each answering a stated business question"),
      truth("At least one project using messy real-world data, with the cleaning documented"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(55_000, 110_000, C.pakTechJobs, "Data Analyst"),
    globalRemoteUSD: usdYear(
      40_000,
      65_000,
      C.aggregators,
      "Analyst range; higher for data scientist",
    ),
    usOnSite: usdYear(
      50_000,
      70_000,
      cite("Glassdoor via Sprout 2026", "sprout-2026"),
      "US Data Analyst entry level; average around $76K",
    ),
    additionalBands: [
      {
        label: "Pakistan — Data Scientist",
        band: pkrMonth(60_000, 120_000, C.pakTechJobs, "Junior AI/ML engineering"),
      },
      {
        label: "US — Data Scientist",
        band: usdYear(75_000, 100_000, C.aggregators, "Entry level"),
      },
    ],
  },
  aiImpact: {
    automatedByAi: [truth("AI automates routine reporting and dashboard creation")],
    stillValued: [
      "Asking the right questions",
      "Interpreting ambiguous results",
      "Communicating insights to non-technical stakeholders",
    ],
    emergingSkills: ["AI literacy for analysts — using AI tools inside the analysis workflow"],
    stabilityNote:
      "SQL / Python / Tableau demand is very stable. AI literacy for analysts is growing.",
    notes: [
      truth(
        "70% of analysts already use AI tools daily. Interpretation is still human.",
        cite("NIDADS"),
      ),
      truth(
        "Entry-level data roles are among the most AI-resilient because the work is about judgement, not just computation",
      ),
    ],
  },
  pakistanSpecifics: [
    truth("Data Scientist juniors sit at PKR 55,000-110,000/month", C.pakTechJobs),
    truth("AI/ML Engineer juniors sit at PKR 60,000-120,000/month", C.pakTechJobs),
  ],
};

/* ================================================================== */
/* ROLE 5 — Mobile Developer (Flutter / React Native)                 */
/* ================================================================== */

const MOBILE_FLUTTER_RN: RoleTruthProfile = {
  roleId: "mobile-flutter-react-native",
  displayName: "Mobile Developer (Flutter / React Native)",
  headline:
    "A published app — even a simple one — is the ticket. Tutorial-template apps and mock-data-only projects get filtered out.",
  aliases: [
    "mobile developer",
    "mobile app developer",
    "junior mobile app developer",
    "flutter developer",
    "react native developer",
    "android developer",
    "ios developer",
    "app developer",
    "cross platform mobile developer",
    "dart developer",
  ],
  matchKeywords: [
    { phrase: "react native", weight: 8 },
    { phrase: "flutter", weight: 7 },
    { phrase: "mobile", weight: 6 },
    { phrase: "android", weight: 5 },
    { phrase: "ios", weight: 5 },
    { phrase: "dart", weight: 5 },
    { phrase: "app developer", weight: 4 },
    { phrase: "swift", weight: 4 },
    { phrase: "kotlin", weight: 4 },
    { phrase: "expo", weight: 4 },
    { phrase: "play store", weight: 3 },
    { phrase: "app store", weight: 3 },
  ],
  mustHaveSkills: [
    skill("Dart (Flutter) OR JavaScript/TypeScript (React Native)"),
    skill(
      "State management",
      "Provider/Riverpod/Bloc for Flutter, or Redux/Zustand for React Native",
    ),
    skill("REST API integration"),
    skill(
      "Mobile-specific concepts",
      "Navigation, local storage, push notifications, app lifecycle",
    ),
    skill("Git version control"),
  ],
  commonTools: [
    skill("Flutter toolchain", "Dart, Firebase, GetX or Riverpod, Platform Channels"),
    skill("React Native toolchain", "TypeScript, Expo, React Navigation, AsyncStorage"),
    skill("Firebase", "Authentication, Firestore, push notifications"),
    skill("App Store / Play Store submission process"),
    skill("Postman", "API testing"),
  ],
  differentiators: [
    skill(
      "Native module bridging",
      "Calling native iOS/Android code from cross-platform — commands a premium",
    ),
    skill("CI/CD for mobile", "Fastlane, Codemagic, App Center"),
    skill("Both Flutter AND React Native experience"),
    skill("Animations and custom UI implementations"),
    skill("Offline-first architecture"),
    skill("Published apps on Play Store / App Store"),
  ],
  whatJuniorsLack: [
    truth("Only know one tutorial app; cannot build beyond the template"),
    truth("No understanding of platform-specific behaviour (iOS vs Android differences)"),
    truth("Cannot handle asynchronous operations and error states properly"),
    truth("No published or deployed apps"),
    truth("Cannot work with real backend APIs — only mock data"),
  ],
  evidenceEmployersTrust: [
    truth("A published app on Google Play or the App Store, even a simple one"),
    truth("A complete project with authentication, data persistence and API integration"),
    truth("A GitHub repo with clean architecture (MVVM or Clean Architecture)"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth("At least one app actually published to a store"),
      truth("One project wired to a real backend API rather than mock data"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(
      40_000,
      80_000,
      C.pakTechJobs,
      "Flutter is slightly lower than React Native due to supply",
    ),
    globalRemoteUSD: usdYear(50_000, 80_000, C.aggregators, "Junior React Native"),
    usOnSite: usdYear(70_000, 95_000, cite("Ilaria"), "Junior React Native"),
    additionalBands: [
      {
        label: "US — React Native (New York)",
        band: usdYear(100_000, 130_000, cite("Medium analysis of 500 job posts")),
      },
    ],
  },
  aiImpact: {
    automatedByAi: [
      truth(
        "AI generates basic Flutter/React Native screens quickly, reducing demand for layout-only work",
      ),
    ],
    stillValued: [
      "Complex state management",
      "Native integrations",
      "Performance optimisation",
      "Offline support",
    ],
    emergingSkills: ["Offline-first and native-bridge work that AI scaffolding cannot cover"],
    stabilityNote:
      "Flutter demand is growing in Pakistan and South Asia. React Native is stable globally. Both relatively stable.",
    notes: [],
  },
  pakistanSpecifics: [
    truth("Flutter is extremely popular in Pakistan — many local agencies and startups use it"),
    truth(
      'Example listing: "Junior Mobile App Developer (React Native/Flutter)" in Karachi, 6 months-1 year experience',
      cite("BeBee Pakistan listing"),
    ),
    truth("Freelance Flutter development is a strong niche on Upwork for Pakistani developers"),
  ],
};

/* ================================================================== */
/* ROLE 6 — DevOps / Cloud Engineer (entry)                           */
/* ================================================================== */

const DEVOPS_CLOUD: RoleTruthProfile = {
  roleId: "devops-cloud",
  displayName: "DevOps / Cloud Engineer (entry)",
  headline:
    'Of 500 postings labelled "entry-level" DevOps, only 5% actually were. Without a home lab there is nothing to show.',
  aliases: [
    "devops engineer",
    "cloud engineer",
    "cloud devops engineer",
    "site reliability engineer",
    "sre",
    "platform engineer",
    "infrastructure engineer",
    "aws engineer",
    "kubernetes engineer",
    "systems engineer",
  ],
  matchKeywords: [
    { phrase: "devops", weight: 7 },
    { phrase: "dev ops", weight: 7 },
    { phrase: "site reliability", weight: 7 },
    { phrase: "sre", weight: 6 },
    { phrase: "platform engineer", weight: 5 },
    { phrase: "kubernetes", weight: 5 },
    { phrase: "terraform", weight: 5 },
    { phrase: "infrastructure", weight: 4 },
    { phrase: "cloud", weight: 4 },
    { phrase: "sysadmin", weight: 4 },
    { phrase: "aws", weight: 3 },
    { phrase: "azure", weight: 3 },
    { phrase: "gcp", weight: 3 },
    { phrase: "docker", weight: 3 },
    { phrase: "ci cd", weight: 3 },
    { phrase: "linux", weight: 2 },
  ],
  mustHaveSkills: [
    skill(
      "Linux",
      "Command-line proficiency, file permissions, networking basics, SSH, process management",
    ),
    skill("One scripting language", "Bash AND Python"),
    skill("Networking fundamentals", "DNS, HTTP/HTTPS, TCP/IP, ports, firewalls"),
    skill("Git and CI/CD concepts"),
    skill("One cloud platform", "AWS (dominant) or Azure or GCP"),
  ],
  commonTools: [
    skill("Docker", "Containers, images, Dockerfile, docker-compose"),
    skill(
      "CI/CD",
      "GitHub Actions (most common per the Stack Overflow 2025 survey), GitLab CI, or Jenkins",
      C.stackOverflow,
    ),
    skill("AWS basics", "EC2, S3, IAM, VPC, RDS, Lambda"),
    skill("Kubernetes", "At least conceptual understanding — full proficiency is mid-level"),
    skill("Terraform or similar Infrastructure as Code"),
    skill("Monitoring", "Prometheus, Grafana, or CloudWatch basics"),
  ],
  differentiators: [
    skill("Kubernetes hands-on experience", "Significant salary premium"),
    skill("Terraform certification or practical experience"),
    skill("AWS Solutions Architect Associate or Cloud Practitioner certification"),
    skill("Security basics", "IAM best practices, secrets management"),
    skill(
      "AI-augmented DevOps",
      "74% of enterprises now require cloud DevOps engineers to demonstrate AI-integrated workflow proficiency",
      cite("McKinsey March 2025 study cited by NexusIT"),
    ),
  ],
  whatJuniorsLack: [
    truth(
      'Analysis of 500 "entry-level" DevOps job postings found only 5% are actually entry-level — most require 2-3+ years',
      cite("Medium / Osomude Yazudonu 2025"),
    ),
    truth("Cannot troubleshoot a failing deployment"),
    truth("No hands-on cloud experience — only watched tutorials"),
    truth("Cannot read a pipeline log without freezing"),
    truth("No understanding of networking (DNS, load balancers)"),
    truth("No home lab or personal infrastructure projects"),
  ],
  evidenceEmployersTrust: [
    truth("A home lab or personal cloud project deployed on the AWS free tier"),
    truth("An automated CI/CD pipeline for a personal project on GitHub"),
    truth("Blog posts or documentation showing infrastructure problem-solving"),
    truth("AWS Cloud Practitioner or Solutions Architect Associate certification"),
    truth("Contributions to infrastructure-related open source"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth("A home lab or free-tier cloud deployment you can walk an interviewer through"),
      truth("A working CI/CD pipeline in a public repository"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(60_000, 110_000, C.pakTechJobs),
    globalRemoteUSD: usdYear(60_000, 93_000, cite("RemoteRocketship")),
    usOnSite: usdYear(80_000, 110_000, cite("JobCannon 2026")),
    additionalBands: [
      {
        label: "US — with AWS DevOps certification",
        band: usdYear(
          154_000,
          154_000,
          cite("ZipRecruiter / CloudAqube"),
          "Reported average for certified engineers, not an entry-level figure",
        ),
      },
    ],
  },
  aiImpact: {
    automatedByAi: [
      truth("AI automates incident response, log analysis and routine infrastructure provisioning"),
    ],
    stillValued: [
      "Architecture design",
      "Security posture",
      "Cost optimisation",
      "Debugging novel failures",
    ],
    emergingSkills: ['"AI-augmented DevOps" — integrating AI into monitoring and alerting'],
    stabilityNote:
      "Cloud/DevOps is one of the most resilient roles. Docker/Kubernetes/AWS demand is highly stable.",
    notes: [],
  },
  pakistanSpecifics: [
    truth(
      "DevOps juniors sit at PKR 60,000-110,000/month — among the highest local junior bands",
      C.pakTechJobs,
    ),
  ],
};

/* ================================================================== */
/* ROLE 7 — QA / Automation Engineer                                  */
/* ================================================================== */

const QA_AUTOMATION: RoleTruthProfile = {
  roleId: "qa-automation",
  displayName: "QA / Automation Engineer",
  headline:
    "Manual-only QA earns roughly $40K/year less than automation QA. If you cannot write code, you are competing for a shrinking pool.",
  aliases: [
    "qa engineer",
    "qa automation engineer",
    "quality assurance engineer",
    "software quality assurance engineer",
    "sqa engineer",
    "software test engineer",
    "test engineer",
    "test automation engineer",
    "automation engineer",
    "sdet",
    "manual tester",
    "tester",
    "qa analyst",
  ],
  matchKeywords: [
    { phrase: "qa", weight: 7 },
    { phrase: "sqa", weight: 7 },
    { phrase: "quality assurance", weight: 7 },
    { phrase: "sdet", weight: 7 },
    { phrase: "test automation", weight: 6 },
    { phrase: "test engineer", weight: 6 },
    { phrase: "tester", weight: 5 },
    { phrase: "automation engineer", weight: 5 },
    { phrase: "selenium", weight: 5 },
    { phrase: "testing", weight: 4 },
    { phrase: "playwright", weight: 4 },
    { phrase: "cypress", weight: 4 },
    { phrase: "appium", weight: 4 },
  ],
  mustHaveSkills: [
    skill(
      "Manual testing fundamentals",
      "Test design techniques — equivalence partitioning, boundary value analysis — and bug reporting",
    ),
    skill(
      "One programming language",
      "JavaScript/TypeScript for Playwright/Cypress, OR Python for Selenium/pytest",
    ),
    skill("SQL basics", "Verifying database state after test actions"),
    skill("HTTP/REST understanding", "Verbs, status codes, API testing"),
    skill(
      "One automation framework",
      "Playwright is now the #1 framework to learn — 45.1% adoption, 91% satisfaction",
      cite("State of JS 2025"),
    ),
  ],
  commonTools: [
    skill("Playwright", "Fastest growing; recommended to learn first", C.crosscheck),
    skill("Selenium", "Still #1 in legacy enterprise job listings"),
    skill("Cypress", "14.4% adoption, plateauing", cite("State of JS 2025")),
    skill("Postman / Newman", "API testing"),
    skill("CI/CD integration", "Running tests in GitHub Actions / GitLab CI"),
    skill("Jira", "Bug tracking"),
    skill("Git"),
  ],
  differentiators: [
    skill("Performance testing", "k6, JMeter"),
    skill("Accessibility testing", "axe-core — legally driven demand increasing"),
    skill(
      "AI literacy for QA",
      "Testing AI features (hallucination rates, prompt injection, non-determinism) and using AI to scaffold tests",
    ),
    skill(
      "ISTQB Foundation Level (CTFL v4.0)",
      "Around $230; the most recognised QA certification globally, preferred in Europe/India",
    ),
    skill("Mobile testing", "Appium"),
  ],
  whatJuniorsLack: [
    truth(
      'Many QA job postings labelled "entry level" actually require 3-6+ years',
      cite("Indeed listings analysis"),
    ),
    truth(
      "Cannot write code — there is a huge gap between manual-only QA (about $40K less per year) and automation QA",
    ),
    truth(
      'No understanding of CI/CD — "tests pass locally but fail in CI" with no ability to debug',
    ),
    truth("Cannot write a bug report a developer can act on"),
    truth("No experience testing real applications — only theoretical knowledge"),
  ],
  evidenceEmployersTrust: [
    truth("A GitHub repo with Playwright/Selenium test suites for a real application"),
    truth("A testing portfolio showing different test types — unit, integration, E2E"),
    truth("ISTQB CTFL certification, especially for international/remote roles"),
    truth("Contributions to testing open-source projects"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth("An automated suite against a real application, running in CI"),
      truth("Bug reports written well enough that a developer could act on them unchanged"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(
      40_000,
      80_000,
      C.pakTechJobs,
      "Manual QA sits lower in the band; automation higher",
    ),
    globalRemoteUSD: usdYear(40_000, 70_000, C.aggregators, "QA automation"),
    usOnSite: usdYear(
      78_000,
      92_000,
      cite("Glassdoor / Crosscheck 2026", "crosscheck-2026"),
      "Entry-level QA Engineer",
    ),
    additionalBands: [
      {
        label: "US — SDET",
        band: usdYear(
          140_000,
          146_000,
          cite("Glassdoor / Levels.fyi", "salary-aggregators"),
          "Median, not an entry-level figure",
        ),
      },
    ],
  },
  aiImpact: {
    automatedByAi: [
      truth(
        "AI tools (Mabl, Testim, Copilot + codegen) scaffold test cases from natural language, shifting the work from writing tests to reviewing AI-drafted tests",
      ),
    ],
    stillValued: [
      "Test design judgement",
      "Debugging tests that fail only in CI",
      "Writing actionable bug reports",
    ],
    emergingSkills: [
      "Testing AI features themselves — hallucination, drift, prompt injection — a new QA subspecialty",
    ],
    stabilityNote:
      "Manual-only QA is declining. Automation QA is stable. AI-testing QA is growing rapidly.",
    notes: [],
  },
  pakistanSpecifics: [
    truth(
      "QA juniors sit at PKR 40,000-80,000/month, manual testing at the lower end and automation at the higher end",
      C.pakTechJobs,
    ),
  ],
};

/* ================================================================== */
/* ROLE 8 — UI/UX Designer (entry)                                    */
/* ================================================================== */

const UI_UX_DESIGN: RoleTruthProfile = {
  roleId: "ui-ux-design",
  displayName: "UI/UX Designer (entry)",
  headline:
    "One entry-level UX posting pulls 500-800 applicants and 90% of portfolios look nearly identical. A certificate was a differentiator in 2022; in 2026 it is table stakes.",
  aliases: [
    "ui ux designer",
    "ux ui designer",
    "ux designer",
    "ui designer",
    "product designer",
    "interaction designer",
    "ux researcher",
    "visual designer",
    "graphic designer",
    "web designer",
  ],
  matchKeywords: [
    { phrase: "ui ux", weight: 8 },
    { phrase: "ux ui", weight: 8 },
    { phrase: "ux", weight: 6 },
    { phrase: "user experience", weight: 6 },
    { phrase: "ui designer", weight: 6 },
    { phrase: "product designer", weight: 6 },
    { phrase: "interaction design", weight: 5 },
    { phrase: "user research", weight: 5 },
    { phrase: "figma", weight: 5 },
    { phrase: "wireframe", weight: 4 },
    { phrase: "visual design", weight: 4 },
    { phrase: "web designer", weight: 4 },
    { phrase: "graphic design", weight: 3 },
    { phrase: "designer", weight: 3 },
    { phrase: "design", weight: 2 },
  ],
  mustHaveSkills: [
    skill(
      "Figma",
      "The non-negotiable tool — wireframing, prototyping, auto-layout, components, variants",
    ),
    skill("User research", "Conducting interviews, usability tests, synthesising findings"),
    skill("Wireframing and information architecture"),
    skill("Basic understanding of design systems", "Tokens, component libraries"),
    skill("Visual design fundamentals", "Typography, colour theory, spacing, grid"),
  ],
  commonTools: [
    skill("Figma", "Primary; Sketch is legacy"),
    skill("FigJam or Miro", "Collaboration and workshops"),
    skill("Maze or UserTesting", "Remote research"),
    skill("Basic HTML/CSS understanding", "For handoff quality"),
  ],
  differentiators: [
    skill("Motion design / micro-interactions", "Figma prototyping, Lottie"),
    skill("Design system creation and maintenance"),
    skill("Accessibility knowledge", "WCAG 2.2 AA"),
    skill("Data-informed design", "Interpreting analytics to inform UX decisions"),
    skill("AI tool proficiency", "For rapid wireframing and ideation"),
  ],
  whatJuniorsLack: [
    truth(
      "In 2025, a single entry-level UX posting pulled 500-800 applicants and 90% of portfolios look nearly identical",
      C.mentorCruise,
    ),
    truth(
      "Portfolios show design process (research, affinity map, wireframe, prototype) but never name the business problem solved or the outcome",
      C.mentorCruise,
    ),
    truth(
      "AI tools now automate 60-70% of the wireframe and mockup work that was the entry-level proof of skill — what remains is research, synthesis and decision-making",
      C.mentorCruise,
    ),
    truth(
      'Certificates (Google UX, bootcamps) are now table stakes, not differentiators — "A UX design certificate got people hired in 2022. In 2026, it\'s table stakes."',
      C.mentorCruise,
    ),
    truth("Cannot explain design decisions in terms of business impact"),
    truth(
      "No externally validated portfolio — nobody who has actually screened portfolios has reviewed it",
    ),
  ],
  evidenceEmployersTrust: [
    truth(
      "One strong case study that names the business problem, a specific decision with its reasoning, and the outcome — worth more than 10 process-only case studies",
      C.mentorCruise,
    ),
    truth("A portfolio reviewed by someone who has been on the hiring side", C.mentorCruise),
    truth(
      "Warm introductions — 5 targeted applications outperform 100 cold applications",
      C.mentorCruise,
    ),
    truth("Evidence of user research: real users, real sessions, real findings"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth(
        "One outcome-led case study (problem, decision, result) beats a portfolio of process artefacts",
        C.mentorCruise,
      ),
      truth("Get the portfolio critiqued by someone who has screened portfolios professionally"),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(
      40_000,
      80_000,
      C.pakTechJobs,
      "UI/UX is less formalised in Pakistan; the range varies widely",
    ),
    globalRemoteUSD: usdYear(
      35_000,
      60_000,
      C.aggregators,
      "Entry level, hiring from Pakistan / South Asia",
    ),
    usOnSite: usdYear(55_000, 85_000, C.mentorCruise, "Entry level"),
    additionalBands: [],
  },
  aiImpact: {
    automatedByAi: [
      truth("AI automates 60-70% of wireframe/mockup production work", C.mentorCruise),
    ],
    stillValued: [
      "User research",
      "Synthesis of qualitative data",
      "Design decision-making",
      "Design system governance",
    ],
    emergingSkills: ["Research plus product thinking — the combination that still gets callbacks"],
    stabilityNote:
      "Junior UI-only roles are declining. UX research + product thinking roles are stable or growing.",
    notes: [
      truth(
        '"The UX designers getting callbacks have research and thinking skills, not just Figma speed"',
        C.mentorCruise,
      ),
    ],
  },
  pakistanSpecifics: [
    truth(
      "UI/UX juniors sit at PKR 40,000-80,000/month; the discipline is less formalised locally so ranges vary widely",
      C.pakTechJobs,
    ),
  ],
};

/* ================================================================== */
/* GENERIC FALLBACK — target roles outside the researched eight        */
/* ================================================================== */

/**
 * Returned when a free-text target role matches none of the eight
 * researched profiles.  It deliberately contains ONLY cross-cutting
 * findings from the report — no role-specific skills are invented.  The
 * salary bands are the general "Software Engineer" benchmark plus the
 * honest span observed across the eight researched roles, both labelled
 * as such.
 */
export const GENERIC_FALLBACK: RoleTruthProfile = {
  roleId: "generic-tech-role",
  displayName: "Entry-level tech role (general)",
  headline:
    "No role-specific research exists for this target yet, so what follows is the cross-cutting reality that applies to every entry-level tech role.",
  aliases: [],
  matchKeywords: [],
  mustHaveSkills: [
    skill(
      "Depth in one stack",
      'Students optimise for breadth ("I know 15 technologies"); employers want depth ("Can you build a production feature in one stack?")',
    ),
    skill(
      "Git and deployment",
      "No Git/deployment experience is a top-7 rejection reason: everything runs on localhost, with no understanding of CI/CD, environment variables or production concerns",
    ),
    skill(
      "Being able to explain your own code",
      "Hiring managers report that candidates who built projects with AI assistance cannot explain architectural decisions, debug without the AI tool, or discuss trade-offs",
      C.stackOverflow,
    ),
  ],
  commonTools: [],
  differentiators: [],
  whatJuniorsLack: [
    truth(
      'No evidence of real work — tutorial projects, todo apps and calculator clones are "tutorial artifacts, not proof of skill"',
      cite("Gitconnected, MentorCruise"),
    ),
    truth(
      "70% of applications are rejected by ATS before a human sees them, so untailored resumes never reach a person",
      C.ardura,
    ),
  ],
  evidenceEmployersTrust: [
    truth("Production code at a real company (internship or job)"),
    truth("Deployed side projects with real users"),
    truth("Open-source contributions with merged PRs"),
  ],
  portfolioExpectations: {
    typicalExperience: null,
    items: [
      truth(
        "One deployed, documented project you can fully explain outperforms a long list of technologies",
      ),
    ],
  },
  salary: {
    pakistanOnSite: pkrMonth(
      40_000,
      90_000,
      C.pakTechJobs,
      "Software Engineer (general) junior benchmark",
    ),
    globalRemoteUSD: usdYear(
      35_000,
      93_000,
      C.aggregators,
      "Span across the eight researched roles — not a role-specific figure",
    ),
    additionalBands: [],
  },
  aiImpact: {
    automatedByAi: [
      truth(
        "Tasks traditionally assigned to juniors — boilerplate code, simple refactoring, unit test generation, code documentation, simple debugging — are now done by AI tools that 85% of developers use regularly",
        C.jetBrains,
      ),
    ],
    stillValued: [
      "Judgement and problem-solving on unfamiliar problems",
      "Explaining decisions and trade-offs",
      "Owning something end-to-end in production",
    ],
    emergingSkills: ["Integrating AI into real products rather than using it to write your code"],
    stabilityNote:
      "Role-specific stability is unknown for this target. The cross-cutting junior-hiring squeeze applies regardless.",
    notes: [],
  },
  pakistanSpecifics: [
    truth(
      "Over 50,000 CS graduates compete for far fewer relevant vacancies in Pakistan annually",
      cite("LinkedIn / Mahirah Naz analysis"),
    ),
    truth(
      "Software houses (Arbisoft, Systems Ltd, 10Pearls, VentureDive, Netsol, TPS) remain the primary entry path",
    ),
  ],
};

/* ================================================================== */
/* Registry                                                           */
/* ================================================================== */

/** The eight researched roles, keyed by stable slug. */
export const ROLE_PROFILES: Record<MarketTruthRoleId, RoleTruthProfile> = {
  "frontend-react": FRONTEND_REACT,
  "backend-node-python": BACKEND_NODE_PYTHON,
  "full-stack": FULL_STACK,
  "data-analyst-scientist": DATA_ANALYST_SCIENTIST,
  "mobile-flutter-react-native": MOBILE_FLUTTER_RN,
  "devops-cloud": DEVOPS_CLOUD,
  "qa-automation": QA_AUTOMATION,
  "ui-ux-design": UI_UX_DESIGN,
};

/**
 * Report order — also the deterministic tie-break order used by
 * `resolveRoleProfile` when two profiles score identically.
 */
export const ROLE_IDS: readonly MarketTruthRoleId[] = [
  "frontend-react",
  "backend-node-python",
  "full-stack",
  "data-analyst-scientist",
  "mobile-flutter-react-native",
  "devops-cloud",
  "qa-automation",
  "ui-ux-design",
];
