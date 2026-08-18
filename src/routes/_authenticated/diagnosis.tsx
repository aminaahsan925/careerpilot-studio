import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Target } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/app/AppLayout";
import { useCareerOverview, useRunDiagnosis, useSetCareerTarget } from "@/data/career";
import { useGenerateRoadmap } from "@/data/roadmap";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/diagnosis")({
  head: () => ({
    meta: [
      { title: "Career Diagnosis — CareerPilot AI" },
      {
        name: "description",
        content:
          "See your real career stage, top blockers, readiness and the single next best action toward your target role.",
      },
      { property: "og:title", content: "Career Diagnosis — CareerPilot AI" },
      {
        property: "og:description",
        content: "Honest gap-to-action career diagnosis based on your real profile evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiagnosisPage,
});

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("card-surface p-5", className)}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

const gapStyles: Record<string, string> = {
  matched: "bg-emerald-50 text-emerald-700",
  partial: "bg-terracotta/12 text-terracotta",
  missing: "bg-ink text-white",
  missing_evidence: "bg-secondary text-foreground",
};

function TargetPicker() {
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const setTarget = useSetCareerTarget();

  return (
    <Card className="max-w-xl">
      <Label>Step 1</Label>
      <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">
        Choose your target career to start.
      </h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        CareerPilot can only diagnose gaps once it knows where you're heading.
      </p>
      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setTarget.mutate(
            { role: role.trim(), industry: industry.trim() || undefined },
            {
              onError: (err) => toast.error((err as Error).message),
              onSuccess: () => toast.success("Target career saved"),
            },
          );
        }}
      >
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Target role (e.g. Data Analyst)"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] outline-none focus:border-terracotta"
        />
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Industry (optional)"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] outline-none focus:border-terracotta"
        />
        <button
          type="submit"
          disabled={setTarget.isPending || !role.trim()}
          className="flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          {setTarget.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
          Set target career
        </button>
      </form>
    </Card>
  );
}

function DiagnosisPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useCareerOverview();
  const run = useRunDiagnosis();
  const generateRoadmap = useGenerateRoadmap();

  if (isLoading || !data) {
    return (
      <AppLayout title="Career Diagnosis" subtitle="Loading your career state">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!data.targetRole) {
    return (
      <AppLayout title="My Career Diagnosis" subtitle="Start with a destination">
        <TargetPicker />
      </AppLayout>
    );
  }

  const d = data.diagnosis;
  const readiness = d?.readiness.overall ?? data.readiness?.overall ?? null;
  const stage = d?.stage ?? data.readiness?.stage ?? "Not assessed yet";
  const analyzing = run.isPending;

  const analyze = () =>
    run.mutate(undefined, {
      onError: (err) => toast.error((err as Error).message),
      onSuccess: () => toast.success("Career diagnosis updated"),
    });

  return (
    <AppLayout title="My Career Diagnosis" subtitle="Honest gaps, one next action">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Current stage</Label>
                <p className="mt-1.5 text-[16px] font-bold">{stage}</p>
              </div>
              <div>
                <Label>Target career</Label>
                <p className="mt-1.5 text-[16px] font-bold">{data.targetRole}</p>
              </div>
              <div>
                <Label>Target job</Label>
                <p className="mt-1.5 text-[16px] font-bold">
                  {data.targetJob
                    ? `${data.targetJob.title}${data.targetJob.company ? ` @ ${data.targetJob.company}` : ""}`
                    : "—"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={analyze}
              disabled={analyzing}
              className="flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
              {d ? "Reassess my career" : "Analyze my career"}
            </button>
          </div>
          {!data.hasResume ? (
            <p className="mt-4 text-[12.5px] text-muted-foreground">
              Add your resume to improve evidence quality.
            </p>
          ) : null}
        </Card>

        {!d ? (
          <Card>
            <p className="text-[14px] font-semibold">
              Run your Career Diagnosis to see what you should improve.
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              CareerPilot uses only your real recorded profile, skills, evidence and target job.
            </p>
          </Card>
        ) : (
          <>
            {/* NEXT BEST ACTION */}
            {d.nextBestAction?.action ? (
              <Card className="border-terracotta/40 bg-terracotta/[0.06]">
                <Label>Next best action</Label>
                <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.02em]">
                  {d.nextBestAction.action}
                </h2>
                {d.nextBestAction.why ? (
                  <p className="mt-3 text-[13.5px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Why: </span>
                    {d.nextBestAction.why}
                  </p>
                ) : null}
                {d.nextBestAction.evidence_to_produce ? (
                  <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Evidence to produce: </span>
                    {d.nextBestAction.evidence_to_produce}
                  </p>
                ) : null}
                {d.nextBestAction.estimated_effort ? (
                  <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                    Estimated effort: {d.nextBestAction.estimated_effort}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={generateRoadmap.isPending}
                  onClick={() =>
                    generateRoadmap.mutate(undefined, {
                      onError: (err) => toast.error((err as Error).message),
                      onSuccess: () => {
                        toast.success("Added to your roadmap");
                        void navigate({ to: "/roadmap" });
                      },
                    })
                  }
                  className="mt-5 flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                >
                  {generateRoadmap.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Start this action
                </button>
              </Card>
            ) : null}

            {/* READINESS */}
            <Card>
              <div className="flex items-baseline justify-between">
                <Label>Readiness</Label>
                <p className="text-[28px] font-bold tracking-[-0.03em]">
                  {readiness ?? "—"}
                  <span className="text-[13px] font-medium text-muted-foreground">/100</span>
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {d.readiness.breakdown.length ? (
                  d.readiness.breakdown.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between text-[13px] font-semibold">
                        <span>{b.label}</span>
                        <span>{b.score}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-secondary">
                        <div
                          className="h-1.5 rounded-full bg-terracotta"
                          style={{ width: `${Math.max(0, Math.min(100, b.score))}%` }}
                        />
                      </div>
                      {b.explanation ? (
                        <p className="mt-1 text-[12px] text-muted-foreground">{b.explanation}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-muted-foreground">Not enough evidence yet.</p>
                )}
              </div>
              {d.blockers[0] ? (
                <p className="mt-4 text-[13px]">
                  <span className="font-semibold">Main blocker: </span>
                  {d.blockers[0].problem}
                </p>
              ) : null}
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* STRENGTHS */}
              <Card>
                <Label>What I'm doing well</Label>
                <ul className="mt-3 space-y-2">
                  {d.strengths.length ? (
                    d.strengths.map((s) => (
                      <li key={s} className="flex gap-2 text-[13.5px]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-[13px] text-muted-foreground">
                      Nothing recorded yet — add a project so CareerPilot can evaluate practical
                      evidence.
                    </li>
                  )}
                </ul>
              </Card>

              {/* EVIDENCE SUMMARY */}
              <Card>
                <Label>Skill / evidence status</Label>
                <div className="mt-3 space-y-3 text-[13px]">
                  <div>
                    <p className="font-semibold">Demonstrated</p>
                    <p className="text-muted-foreground">
                      {d.evidenceSummary.demonstrated.join(", ") || "None yet"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Claimed only (no proof)</p>
                    <p className="text-muted-foreground">
                      {d.evidenceSummary.claimed_only.join(", ") || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Unknown</p>
                    <p className="text-muted-foreground">
                      {d.evidenceSummary.unknown.join(", ") || "None"}
                    </p>
                  </div>
                </div>
                {data.gaps.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.gaps.map((g) => (
                      <span
                        key={g.skill}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                          gapStyles[g.status] ?? "bg-secondary text-foreground",
                        )}
                      >
                        {g.skill} · {g.status.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>
            </div>

            {/* BLOCKERS */}
            <Card>
              <Label>Top career blockers</Label>
              <div className="mt-4 space-y-4">
                {d.blockers.length ? (
                  d.blockers.map((b, i) => (
                    <div key={b.problem} className="rounded-xl border border-border p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                        <p className="text-[14px] font-bold">
                          {i + 1}. {b.problem}
                        </p>
                      </div>
                      <dl className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
                        {b.why_it_matters ? (
                          <p>
                            <span className="font-semibold text-foreground">Why it matters: </span>
                            {b.why_it_matters}
                          </p>
                        ) : null}
                        {b.evidence ? (
                          <p>
                            <span className="font-semibold text-foreground">Evidence: </span>
                            {b.evidence}
                          </p>
                        ) : null}
                        {b.impact ? (
                          <p>
                            <span className="font-semibold text-foreground">Impact: </span>
                            {b.impact}
                          </p>
                        ) : null}
                        {b.fix ? (
                          <p>
                            <span className="font-semibold text-foreground">Fix: </span>
                            {b.fix}
                          </p>
                        ) : null}
                      </dl>
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-muted-foreground">No blockers detected.</p>
                )}
              </div>
            </Card>

            {/* PRIORITIES */}
            <Card>
              <Label>Priorities</Label>
              <div className="mt-4 space-y-3">
                {d.priorities.length ? (
                  d.priorities.map((p) => (
                    <div key={p.title} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13.5px] font-bold">{p.title}</p>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                          {p.impact}
                        </span>
                      </div>
                      {p.reason ? (
                        <p className="mt-2 text-[13px] text-muted-foreground">{p.reason}</p>
                      ) : null}
                      {p.action ? (
                        <p className="mt-1 text-[13px] text-muted-foreground">
                          <span className="font-semibold text-foreground">Action: </span>
                          {p.action}
                        </p>
                      ) : null}
                      {p.evidence_to_produce ? (
                        <p className="mt-1 text-[13px] text-muted-foreground">
                          <span className="font-semibold text-foreground">Evidence: </span>
                          {p.evidence_to_produce}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-muted-foreground">No priorities yet.</p>
                )}
              </div>
            </Card>

            {/* SEQUENCE */}
            <div className="grid gap-4 sm:grid-cols-3">
              {(["now", "next", "after"] as const).map((when) => {
                const item = d.sequence.find((s) => s.when === when);
                return (
                  <Card key={when}>
                    <Label>{when === "after" ? "After that" : when}</Label>
                    <p className="mt-2 text-[13.5px]">
                      {item?.action ?? <span className="text-muted-foreground">—</span>}
                    </p>
                  </Card>
                );
              })}
            </div>

            {d.progressNote ? (
              <Card>
                <Label>Since last diagnosis</Label>
                <p className="mt-2 text-[13.5px]">{d.progressNote}</p>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}
