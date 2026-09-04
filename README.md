# CareerPilot AI

CareerPilot AI is a career intelligence workspace for students and early-career developers.
It turns a student's real evidence, including profile data, skills, projects, resumes, and
repositories, into an honest readiness picture and a practical next step.

The product is designed around one simple question:

> What should I prove next to become ready for the role I want?

## Why CareerPilot

Most career tools give generic advice. CareerPilot connects a student's actual evidence to
market expectations and makes the gaps actionable.

- Diagnose the current career position.
- Analyze a resume with ATS and career-fit signals.
- Mirror skills against researched role expectations.
- Assess readiness for a specific job description.
- Inspect public GitLab proof when available.
- Build a practical learning roadmap.
- Ask an AI mentor focused questions.
- Review market reality, future technology signals, and employer expectations.

## Core Experience

### Career Diagnosis

Collects structured information about education, experience, projects, skills, blockers, and
career goals. The result becomes the shared evidence base for the rest of the application.

### Resume Intelligence

Accepts a resume upload, extracts its content, and produces ATS, structure, strengths,
weaknesses, detected-skill, and career-match signals. The system is designed to fail safely
with a useful fallback when an AI provider is unavailable.

### Flight Plan

Compares a target role and job description against the student's recorded evidence. It combines
role expectations, skill coverage, resume evidence, optional GitLab inspection, and current
market context into a job-readiness assessment.

### Job Mirror and Recruiter Audit

The Job Mirror shows what employers expect for researched roles and distinguishes claimed skills
from demonstrated proof. Recruiter Audit presents a company-specific screening perspective and
persists the session and recruiter conversation securely per user.

### Roadmap and Mentor

Turns identified gaps into focused learning work. The mentor provides contextual guidance using
the same career state instead of treating every student as a blank slate.

## Technology

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Vite and Nitro
- Supabase Auth, Postgres, Storage, and Row Level Security
- Groq, Gemini, or OpenRouter for AI inference
- Tavily for live web research
- Tailwind CSS and Radix UI primitives
- TanStack Query for client data fetching and caching
- Motion for purposeful interface transitions

## Project Structure

```text
src/
  components/                 Reusable UI and product sections
  data/                       Client queries, mutations, and domain types
  integrations/supabase/      Browser/server clients and generated database types
  lib/                        Server functions and domain logic
  routes/                     TanStack Start routes
supabase/
  migrations/                 Versioned database schema and RLS policies
public/                       Public static assets
```

Server-only modules use `.server.ts` and keep privileged credentials away from browser code.

## Local Setup

### Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- At least one supported AI provider key
- A Tavily API key for live market research features

### Install

```bash
npm install
```

### Configure Environment

Copy the safe template:

```bash
copy .env.example .env
```

Then fill in the values locally. Never commit `.env` or paste real keys into GitHub.

Required Supabase variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

AI and research variables:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
TAVILY_API_KEY=your_tavily_key
```

Only the publishable Supabase key belongs in client configuration. Service-role, AI, and Tavily
keys must remain server-side deployment secrets.

### Apply Database Migrations

Run the SQL migrations in `supabase/migrations` against the connected Supabase project. The
latest recruiter migration is:

```text
supabase/migrations/20260904000000_add_recruiter_sessions.sql
```

This migration creates the recruiter session schema, user-scoped RLS policies, an index, and
the updated-at trigger. Verify that the migration has been applied before testing Recruiter
Audit and recruiter chat.

### Start Development

```bash
npm run dev
```

The development server runs on the Vite port shown in the terminal.

## Verification

Run the production checks before a release:

```bash
npx tsc --noEmit
npm run build
npm run preview
```

Recommended smoke-test flow:

1. Create an account and complete onboarding.
2. Confirm profile data and skills survive a refresh.
3. Upload a resume and review the analysis.
4. Open Flight Plan and assess a real job description.
5. Run Recruiter Audit, refresh, and send a chat message.
6. Generate or open a roadmap and verify the next action.
7. Open Mentor, Market Reality, and Future Tech.

## Security Notes

- `.env`, `.env.local`, and other local secret files are ignored by Git.
- `.env.example` contains placeholders only.
- Supabase tables use user-scoped Row Level Security policies.
- Resume files use user-scoped storage paths and policies.
- Server-only credentials are read from `process.env` inside server modules.
- User-provided job descriptions, self-descriptions, and repository URLs are length-limited and
  validated before server processing.

## Deployment

1. Add the repository to GitHub without staging `.env` or generated output directories.
2. Configure the same environment variables in the deployment provider's secret settings.
3. Apply all Supabase migrations to the production project.
4. Run `npm run build`.
5. Deploy the generated TanStack Start/Nitro application using the provider configuration.
6. Test authentication and one complete user journey on the deployed URL.

For Lovable-connected branches, avoid force-pushing or rewriting published history. Keep each
push deployable so the connected project remains recoverable.

## Product Principle

CareerPilot does not promise a job or invent evidence. It makes the student's current proof,
market expectations, and highest-value next action visible.

## License

This project is currently maintained as a hackathon and product prototype. Add a license before
distributing it as an open-source project.
