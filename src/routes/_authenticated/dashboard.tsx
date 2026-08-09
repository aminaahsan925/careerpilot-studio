import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  MapIcon,
  MessageCircle,
  Mic,
  MoreVertical,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import motivationImg from "@/assets/motivation-architecture.jpg";
import { AppLayout } from "@/components/app/AppLayout";
import { CareerHero } from "@/components/app/CareerHero";
import { Sparkline } from "@/components/app/Sparkline";
import { greeting, useCurrentUser } from "@/data/user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerPilot AI" },
      { name: "description", content: "Track your career score, resume health, roadmap progress and applications in one premium AI career workspace." },
      { property: "og:title", content: "Dashboard — CareerPilot AI" },
      { property: "og:description", content: "Your AI career command center: scores, roadmap, mentor and applications." },
    ],
  }),
  component: DashboardPage,
});

const statusStyles: Record<string, string> = {
  "Under Review": "bg-secondary text-foreground",
  Applied: "bg-emerald-50 text-emerald-700",
  "Interview Scheduled": "bg-ink text-white",
  Offer: "bg-terracotta text-primary-foreground",
};

const stateStyles: Record<string, string> = {
  Active: "bg-terracotta/10 text-terracotta",
  "In Progress": "bg-terracotta/10 text-terracotta",
  Upcoming: "bg-secondary text-muted-foreground",
  Completed: "bg-emerald-50 text-emerald-700",
};

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("card-surface p-5 transition-shadow hover:shadow-lift", className)}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ title, to }: { title: string; to?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[14.5px] font-bold tracking-[-0.01em]">{title}</h3>
      {to ? (
        <Link to={to} className="text-[12px] font-semibold text-terracotta hover:underline">
          View All →
        </Link>
      ) : null}
    </div>
  );
}

function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <AppLayout title="Loading" subtitle="Preparing your workspace">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      </AppLayout>
    );
  }

  const scoreIcons = [Target, FileText, Mic, Sparkles];

  return (
    <AppLayout
      title={
        <span>
          {greeting()}, {user.firstName}
          <span className="ml-1 align-top text-sm text-terracotta">✳</span>
        </span>
      }
      subtitle="Let's continue building your amazing career"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
        {/* LEFT COLUMN */}
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {user.scores.map((score, i) => {
              const Icon = scoreIcons[i] ?? Target;
              const dark = i % 2 === 1;
              return (
                <Card key={score.label}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          dark ? "bg-ink text-white" : "bg-terracotta/12 text-terracotta",
                        )}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <p className="text-[13.5px] font-semibold">{score.label}</p>
                    </div>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">
                        {score.value}
                        <span className="ml-1 text-[13px] font-medium text-muted-foreground">
                          /{score.max}
                        </span>
                      </p>
                    </div>
                    <Sparkline
                      data={score.trend}
                      color={dark ? "var(--ink)" : "var(--terracotta)"}
                      className="h-10 w-[96px]"
                    />
                  </div>

                  <p className="mt-3 flex items-center gap-1 text-[12px] text-muted-foreground">
                    {i === 0 ? <TrendingUp className="h-3.5 w-3.5 text-terracotta" /> : null}
                    {score.note}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <CareerHero personImage={user.heroImage} />

            <Card className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-[14.5px] font-bold">AI Mentor</h3>
                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                </span>
              </div>

              <div className="mt-5 flex-1 space-y-4">
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <p className="rounded-xl rounded-tl-sm bg-secondary px-4 py-3 text-[12.5px] leading-relaxed">
                    Hi {user.firstName}! I&apos;m here to help you with your career journey. What would
                    you like to discuss today?
                  </p>
                </div>

                <div className="flex justify-end">
                  <p className="rounded-xl rounded-tr-sm bg-terracotta px-4 py-2.5 text-[12.5px] font-medium text-primary-foreground">
                    How can I improve my resume?
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="rounded-xl rounded-tl-sm bg-secondary px-4 py-3 text-[12.5px] leading-relaxed">
                      I&apos;ve analyzed your resume and found 4 key areas for improvement. Would you
                      like to see them?
                    </p>
                    <Link
                      to="/resume"
                      className="mt-3 inline-block rounded-lg border border-terracotta px-3 py-1.5 text-[12px] font-semibold text-terracotta transition-colors hover:bg-terracotta/8"
                    >
                      View Suggestions
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                to="/mentor"
                className="mt-5 flex items-center gap-2"
              >
                <span className="flex-1 rounded-xl border border-border px-4 py-3 text-[12.5px] text-muted-foreground">
                  Ask me anything...
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta text-primary-foreground">
                  <Send className="h-4 w-4" />
                </span>
              </Link>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <SectionHead title="Recommended Roadmap" to="/roadmap" />
              <div className="mt-4 space-y-1">
                {user.roadmap.map((step, i) => (
                  <div
                    key={step.title}
                    className={cn(
                      "flex items-center gap-3 py-3",
                      i > 0 && "border-t border-border",
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
                      <MapIcon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{step.title}</p>
                      {i === 0 ? (
                        <p className="text-[11.5px] text-muted-foreground">{step.meta}</p>
                      ) : null}
                    </div>
                    {i === 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
                          <span
                            className="block h-full rounded-full bg-terracotta"
                            style={{ width: `${step.progress}%` }}
                          />
                        </span>
                        <span className="text-[12px] font-semibold">{step.progress}%</span>
                      </div>
                    ) : (
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-[11px] font-semibold",
                          stateStyles[step.state],
                        )}
                      >
                        {step.state}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionHead title="Recent Applications" />
              <div className="mt-4 space-y-1">
                {user.applications.map((app, i) => (
                  <div
                    key={app.company}
                    className={cn("flex items-center gap-3 py-3.5", i > 0 && "border-t border-border")}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-[12px] font-bold">
                      {app.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{app.company}</p>
                      <p className="truncate text-[11.5px] text-muted-foreground">{app.role}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold",
                        statusStyles[app.status],
                      )}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionHead title="Top Skills" to="/resume" />
              <div className="mt-4 space-y-3.5">
                {user.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-3">
                    <p className="w-[110px] shrink-0 truncate text-[12.5px]">{skill.name}</p>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="block h-full rounded-full bg-terracotta"
                      />
                    </span>
                    <span className="w-9 shrink-0 text-right text-[12px] font-semibold">
                      {skill.level}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="text-[14.5px] font-bold">Today&apos;s Plan</h3>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="relative mt-3 flex items-end justify-between px-5">
              <div className="pb-4">
                <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">
                  {user.planDate.day}
                </p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{user.planDate.month}</p>
              </div>
              <div className="relative h-[120px] w-[130px] shrink-0">
                <span className="absolute bottom-0 right-0 h-[86px] w-[86px] rounded-full bg-terracotta" />
                <img
                  src={user.planImage}
                  alt=""
                  loading="lazy"
                  className="absolute bottom-0 right-2 h-full w-auto object-contain object-bottom"
                />
              </div>
            </div>

            <div className="space-y-3.5 border-t border-border px-5 py-4">
              {user.plan.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-ink" />
                  ) : (
                    <Circle className="h-[18px] w-[18px] shrink-0 text-muted-foreground/50" />
                  )}
                  <p
                    className={cn(
                      "text-[12.5px]",
                      item.done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
              <Link
                to="/roadmap"
                className="inline-block pt-1 text-[12px] font-semibold text-terracotta hover:underline"
              >
                View Full Plan →
              </Link>
            </div>
          </Card>

          <Card className="border-ink bg-ink text-white">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-[14px] font-bold">AI Resume Review</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/60">
                  Get your resume analyzed by AI and improve your ATS score.
                </p>
              </div>
            </div>
            <Link
              to="/resume"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Upload Resume →
            </Link>
          </Card>

          <Card>
            <h3 className="text-[14.5px] font-bold">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "AI Chat", icon: MessageCircle, to: "/mentor" },
                { label: "Roadmap", icon: MapIcon, to: "/roadmap" },
                { label: "Find Jobs", icon: Search, to: "/roadmap" },
                { label: "Mock Interview", icon: Mic, to: "/mentor" },
                { label: "Resume Review", icon: FileText, to: "/resume" },
                { label: "Skills Test", icon: Target, to: "/resume" },
              ].map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border px-2 py-4 text-center transition-transform hover:-translate-y-0.5 hover:border-terracotta/40"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                  <span className="text-[10.5px] leading-tight text-muted-foreground">{label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* MOTIVATION */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mt-4 grid overflow-hidden rounded-2xl bg-ink text-white lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_260px]"
      >
        <div className="flex items-start gap-4 p-8">
          <span className="text-4xl leading-none text-terracotta">“</span>
          <p className="max-w-md">
            <span className="text-[19px] font-semibold leading-snug">
              The only way to do great work is to love what you do.
            </span>
            <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
              Steve Jobs
            </span>
          </p>
        </div>

        <div className="flex flex-col justify-center gap-2 border-white/10 p-8 lg:border-l">
          <p className="text-[13.5px] font-semibold">
            Daily <span className="text-terracotta">Motivation</span>
          </p>
          <p className="text-[13px] leading-relaxed text-white/60">
            Believe in your abilities and you&apos;re halfway there.
          </p>
        </div>

        <img
          src={motivationImg}
          alt="Modern architecture"
          loading="lazy"
          className="hidden h-full w-full object-cover lg:block"
        />
      </motion.section>
    </AppLayout>
  );
}
