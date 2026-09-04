import { ListChecks, ScanSearch, ShieldX, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  ["1", "Target Role", "Confirm role alignment", ScanSearch],
  ["2", "Skill Mirror", "Market expectations vs proof", ListChecks],
  ["3", "Rejection Filters", "Why candidates get cut", ShieldX],
  ["4", "Fit Verdict", "Your readiness position", Target],
] as const;

export function FlightPlanStepRail({ active }: { active: 1 | 2 | 3 | 4 }) {
  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {STEPS.map(([number, label, detail, Icon], index) => {
          const isActive = active === Number(number);
          const isCompleted = active > Number(number);

          return (
            <div key={label} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-all duration-200",
                    isCompleted
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : isActive
                        ? "bg-terracotta text-white shadow-lift"
                        : "bg-secondary text-muted-foreground border border-border"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-terracotta">
                      Step {number}
                    </span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
                    )}
                  </div>
                  <p className={cn("text-[13.5px] font-bold leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">{detail}</p>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div className="hidden flex-1 items-center justify-center md:flex px-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
