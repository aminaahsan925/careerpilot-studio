# CareerPilot AI

Build CareerPilot AI as a premium, production-quality SaaS product.

IMPORTANT:

The uploaded screenshot is the PRIMARY DESIGN REFERENCE.

Recreate the screenshot closely. It is NOT inspiration for a new dashboard.

DO NOT:

- create a generic admin dashboard

- redesign the layout

- rearrange sections

- add unnecessary components

- add random gradients

- add excessive glassmorphism

- create a university-project look

- invent extra pages or features

The goal is:

REFERENCE SCREENSHOT → REAL FUNCTIONAL WEBSITE

The implementation should feel like the same product shown in the screenshot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESIGN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use the screenshot as the source of truth for:

- layout

- proportions

- spacing

- typography

- card sizes

- sidebar

- hero

- colors

- icons

- charts

- buttons

- visual hierarchy

- whitespace

- image placement

Style:

premium, minimal, editorial, elegant, luxurious, modern SaaS.

Visual quality should feel comparable to Linear, Vercel, Framer, Stripe and Apple, but DO NOT copy their layouts.

Colors:

Background: #FAF9F7

Cards: #FFFFFF

Text: #121212

Primary accent: #A55233

Secondary accent: #C9754F

Borders: rgba(0,0,0,0.06)

Use Plus Jakarta Sans / Inter.

Use subtle shadows, borders and rounded corners.

No excessive effects.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HERO — IMPORTANT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The large hero must closely match the reference screenshot.

Keep:

BUILD

YOUR

FUTURE

large editorial typography, dark background, terracotta circle and the standing/walking person.

The person is a REPLACEABLE USER ASSET.

Implement:

<CareerHero personImage={user.heroImage} />

The person can change per user, but:

- hero layout stays the same

- typography stays the same

- circle stays the same

- positioning stays the same

- proportions stay the same

Do NOT replace the person with a generic illustration or stock-photo card.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DYNAMIC USER

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Never hard-code "Ali".

Use:

Good Morning, {user.firstName}

The user's:

- name

- avatar

- role

- hero image

- scores

- skills

- applications

must come from user data.

Design is fixed.

Data is dynamic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAGES — ONLY 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep the product focused. Build only these pages:

1. LANDING PAGE

2. DASHBOARD

3. AI CAREER MENTOR

4. RESUME + CAREER ANALYSIS

5. ROADMAP

Do NOT create additional pages unless technically required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. LANDING PAGE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Premium editorial landing page using the SAME CareerPilot visual identity.

Include only:

Hero

How It Works

Career Intelligence / Features

Career Score preview

Testimonials

Pricing

Footer

Keep it elegant and spacious.

Do not make it a long generic SaaS landing page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. DASHBOARD

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the PRIMARY page.

Match the uploaded screenshot.

Include:

Dark sidebar

Header / greeting

Search

Notifications

Career Score

Resume Score

Interview Score

Skills Matched

Today's Plan

Large editorial hero

AI Mentor panel

AI Resume Review

Quick Actions

Recommended Roadmap

Recent Applications

Top Skills

Bottom motivation section

Preserve the screenshot's composition and visual hierarchy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. AI CAREER MENTOR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A focused, premium AI career conversation page.

Use the same sidebar/header/design system.

Include:

AI conversation

Suggested career questions

Career insights

Chat input

Recommended actions

Do not make it look like a generic ChatGPT clone.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. RESUME + CAREER ANALYSIS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

One unified page.

Include:

Resume upload

ATS score

Resume score

Strengths

Weaknesses

AI recommendations

Skills detected

Career match

Improvement suggestions

Use the same visual language as the dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. ROADMAP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Premium visual career roadmap.

Include:

Current career goal

Progress

Learning stages

Skills

Projects

Recommended courses

Milestones

Next action

Use a clean editorial timeline rather than a generic admin table.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use:

Next.js App Router

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide icons

Framer Motion

React Query

Use reusable components.

Keep the code clean and production-ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANIMATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use subtle Framer Motion animations:

- fade/slide entrance

- card hover

- button lift

- smooth transitions

- elegant loading skeletons

No excessive animation.

Use smooth scrolling if appropriate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESPONSIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Desktop is the primary reference.

Create polished tablet and mobile layouts without destroying the visual hierarchy.

Do not simply shrink the desktop layout.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL RULE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The uploaded screenshot is the design specification.

DO NOT interpret it.

DO NOT redesign it.

DO NOT make a generic dashboard.

RECREATE IT as a real, functional, responsive product.

Keep the website focused to exactly 5 core pages.

Prioritize visual accuracy, spacing, typography, composition and polish over adding features.

QUALITY > QUANTITY.

SIMPLICITY > COMPLEXITY.

REFERENCE > AI CREATIVITY.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://careerpilot-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/69010e82-dc29-4cbf-bf1f-855bcac5365d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
