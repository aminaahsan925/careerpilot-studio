import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe2,
  Lightbulb,
  Target,
  ListChecks,
  ShieldX,
  Award,
  BookOpen,
  CheckCircle2,
  Layers,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useJobMirror } from "@/data/jobmirror";
import { Skeleton } from "@/lib/animation";
import type { JobMirrorReport } from "@/lib/jobmirror.server";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { FitVerdict } from "@/components/flightplan/FitVerdict";
import { FlightPlanHero } from "@/components/flightplan/FlightPlanHero";
import { JobReadinessAssessment } from "@/components/flightplan/JobReadinessAssessment";
import { Cite, Provenance } from "@/components/flightplan/MarketTruthNote";
import { RejectionTruth } from "@/components/flightplan/RejectionTruth";
import { SkillMirror } from "@/components/flightplan/SkillMirror";

export const Route = createFileRoute("/_authenticated/flightplan")({
  head: () => ({
    meta: [
      { title: "Flight Plan — CareerPilot AI" },
      {
        name: "description",
        content:
          "What employers actually require for your target role, held up against your proof.",
      },
    ],
  }),
  component: FlightPlanPage,
});

const LAYOUT_TITLE = "Flight Plan";
const LAYOUT_SUBTITLE =
  "Researched employer expectations, skill proof matching, and market readiness.";

type FlightPlanTab = "readiness" | "skills" | "filters" | "dataset" | "verdict";

/* ------------------------------------------------------------------ */
/* Role Picker                                                        */
/* ------------------------------------------------------------------ */

function RolePicker({
  report,
  activeRole,
  onPick,
}: {
  report: JobMirrorReport;
  activeRole: string | null;
  onPick: (roleId: string | null) => void;
}) {
  return (
    <div className="card-surface p-6 sm:p-8 space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground">Target Role Selection</h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Select any of the in-depth researched industry roles to mirror your skills against real market demands.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {activeRole !== null && (
          <button
            type="button"
            onClick={() => onPick(null)}
            className="rounded-xl border border-terracotta/40 bg-terracotta/10 px-4 py-2 text-xs font-semibold text-terracotta transition hover:bg-terracotta hover:text-white"
          >
            Use Saved Target ({report.role.requested})
          </button>
        )}
        {report.researchedRoles.map((role) => {
          const isActive = report.role.roleId === role.roleId;
          return (
            <button
              type="button"
              key={role.roleId}
              onClick={() => onPick(role.displayName)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-terracotta text-white shadow-lift"
                  : "bg-secondary/80 text-foreground hover:bg-secondary border border-border"
              )}
            >
              {role.displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabbed Pakistan Dataset & Market Context                           */
/* ------------------------------------------------------------------ */

function PakistanContext({ pakistan }: { pakistan: JobMirrorReport["pakistan"] }) {
  const [dataTab, setDataTab] = useState<"norms" | "houses" | "comparison" | "freelance">("norms");

  return (
    <div className="card-surface p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
            <Globe2 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Market Research Dataset</h3>
            <p className="text-xs text-muted-foreground">Verifiable hiring norms & entry paths for tech professionals.</p>
          </div>
        </div>

        {/* Dataset Sub-Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-secondary/60 p-1">
          {[
            { id: "norms", label: "Hiring Norms" },
            { id: "houses", label: "Software Houses" },
            { id: "comparison", label: "Local vs Global" },
            { id: "freelance", label: "Freelance Reality" },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setDataTab(tab.id as typeof dataTab)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition",
                dataTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {dataTab === "norms" && (
          <motion.div
            key="norms"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <h4 className="text-[13px] font-bold text-foreground">Verified Local Hiring Standards</h4>
            {pakistan.hiringNorms.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {pakistan.hiringNorms.map((norm) => (
                  <div key={norm.statement} className="rounded-xl border border-border/80 bg-background/50 p-4">
                    <p className="text-[13px] leading-relaxed text-foreground font-medium">{norm.statement}</p>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <Cite citation={norm.citation} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No specific hiring norm data recorded for this role.</p>
            )}
          </motion.div>
        )}

        {dataTab === "houses" && (
          <motion.div
            key="houses"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-terracotta" />
              <h4 className="text-[13px] font-bold text-foreground">Primary Entry Software Houses & Agencies</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Software houses identified in research as standard career launching pads:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {pakistan.softwareHouses.map((house) => (
                <span
                  key={house}
                  className="rounded-lg border border-border bg-secondary px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm"
                >
                  {house}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {dataTab === "comparison" && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <h4 className="text-[13px] font-bold text-foreground">Local Employers vs. International Remote Clients</h4>
            {pakistan.employerVsInternationalClient.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2.5 font-bold uppercase tracking-wider text-muted-foreground">Dimension</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider text-muted-foreground">Pakistani Employers</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider text-terracotta">International Clients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pakistan.employerVsInternationalClient.map((row) => (
                      <tr className="border-b border-border/60 last:border-0" key={row.dimension}>
                        <td className="py-3 font-semibold text-foreground">{row.dimension}</td>
                        <td className="py-3 text-muted-foreground pr-4">{row.pakistaniEmployers}</td>
                        <td className="py-3 font-medium text-foreground">{row.internationalClients}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Comparative matrix available for core technical roles.</p>
            )}
          </motion.div>
        )}

        {dataTab === "freelance" && (
          <motion.div
            key="freelance"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <h4 className="text-[13px] font-bold text-foreground">Freelance Route Analysis</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {pakistan.freelanceReality.map((item) => (
                <div key={item.statement} className="rounded-xl border border-border/80 bg-background/50 p-4">
                  <p className="text-[13px] leading-relaxed text-foreground">{item.statement}</p>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <Cite citation={item.citation} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HowItWorksCard() {
  const stages = [
    {
      title: "1. Verified Research Data",
      text: "Expectations come from cited industry research, not synthetic filler.",
    },
    {
      title: "2. Evidence-Based Matching",
      text: "Skills count as proven only when backed by code or project proof.",
    },
    {
      title: "3. Targeted Priority Build",
      text: "Identify the single project proof that closes your biggest gap.",
    },
  ];

  return (
    <aside className="card-surface h-fit p-6 sm:p-7 space-y-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
        <Lightbulb className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <h3 className="font-display text-base font-bold text-foreground">Flight Plan Protocol</h3>
      <div className="h-px bg-border" />
      <div className="space-y-3">
        {stages.map(({ title, text }) => (
          <div key={title}>
            <p className="text-[13px] font-semibold text-foreground">{title}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Main Flight Plan Page                                              */
/* ------------------------------------------------------------------ */

function FlightPlanPage() {
  const [roleOverride, setRoleOverride] = useState<string | null>(null);
  const { data: report, isLoading, error } = useJobMirror(roleOverride ?? undefined);
  const [activeTab, setActiveTab] = useState<FlightPlanTab>("readiness");

  if (isLoading) return <LoadingState />;
  if (error || !report) return <ErrorState error={error} />;

  return (
    <AppLayout title={LAYOUT_TITLE} subtitle={LAYOUT_SUBTITLE}>
      <div className="space-y-6 pb-12">
        {/* HERO COCKPIT HEADER */}
        <FlightPlanHero
          roleName={report.role.displayName}
          headline={report.role.headline}
          lastResearched={report.provenance.lastResearched}
          mustHave={report.coverage.mustHave}
          expectationCount={report.skills.length}
          isFallback={report.role.isFallback}
        />

        {/* ELEGANT TABS NAVIGATION BAR */}
        <div className="card-surface p-2 sm:p-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "readiness", label: "01 Target & Readiness", icon: Target },
              { id: "skills", label: "02 Skill Mirror", icon: ListChecks },
              { id: "filters", label: "03 Rejection Filters", icon: ShieldX },
              { id: "dataset", label: "04 Market Research Dataset", icon: Globe2 },
              { id: "verdict", label: "05 Fit Verdict", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FlightPlanTab)}
                  className={cn(
                    "flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12.5px] font-semibold transition-all duration-200",
                    isActive
                      ? "bg-terracotta text-white shadow-lift"
                      : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {activeTab === "readiness" && (
            <motion.div
              key="readiness"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.75fr)]"
            >
              <div className="space-y-6">
                <RolePicker report={report} activeRole={roleOverride} onPick={setRoleOverride} />
                <JobReadinessAssessment
                  roleName={report.role.requested || report.role.displayName}
                  hasResume={report.studentEvidence.hasResume}
                />
              </div>
              <HowItWorksCard />
            </motion.div>
          )}

          {activeTab === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SkillMirror skills={report.skills} coverage={report.coverage} />
            </motion.div>
          )}

          {activeTab === "filters" && (
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RejectionTruth
                whatJuniorsLack={report.whatJuniorsLack}
                rejectionReasons={report.rejectionReasons}
                evidenceHierarchy={report.evidenceHierarchy}
                evidenceEmployersTrust={report.evidenceEmployersTrust}
              />
            </motion.div>
          )}

          {activeTab === "dataset" && (
            <motion.div
              key="dataset"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PakistanContext pakistan={report.pakistan} />
            </motion.div>
          )}

          {activeTab === "verdict" && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FitVerdict report={report} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROVENANCE FOOTER */}
        <Provenance
          version={report.provenance.version}
          lastResearched={report.provenance.lastResearched}
          note={report.provenance.note}
          staleFieldGroups={report.provenance.staleFieldGroups}
        />
      </div>
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Loading & Error States                                              */
/* ------------------------------------------------------------------ */

function LoadingState() {
  return (
    <AppLayout title={LAYOUT_TITLE} subtitle={LAYOUT_SUBTITLE}>
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Please try again in a moment.";
  const lowerMessage = message.toLowerCase();
  const needsTarget = lowerMessage.includes("target career");
  const needsSignIn = lowerMessage.includes("session") || lowerMessage.includes("sign in");

  return (
    <AppLayout title={LAYOUT_TITLE} subtitle={LAYOUT_SUBTITLE}>
      <div className="card-surface flex min-h-[320px] items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <p className="text-[16px] font-bold text-foreground">
            {needsTarget
              ? "Pick a target role first"
              : needsSignIn
                ? "Your Flight Plan session has expired"
                : "Flight Plan couldn't be loaded."}
          </p>
          <p className="text-[13px] text-muted-foreground">{message}</p>
          {needsSignIn ? (
            <Link
              to="/auth"
              search={{ redirect: "/flightplan", reset: undefined }}
              className="inline-block rounded-xl bg-terracotta px-5 py-2.5 text-[13px] font-semibold text-primary-foreground"
            >
              Sign in again
            </Link>
          ) : (
            <Link
              to={needsTarget ? "/onboarding" : "/dashboard"}
              className="inline-block rounded-xl bg-terracotta px-5 py-2.5 text-[13px] font-semibold text-primary-foreground"
            >
              {needsTarget ? "Set your target role" : "Back to Dashboard"}
            </Link>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
