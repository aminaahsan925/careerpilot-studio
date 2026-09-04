import { motion } from "motion/react";
import { CheckCircle2, CircleDashed, CircleSlash } from "lucide-react";

import type { MirrorSkill, SkillStatus, TierCoverage } from "@/lib/jobmirror.server";
import { cn } from "@/lib/utils";
import { Cite } from "./MarketTruthNote";

const STATUS_META: Record<
  SkillStatus,
  { icon: typeof CheckCircle2; label: string; className: string; ring: string }
> = {
  demonstrated: {
    icon: CheckCircle2,
    label: "Proven",
    className: "text-emerald-600",
    ring: "bg-emerald-500/10",
  },
  claimed: {
    icon: CircleDashed,
    label: "Claimed — no proof",
    className: "text-amber-600",
    ring: "bg-amber-500/10",
  },
  missing: {
    icon: CircleSlash,
    label: "Not recorded",
    className: "text-muted-foreground",
    ring: "bg-secondary",
  },
};

function CoverageBar({ label, coverage }: { label: string; coverage: TierCoverage }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-display text-base font-semibold text-foreground">
            {coverage.covered}
          </span>
          /{coverage.total} proven
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-terracotta"
          initial={{ width: 0 }}
          animate={{ width: `${coverage.pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function SkillRow({ skill, index }: { skill: MirrorSkill; index: number }) {
  const meta = STATUS_META[skill.status];
  const Icon = meta.icon;

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="flex gap-3 border-b border-border py-4 last:border-0"
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          meta.ring,
          meta.className,
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-sm font-medium">{skill.skill}</p>
          <span className={cn("text-[11px] font-medium", meta.className)}>{meta.label}</span>
        </div>

        {skill.note && (
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{skill.note}</p>
        )}

        {skill.matchedRecord && (
          <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
            Matched from your record: {skill.matchedRecord}
          </p>
        )}

        {skill.citation && (
          <div className="mt-1.5">
            <Cite citation={skill.citation} />
          </div>
        )}
      </div>
    </motion.li>
  );
}

/**
 * The mirror itself: what the market requires for this role, and whether
 * the student can actually prove each item. Requirements and their
 * percentages come from the research dataset; statuses come from the
 * student's own records.
 */
export function SkillMirror({
  skills,
  coverage,
}: {
  skills: MirrorSkill[];
  coverage: { mustHave: TierCoverage; tools: TierCoverage; differentiators: TierCoverage };
}) {
  const groups = [
    {
      tier: "must-have" as const,
      title: "Non-negotiables",
      blurb: "Missing one of these ends the application. There is no partial credit here.",
    },
    {
      tier: "tool" as const,
      title: "Tools that show up across postings",
      blurb: "Expected working familiarity — not deep expertise.",
    },
    {
      tier: "differentiator" as const,
      title: "What actually makes a junior stand out",
      blurb: "These are the items that separate two otherwise identical candidates.",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="card-surface grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
        <CoverageBar label="Non-negotiables" coverage={coverage.mustHave} />
        <CoverageBar label="Tools" coverage={coverage.tools} />
        <CoverageBar label="Differentiators" coverage={coverage.differentiators} />
      </div>

      {groups.map((group) => {
        const rows = skills.filter((skill) => skill.tier === group.tier);
        if (rows.length === 0) return null;

        return (
          <div className="card-surface p-6 sm:p-8" key={group.tier}>
            <h3 className="font-display text-lg font-semibold">{group.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{group.blurb}</p>
            <ul className="mt-4">
              {rows.map((skill, index) => (
                <SkillRow key={skill.skill} skill={skill} index={index} />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
