import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Check, Flag, FolderClosed } from "lucide-react";

import { AppLayout } from "@/components/app/AppLayout";
import { useCurrentUser } from "@/data/user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Career Roadmap — CareerPilot AI" },
      { name: "description", content: "An editorial, stage-by-stage roadmap to your target role with skills, projects, courses and milestones." },
      { property: "og:title", content: "Career Roadmap — CareerPilot AI" },
      { property: "og:description", content: "Learning stages, projects and milestones toward your target role." },
    ],
  }),
  component: RoadmapPage,
});

const STAGES = [
  {
    title: "Foundations",
    meta: "Weeks 1–3 • Completed",
    done: true,
    skills: ["HTML & CSS", "JavaScript", "Git"],
    project: "Personal portfolio site",
  },
  {
    title: "Frontend Engineering",
    meta: "Weeks 4–7 • In progress",
    done: false,
    skills: ["React", "Next.js", "TypeScript"],
    project: "Dashboard with live data",
  },
  {
    title: "Backend & APIs",
    meta: "Weeks 8–10 • Upcoming",
    done: false,
    skills: ["Node.js", "Express", "Auth"],
    project: "REST API with auth and tests",
  },
  {
    title: "Data & Deployment",
    meta: "Weeks 11–12 • Upcoming",
    done: false,
    skills: ["MongoDB", "CI/CD", "Monitoring"],
    project: "Deployed full stack product",
  },
];

const COURSES = [
  { name: "Advanced React Patterns", provider: "Frontend Masters", weeks: "3 weeks" },
  { name: "Node.js Complete Guide", provider: "Udemy", weeks: "4 weeks" },
  { name: "MongoDB for Developers", provider: "MongoDB University", weeks: "2 weeks" },
];

const MILESTONES = [
  { label: "Ship portfolio", done: true },
  { label: "Complete React stage", done: false },
  { label: "Deploy full stack app", done: false },
  { label: "Land internship offer", done: false },
];

function RoadmapPage() {
  const { data: user } = useCurrentUser();

  return (
    <AppLayout title="Career Roadmap" subtitle="A guided path from where you are to where you're going">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="card-surface overflow-hidden bg-ink p-8 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              Current Goal
            </p>
            <h2 className="editorial-title mt-3 text-[clamp(1.8rem,4vw,2.8rem)]">
              {user?.goal ?? "Your goal"}
            </h2>
            <div className="mt-6 flex items-center gap-4">
              <span className="h-1.5 max-w-[420px] flex-1 overflow-hidden rounded-full bg-white/15">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${user?.goalProgress ?? 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="block h-full rounded-full bg-terracotta"
                />
              </span>
              <span className="text-[13px] font-semibold">{user?.goalProgress ?? 0}% complete</span>
            </div>
          </div>

          <div className="card-surface p-6">
            <h3 className="text-[14.5px] font-bold">Learning Stages</h3>
            <div className="mt-6 space-y-0">
              {STAGES.map((stage, i) => (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="relative flex gap-5 pb-9 last:pb-0"
                >
                  {i < STAGES.length - 1 ? (
                    <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-border" />
                  ) : null}
                  <span
                    className={cn(
                      "z-10 mt-0.5 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border",
                      stage.done
                        ? "border-terracotta bg-terracotta text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {stage.done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[11px] font-bold">{i + 1}</span>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold tracking-[-0.01em]">{stage.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{stage.meta}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {stage.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border px-3 py-1 text-[11.5px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 flex items-center gap-2 text-[12.5px] text-muted-foreground">
                      <FolderClosed className="h-3.5 w-3.5 text-terracotta" />
                      {stage.project}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="text-[14.5px] font-bold">Recommended Courses</h3>
            <div className="mt-4 space-y-1">
              {COURSES.map((c, i) => (
                <div
                  key={c.name}
                  className={cn("flex items-start gap-3 py-3.5", i > 0 && "border-t border-border")}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{c.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {c.provider} • {c.weeks}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="text-[14.5px] font-bold">Milestones</h3>
            <div className="mt-4 space-y-3">
              {MILESTONES.map((m) => (
                <div key={m.label} className="flex items-center gap-2.5 text-[12.5px]">
                  <Flag
                    className={cn(
                      "h-4 w-4 shrink-0",
                      m.done ? "text-terracotta" : "text-muted-foreground/50",
                    )}
                  />
                  <span className={m.done ? "" : "text-muted-foreground"}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface bg-ink p-5 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-terracotta">Next Action</p>
            <p className="mt-2 text-[14px] font-semibold leading-snug">
              Finish the Next.js & React stage this week
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
