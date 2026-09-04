import { motion } from "motion/react";
import { Calendar, Plane } from "lucide-react";

import type { TierCoverage } from "@/lib/jobmirror.server";
import jobMirrorHero from "@/assets/job-mirror-hero.png";

/**
 * Flight Plan header. Every number shown is either a count of researched
 * expectations or a count of the student's own proven skills — there are
 * no listing, city or "companies hiring" counts, because no free
 * verifiable source for those exists.
 */
export function FlightPlanHero({
  roleName,
  headline,
  lastResearched,
  mustHave,
  expectationCount,
  isFallback,
}: {
  roleName: string;
  headline: string;
  lastResearched: string;
  mustHave: TierCoverage;
  expectationCount: number;
  isFallback: boolean;
}) {
  const stats = [
    { value: `${mustHave.covered}/${mustHave.total}`, label: "Non-negotiables proven" },
    { value: expectationCount, label: "Researched expectations" },
    { value: `${mustHave.pct}%`, label: "Ready on the basics" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="card-surface overflow-hidden"
    >
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* ── Left: copy & stats ── */}
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
            <Plane className="h-7 w-7" strokeWidth={1.7} />
          </div>

          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Job Mirror · {roleName}
          </p>

          <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">
            What the market
            <br />
            actually asks for
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">{headline}</p>

          {isFallback && (
            <p className="mt-4 max-w-md rounded-2xl bg-amber-500/10 p-4 text-xs leading-5 text-amber-700">
              Your target role isn't one of the eight roles we researched, so you're seeing general
              entry-level guidance. Pick a researched role below to get specifics.
            </p>
          )}

          <div className="mt-9 flex flex-wrap gap-x-12 gap-y-6">
            {stats.map(({ value, label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2 + index * 0.09,
                }}
              >
                <p className="font-display text-[clamp(2rem,4.5vw,2.75rem)] font-semibold leading-none tracking-tight">
                  {value}
                </p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.7} />
            Market data researched {lastResearched}
          </p>
        </div>

        {/* ── Right: illustration ── */}
        <div className="relative hidden min-h-[260px] items-center justify-center overflow-hidden bg-[#fff5ee] lg:flex">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-terracotta/5" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-terracotta/5" />

          <motion.img
            src={jobMirrorHero}
            alt="Person reviewing job market expectations on a laptop"
            className="relative z-10 h-auto w-full max-w-[340px] object-contain"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </div>
      </div>
    </motion.section>
  );
}
