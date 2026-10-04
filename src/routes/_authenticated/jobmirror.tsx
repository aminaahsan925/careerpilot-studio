import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  ExternalLink,
  ShieldCheck,
  TriangleAlert,
  Link2,
  Unlink,
  Target,
  ListChecks,
  GitCompareArrows,
  FileSearch,
  CircleHelp,
} from "lucide-react";

import {
  useCompanyPostingFrequency,
  usePostingDeepDive,
  useStoredJobs,
  useStoredJobsWithCoverage,
  useThreeWayComparison,
  type PostingDeepDive,
  type ThreeWayComparison,
} from "@/data/job-intel";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/lib/animation";

export const Route = createFileRoute("/_authenticated/jobmirror")({
  validateSearch: (search: Record<string, unknown>) => ({
    job:
      typeof search["job"] === "string" ? (search["job"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Job Mirror — CareerPilot AI" },
      {
        name: "description",
        content:
          "Your saved postings against your proof: deep-dives, posting frequency, and candidate-vs-company-vs-job comparison.",
      },
    ],
  }),
  component: JobMirrorPage,
});

const LAYOUT_TITLE = "Job Mirror";
const LAYOUT_SUBTITLE =
  "Your saved postings held up against your proof — deterministic matching over real stored requirements, with verified application links.";

type MirrorTab = "deepdive" | "frequency" | "threeway";

/* ------------------------------------------------------------------ */
/* Badges                                                               */
/* ------------------------------------------------------------------ */

function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
        level === "PROVEN" && "bg-emerald-500/10 text-emerald-700",
        level === "MISSING" && "bg-red-500/10 text-red-700",
        !["PROVEN", "MISSING"].includes(level) &&
          "bg-secondary text-muted-foreground",
      )}
    >
      {level.replace(/_/g, " ")}
    </span>
  );
}

function ImportanceBadge({
  importance,
}: {
  importance: "must_have" | "preferred" | null;
}) {
  if (!importance)
    return <span className="text-[11px] text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
        importance === "must_have"
          ? "bg-terracotta/10 text-terracotta"
          : "bg-secondary text-muted-foreground",
      )}
    >
      {importance === "must_have" ? "Must-have" : "Preferred"}
    </span>
  );
}

function LinkKindBadge({
  kind,
}: {
  kind: "official" | "aggregator" | "unknown";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        kind === "official" && "bg-emerald-500/10 text-emerald-700",
        kind === "aggregator" && "bg-sky-500/10 text-sky-700",
        kind === "unknown" && "bg-secondary text-muted-foreground",
      )}
    >
      {kind === "official" && (
        <ShieldCheck className="h-3 w-3" strokeWidth={2} />
      )}
      {kind === "aggregator" && <Link2 className="h-3 w-3" strokeWidth={2} />}
      {kind === "unknown" && <CircleHelp className="h-3 w-3" strokeWidth={2} />}
      {kind === "official"
        ? "Official domain"
        : kind === "aggregator"
          ? "Aggregator"
          : "Unclassified link"}
    </span>
  );
}

function ReachabilityBadge({ reachable }: { reachable: boolean | null }) {
  if (reachable === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
        <CircleHelp className="h-3 w-3" strokeWidth={2} />
        Not checked
      </span>
    );
  }
  return reachable ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <ShieldCheck className="h-3 w-3" strokeWidth={2} />
      Reachable
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-700">
      <Unlink className="h-3 w-3" strokeWidth={2} />
      Unreachable
    </span>
  );
}

function ProvenanceNote({ text }: { text: string }) {
  return <p className="text-[11px] text-muted-foreground">{text}</p>;
}

/* ------------------------------------------------------------------ */
/* Postings picker                                                      */
/* ------------------------------------------------------------------ */

function PostingsPicker({
  activeJobId,
  onPick,
}: {
  activeJobId: string | null;
  onPick: (jobId: string) => void;
}) {
  const { data: jobs, isLoading, error } = useStoredJobsWithCoverage();

  if (isLoading) {
    return (
      <div className="card-surface space-y-3 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface p-6">
        <p className="text-sm font-semibold text-foreground">
          Saved postings couldn't be loaded.
        </p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="card-surface space-y-3 p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
          <Briefcase className="h-6 w-6" strokeWidth={1.7} />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">
          No saved postings yet
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Postings are saved automatically when you research the job market on
          the Market Reality page. Once a posting is stored, the Job Mirror
          deep-dives it: extracted requirements, your deterministic gap
          analysis, posting frequency, and verified application links.
        </p>
        <Link to="/market">
          <Button>Research the market</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card-surface space-y-3 p-6 sm:p-8">
      <h3 className="font-display text-lg font-bold text-foreground">
        Your saved postings
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onPick(job.id)}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              activeJobId === job.id
                ? "border-terracotta/60 bg-terracotta/5"
                : "border-border hover:border-terracotta/40",
            )}
          >
            <p className="truncate text-sm font-bold text-foreground">
              {job.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {[job.company, job.locationCity, job.locationCountry]
                .filter(Boolean)
                .join(" · ") || "Company not specified"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {job.coveragePct !== null ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    job.coveragePct >= 70 &&
                      "bg-emerald-500/10 text-emerald-700",
                    job.coveragePct < 70 &&
                      job.coveragePct >= 40 &&
                      "bg-amber-500/10 text-amber-700",
                    job.coveragePct < 40 && "bg-red-500/10 text-red-700",
                  )}
                >
                  {job.coveragePct}% match
                </span>
              ) : (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Not analyzed yet
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                retrieved {new Date(job.retrievedAt).toLocaleDateString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Deep-dive tab                                                        */
/* ------------------------------------------------------------------ */

function DeepDiveSection({ jobId }: { jobId: string }) {
  const { data: dive, isLoading, error } = usePostingDeepDive(jobId);

  if (isLoading) {
    return (
      <div className="card-surface space-y-3 p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }
  if (error || !dive) {
    return (
      <div className="card-surface p-6 sm:p-8">
        <p className="text-sm font-semibold text-foreground">
          The deep-dive couldn't be loaded.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <DeepDiveHeader dive={dive} />
      <RequirementsTable dive={dive} />
      <CoverageSection dive={dive} />
      <LinkValidationCard dive={dive} />
    </div>
  );
}

function DeepDiveHeader({ dive }: { dive: PostingDeepDive }) {
  const p = dive.provenance;
  return (
    <div className="card-surface space-y-3 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
          <FileSearch className="h-6 w-6" strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {dive.job.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[dive.job.company, dive.job.locationCity, dive.job.locationCountry]
              .filter(Boolean)
              .join(" · ")}
            {dive.job.remoteType !== "unknown" && ` · ${dive.job.remoteType}`}
          </p>
          <div className="mt-3 space-y-1">
            <ProvenanceNote
              text={`Source: ${p.sourceName ?? "unknown provider"} · retrieved ${new Date(p.retrievedAt).toLocaleDateString()}`}
            />
            {p.publishedAt && (
              <ProvenanceNote
                text={`Published ${new Date(p.publishedAt).toLocaleDateString()} · posting expires ${new Date(p.expiresAt).toLocaleDateString()}`}
              />
            )}
            {dive.analysis.fromCache && (
              <ProvenanceNote text="Analysis served from your per-posting cache (job_snapshots)." />
            )}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <p className="font-display text-4xl font-bold text-terracotta">
            {dive.analysis.report.coverage.coveragePct}%
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground">
            deterministic match
          </p>
        </div>
      </div>
    </div>
  );
}

function RequirementsTable({ dive }: { dive: PostingDeepDive }) {
  if (dive.requirements.length === 0) {
    return (
      <div className="card-surface space-y-2 p-6 sm:p-8">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <ListChecks className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
          Extracted requirements
        </h3>
        <p className="text-sm text-muted-foreground">
          No structured requirements were extracted for this posting — it may
          predate requirement extraction or the description was too short.
          Nothing is invented here: the gap analysis below only reflects what
          was actually extracted.
        </p>
      </div>
    );
  }
  return (
    <div className="card-surface space-y-3 p-6 sm:p-8">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <ListChecks className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
        Extracted requirements
        <span className="text-sm font-semibold text-muted-foreground">
          ({dive.requirements.length})
        </span>
      </h3>
      <ul className="space-y-2">
        {dive.requirements.map((r, i) => (
          <li
            key={`${r.skill}-${i}`}
            className="rounded-xl border border-border bg-background px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{r.skill}</p>
              <ImportanceBadge importance={r.importance} />
            </div>
            {r.sourceText && (
              <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">
                “{r.sourceText}”
              </p>
            )}
          </li>
        ))}
      </ul>
      <ProvenanceNote text="Requirements are extracted deterministically from the stored posting — never written by the AI." />
    </div>
  );
}

function CoverageSection({ dive }: { dive: PostingDeepDive }) {
  const coverage = dive.analysis.report.coverage;
  return (
    <div className="card-surface space-y-4 p-6 sm:p-8">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Target className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
        Your gap against this posting
      </h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-secondary/60 p-3">
          <p className="font-display text-xl font-bold text-foreground">
            {coverage.mustHave.proven}/{coverage.mustHave.total}
          </p>
          <p className="text-[11px] text-muted-foreground">must-haves proven</p>
        </div>
        <div className="rounded-xl bg-secondary/60 p-3">
          <p className="font-display text-xl font-bold text-foreground">
            {coverage.preferred.proven}/{coverage.preferred.total}
          </p>
          <p className="text-[11px] text-muted-foreground">preferred proven</p>
        </div>
        <div className="rounded-xl bg-secondary/60 p-3">
          <p className="font-display text-xl font-bold text-red-600">
            {coverage.criticalGaps.length}
          </p>
          <p className="text-[11px] text-muted-foreground">critical gaps</p>
        </div>
      </div>
      {coverage.criticalGaps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground">Critical gaps</h4>
          <ul className="space-y-1.5">
            {coverage.criticalGaps.map((g) => (
              <li
                key={g.skill}
                className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">
                  {g.skill}
                </span>
                <LevelBadge level={g.level} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-terracotta">
          All {coverage.classifications.length} requirement classifications
        </summary>
        <ul className="mt-3 space-y-1.5">
          {coverage.classifications.map((c) => (
            <li
              key={c.skill}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {c.skill}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.reason}
                </p>
              </div>
              <LevelBadge level={c.level} />
            </li>
          ))}
        </ul>
      </details>
      <ProvenanceNote text="Deterministic matching only — the AI explains, it never scores. Cached per posting for 30 days." />
    </div>
  );
}

function LinkValidationCard({ dive }: { dive: PostingDeepDive }) {
  const link = dive.link;
  return (
    <div className="card-surface space-y-3 p-6 sm:p-8">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Link2 className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
        Application link
      </h3>
      {!link.url && (
        <p className="text-sm text-muted-foreground">
          This posting has no application URL stored.
        </p>
      )}
      {link.url && (
        <>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-foreground underline decoration-dotted underline-offset-2 hover:text-terracotta"
          >
            <span className="truncate">{link.url}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} />
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <LinkKindBadge kind={link.kind} />
            <ReachabilityBadge reachable={link.reachable} />
            {link.httpStatus !== null && (
              <span className="text-[11px] text-muted-foreground">
                HTTP {link.httpStatus}
              </span>
            )}
          </div>
          {link.finalUrl && (
            <ProvenanceNote text={`Redirects to ${link.finalUrl}`} />
          )}
          {link.checkedAt && (
            <ProvenanceNote
              text={`Checked ${new Date(link.checkedAt).toLocaleDateString()}${link.fromCache ? " (cached)" : ""} · reachable verdicts trusted 7 days, failures re-checked after 24h.`}
            />
          )}
          {link.reachable === false && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-800">
              <TriangleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={2}
              />
              This link didn't respond when last checked. It may be a dead
              posting or a temporary outage — the verdict refreshes
              automatically.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Frequency tab                                                        */
/* ------------------------------------------------------------------ */

function FrequencySection({ company }: { company: string | null }) {
  const [input, setInput] = useState(company ?? "");
  const [activeCompany, setActiveCompany] = useState(company ?? "");
  const { data, isLoading, error } = useCompanyPostingFrequency(
    activeCompany || null,
  );

  useEffect(() => {
    if (company) {
      setInput(company);
      setActiveCompany(company);
    }
  }, [company]);

  return (
    <div className="space-y-6">
      <div className="card-surface space-y-3 p-6 sm:p-8">
        <h3 className="font-display text-lg font-bold text-foreground">
          Requirement frequency across postings
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Real counts from your stored postings for one employer — which skills
          appear across their postings, and how often. Nothing here is a market
          estimate.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) setActiveCompany(input.trim());
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Company name…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-terracotta/60"
          />
          <Button type="submit">Analyze</Button>
        </form>
      </div>

      {isLoading && (
        <div className="card-surface space-y-3 p-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      )}
      {error && (
        <div className="card-surface p-6">
          <p className="text-sm font-semibold text-foreground">
            Frequency couldn't be loaded.
          </p>
        </div>
      )}
      {data && (
        <div className="card-surface space-y-3 p-6 sm:p-8">
          {data.aggregation.jobsAnalysed === 0 ? (
            <p className="text-sm text-muted-foreground">
              No stored postings found for “{data.company}”. Research the market
              or paste a posting to add one.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-display text-lg font-bold text-foreground">
                  {data.company}
                </h4>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {data.aggregation.jobsAnalysed} postings ·{" "}
                  {data.aggregation.requirementsSeen} requirements
                </span>
              </div>
              <ul className="space-y-1.5">
                {data.aggregation.skills.slice(0, 20).map((s) => (
                  <li
                    key={s.skill}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-2.5"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {s.skill}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {s.total} of {data.aggregation.jobsAnalysed} postings
                      {s.mustHave > 0 && ` · ${s.mustHave} must-have`}
                    </span>
                  </li>
                ))}
              </ul>
              <ProvenanceNote
                text={`Aggregated ${new Date(data.retrievedAt).toLocaleDateString()} from your stored postings. Each skill counts once per posting.`}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Three-way tab                                                        */
/* ------------------------------------------------------------------ */

function ThreeWaySection({ jobId }: { jobId: string }) {
  const { data, isLoading, error } = useThreeWayComparison(jobId);

  if (isLoading) {
    return (
      <div className="card-surface space-y-3 p-6 sm:p-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="card-surface p-6 sm:p-8">
        <p className="text-sm font-semibold text-foreground">
          The comparison couldn't be loaded.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
      </div>
    );
  }
  return <ThreeWayView comparison={data} />;
}

function ThreeWayView({ comparison }: { comparison: ThreeWayComparison }) {
  const c = comparison.companySide;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-surface space-y-2 p-6">
          <h4 className="text-sm font-bold text-foreground">This posting</h4>
          <p className="font-display text-4xl font-bold text-terracotta">
            {comparison.posting.coverage.coveragePct}%
          </p>
          <ProvenanceNote
            text={`${comparison.posting.requirementCount} extracted requirements · stored posting`}
          />
        </div>
        <div className="card-surface space-y-2 p-6">
          <h4 className="text-sm font-bold text-foreground">
            {comparison.company ?? "Company"} overall
          </h4>
          {c.coverage ? (
            <>
              <p className="font-display text-4xl font-bold text-terracotta">
                {c.coverage.coveragePct}%
              </p>
              <ProvenanceNote
                text={`${c.requirementCount} company requirements · ${c.provenance.origin === "seed" ? "static dataset (unverified)" : "company research"}`}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No company-level requirements found.
            </p>
          )}
          {c.note && (
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-700">
              <TriangleAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                strokeWidth={2}
              />
              {c.note}
            </p>
          )}
        </div>
      </div>

      <div className="card-surface space-y-3 p-6 sm:p-8">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <GitCompareArrows
            className="h-5 w-5 text-terracotta"
            strokeWidth={1.7}
          />
          Skill by skill
        </h3>
        {comparison.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Neither the posting nor the company has structured requirements to
            compare.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-3 font-semibold">Skill</th>
                  <th className="pb-2 pr-3 font-semibold">This posting</th>
                  <th className="pb-2 pr-3 font-semibold">Company</th>
                  <th className="pb-2 font-semibold">You</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.skill} className="border-t border-border">
                    <td className="py-2.5 pr-3 font-medium text-foreground">
                      {row.skill}
                    </td>
                    <td className="py-2.5 pr-3">
                      <ImportanceBadge importance={row.postingImportance} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <ImportanceBadge importance={row.companyImportance} />
                    </td>
                    <td className="py-2.5">
                      <LevelBadge level={row.candidateLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ProvenanceNote text="Candidate levels come from the deterministic matcher over your private evidence — never from the AI." />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const TABS: { id: MirrorTab; label: string }[] = [
  { id: "deepdive", label: "01 Deep dive" },
  { id: "frequency", label: "02 Posting frequency" },
  { id: "threeway", label: "03 Three-way" },
];

function JobMirrorPage() {
  const search = Route.useSearch();
  const { data: jobs } = useStoredJobs();
  const [activeJobId, setActiveJobId] = useState<string | null>(
    search.job ?? null,
  );
  const [activeTab, setActiveTab] = useState<MirrorTab>("deepdive");

  // Deep-linking (?job=) and default selection.
  useEffect(() => {
    if (search.job) {
      setActiveJobId(search.job);
      return;
    }
    if (!activeJobId && jobs && jobs.length > 0) {
      setActiveJobId(jobs[0]!.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.job, jobs]);

  const activeJob = jobs?.find((j) => j.id === activeJobId) ?? null;

  return (
    <AppLayout title={LAYOUT_TITLE} subtitle={LAYOUT_SUBTITLE}>
      <div className="space-y-6 pb-12">
        <PostingsPicker activeJobId={activeJobId} onPick={setActiveJobId} />

        {activeJobId && (
          <>
            <div className="card-surface p-2 sm:p-3">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12.5px] font-semibold transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-terracotta text-white shadow-lift"
                        : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "deepdive" && (
              <DeepDiveSection jobId={activeJobId} />
            )}
            {activeTab === "frequency" && (
              <FrequencySection company={activeJob?.company ?? null} />
            )}
            {activeTab === "threeway" && (
              <ThreeWaySection jobId={activeJobId} />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
