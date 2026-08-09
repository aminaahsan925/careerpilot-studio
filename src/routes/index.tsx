import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";

import heroPerson from "@/assets/hero-person.png";
import { Sparkline } from "@/components/app/Sparkline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Build Your Future" },
      {
        name: "description",
        content:
          "CareerPilot AI turns your resume, skills and goals into a guided career roadmap with an AI mentor, ATS analysis and real progress tracking.",
      },
      { property: "og:title", content: "CareerPilot AI — Build Your Future" },
      {
        property: "og:description",
        content: "An AI career workspace: mentor, resume analysis, roadmap and career score.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { n: "01", title: "Upload your resume", body: "We parse experience, skills and gaps in seconds." },
  { n: "02", title: "Get your career score", body: "Four signals scored against your target role." },
  { n: "03", title: "Follow the roadmap", body: "Stages, projects and milestones, week by week." },
];

const FEATURES = [
  { title: "AI Career Mentor", body: "A conversation that knows your goal, scores and roadmap." },
  { title: "Resume Intelligence", body: "ATS scoring, strengths, weaknesses and rewrite guidance." },
  { title: "Skill Gap Mapping", body: "See exactly which requirements you still need to close." },
  { title: "Application Tracking", body: "Every role, stage and outcome in one editorial view." },
];

const TESTIMONIALS = [
  { quote: "The roadmap replaced six months of guessing. I shipped, then I got hired.", name: "Hira K.", role: "Frontend Engineer" },
  { quote: "My ATS score went from 61 to 91 in one afternoon of edits.", name: "Daniyal A.", role: "CS Graduate" },
  { quote: "It feels like a mentor who actually read my resume.", name: "Sana M.", role: "Data Analyst" },
];

const PLANS = [
  { name: "Starter", price: "Free", items: ["Career score", "Resume upload", "Basic roadmap"], featured: false },
  { name: "Pro", price: "$19", items: ["AI mentor", "ATS analysis", "Full roadmap", "Application tracking"], featured: true },
  { name: "Career", price: "$39", items: ["Everything in Pro", "Mock interviews", "1:1 review", "Priority AI"], featured: false },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-terracotta" strokeWidth={1.6} />
          <span className="text-[15px] font-extrabold tracking-[0.14em]">CAREERPILOT</span>
          <span className="text-[12px] font-semibold tracking-[0.16em] text-terracotta">AI</span>
        </div>
        <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <Link
          to="/dashboard"
          className="rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Open Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mt-4 overflow-hidden rounded-3xl bg-ink text-white"
        >
          <div className="absolute bottom-0 right-[8%] aspect-square w-[42%] max-w-[440px] translate-y-[38%] rounded-full bg-terracotta" />
          <img
            src={heroPerson}
            alt="CareerPilot member walking forward"
            width={912}
            height={1200}
            className="absolute bottom-0 right-[4%] z-10 hidden h-[88%] w-auto object-contain object-bottom mix-blend-luminosity md:block"
          />
          <div className="relative z-20 max-w-[560px] px-8 py-16 md:px-14 md:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-terracotta">
              Career intelligence
            </p>
            <h1 className="editorial-title mt-6 text-[clamp(2.6rem,7vw,5rem)]">
              <span className="block">Build</span>
              <span className="block">Your</span>
              <span className="block text-terracotta">Future</span>
            </h1>
            <p className="mt-6 max-w-[380px] text-[14px] leading-relaxed text-white/70">
              An AI career workspace that reads your resume, scores your readiness and hands you the
              exact next step — every week, until you land the role.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-terracotta px-6 py-3.5 text-[13.5px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Start your roadmap <span aria-hidden>→</span>
            </Link>
          </div>
        </motion.section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-terracotta">
            How it works
          </p>
          <h2 className="mt-4 max-w-xl text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-[-0.03em]">
            Three steps from uncertain to on track.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card-surface p-7">
                <p className="text-[12px] font-semibold tracking-[0.2em] text-terracotta">{s.n}</p>
                <p className="mt-5 text-[16px] font-bold tracking-[-0.01em]">{s.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-border py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-terracotta">
            Career intelligence
          </p>
          <h2 className="mt-4 max-w-xl text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-[-0.03em]">
            Everything the hiring process measures, measured first.
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-surface p-7 transition-shadow hover:shadow-lift">
                <p className="text-[16px] font-bold tracking-[-0.01em]">{f.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CAREER SCORE PREVIEW */}
        <section className="border-t border-border py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-terracotta">
                Career score
              </p>
              <h2 className="mt-4 text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-[-0.03em]">
                One number that tells you where you stand.
              </h2>
              <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
                Career, resume, interview and skill coverage — tracked weekly so progress is visible
                long before an offer arrives.
              </p>
            </div>
            <div className="card-surface p-7">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[13px] font-semibold">Career Score</p>
                  <p className="mt-3 text-[46px] font-bold leading-none tracking-[-0.04em]">
                    82<span className="ml-1 text-[15px] font-medium text-muted-foreground">/100</span>
                  </p>
                </div>
                <Sparkline
                  data={[28, 34, 30, 44, 38, 52, 48, 66, 62, 78, 84]}
                  className="h-16 w-[160px]"
                />
              </div>
              <div className="mt-7 space-y-3.5">
                {[
                  ["Resume", 88],
                  ["Interview", 76],
                  ["Skills matched", 80],
                ].map(([label, v]) => (
                  <div key={label as string} className="flex items-center gap-3">
                    <p className="w-[120px] text-[12.5px]">{label}</p>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full bg-terracotta"
                        style={{ width: `${v}%` }}
                      />
                    </span>
                    <span className="w-9 text-right text-[12px] font-semibold">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="border-t border-border py-24">
          <h2 className="max-w-xl text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-[-0.03em]">
            Careers moved, not just tracked.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card-surface p-7">
                <blockquote className="text-[14px] leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-6 text-[12px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.name}</span> — {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="border-t border-border py-24">
          <h2 className="max-w-xl text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-[-0.03em]">
            Simple pricing.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={
                  p.featured
                    ? "card-surface border-ink bg-ink p-7 text-white"
                    : "card-surface p-7"
                }
              >
                <p className="text-[13px] font-semibold">{p.name}</p>
                <p className="mt-4 text-[34px] font-bold tracking-[-0.03em]">
                  {p.price}
                  {p.price !== "Free" ? (
                    <span className={p.featured ? "ml-1 text-[13px] font-medium text-white/60" : "ml-1 text-[13px] font-medium text-muted-foreground"}>
                      /mo
                    </span>
                  ) : null}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[12.5px]">
                      <Check className="h-3.5 w-3.5 text-terracotta" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard"
                  className="mt-7 flex items-center justify-center rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-terracotta" />
            <span className="text-[13px] font-extrabold tracking-[0.14em]">CAREERPILOT AI</span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} CareerPilot AI. Build your future.
          </p>
        </div>
      </footer>
    </div>
  );
}
