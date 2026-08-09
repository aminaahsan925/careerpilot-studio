import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, FileText, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/app/AppLayout";
import { useCurrentUser } from "@/data/user";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume & Career Analysis — CareerPilot AI" },
      { name: "description", content: "Upload your resume for an instant ATS score, strengths and weaknesses breakdown, detected skills and AI improvement recommendations." },
      { property: "og:title", content: "Resume & Career Analysis — CareerPilot AI" },
      { property: "og:description", content: "ATS score, resume score, skill detection and AI recommendations in one view." },
    ],
  }),
  component: ResumePage,
});

const STRENGTHS = [
  "Clear, quantified project outcomes",
  "Strong technical keyword coverage",
  "Consistent, readable single-column layout",
  "Relevant internship experience up top",
];

const WEAKNESSES = [
  "Summary is generic and role-agnostic",
  "Missing measurable impact in two bullets",
  "No links to deployed work",
  "Education block occupies too much space",
];

const RECOMMENDATIONS = [
  { title: "Rewrite the summary for one target role", impact: "+6 ATS" },
  { title: "Add metrics to every experience bullet", impact: "+5 ATS" },
  { title: "Link GitHub and live project URLs", impact: "+3 ATS" },
  { title: "Trim to a single page", impact: "+2 ATS" },
];

function Ring({ value, label }: { value: number; label: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[120px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--secondary)" strokeWidth="8" />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--terracotta)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (value / 100) * c }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[26px] font-bold tracking-[-0.03em]">
          {value}
        </span>
      </div>
      <p className="mt-2 text-[12.5px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ResumePage() {
  const { data: user } = useCurrentUser();
  const [fileName, setFileName] = useState<string | null>(null);

  const resumeScore = user?.scores.find((s) => s.label === "Resume Score")?.value ?? 0;

  return (
    <AppLayout title="Resume & Career Analysis" subtitle="One place for your resume health and career fit">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-[14.5px] font-bold">Resume Upload</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  PDF or DOCX, up to 5MB. Analysis runs instantly.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
                <Upload className="h-4 w-4" />
                Upload Resume
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFileName(f.name);
                      toast.success("Resume analyzed", { description: f.name });
                    }
                  }}
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-border px-5 py-6">
              <FileText className="h-5 w-5 text-terracotta" />
              <p className="text-[13px]">
                {fileName ?? `${user?.fullName ?? "Your"} — Resume.pdf`}
                <span className="ml-2 text-[12px] text-muted-foreground">Last analyzed today</span>
              </p>
            </div>
          </div>

          <div className="card-surface grid gap-6 p-6 sm:grid-cols-3">
            <Ring value={91} label="ATS Score" />
            <Ring value={resumeScore} label="Resume Score" />
            <Ring value={78} label="Career Match" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-surface p-5">
              <h3 className="text-[14.5px] font-bold">Strengths</h3>
              <ul className="mt-4 space-y-3">
                {STRENGTHS.map((s) => (
                  <li key={s} className="flex gap-2.5 text-[12.5px]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface p-5">
              <h3 className="text-[14.5px] font-bold">Weaknesses</h3>
              <ul className="mt-4 space-y-3">
                {WEAKNESSES.map((s) => (
                  <li key={s} className="flex gap-2.5 text-[12.5px]">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-terracotta" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="text-[14.5px] font-bold">AI Recommendations</h3>
            <div className="mt-4 space-y-1">
              {RECOMMENDATIONS.map((r, i) => (
                <div
                  key={r.title}
                  className={`flex items-center gap-3 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <p className="flex-1 text-[13px]">{r.title}</p>
                  <span className="rounded-md bg-terracotta/10 px-2 py-1 text-[11px] font-semibold text-terracotta">
                    {r.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="text-[14.5px] font-bold">Skills Detected</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(user?.skills ?? []).map((s) => (
                <span
                  key={s.name}
                  className="rounded-full border border-border px-3 py-1.5 text-[12px]"
                >
                  {s.name}
                </span>
              ))}
              {["React", "Git", "REST APIs", "Testing"].map((s) => (
                <span key={s} className="rounded-full border border-border px-3 py-1.5 text-[12px]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="text-[14.5px] font-bold">Career Match</h3>
            <div className="mt-4 space-y-3.5">
              {[
                { role: "Full Stack Developer", match: 78 },
                { role: "Frontend Engineer", match: 84 },
                { role: "Backend Engineer", match: 62 },
                { role: "Data Analyst", match: 55 },
              ].map((m) => (
                <div key={m.role} className="flex items-center gap-3">
                  <p className="w-[130px] shrink-0 truncate text-[12.5px]">{m.role}</p>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${m.match}%` }}
                      transition={{ duration: 0.7 }}
                      className="block h-full rounded-full bg-terracotta"
                    />
                  </span>
                  <span className="w-9 text-right text-[12px] font-semibold">{m.match}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface bg-ink p-5 text-white">
            <h3 className="text-[14px] font-bold">Improvement Suggestions</h3>
            <ul className="mt-3 space-y-2.5 text-[12.5px] text-white/70">
              <li>Target one role per resume version</li>
              <li>Front-load impact, not responsibilities</li>
              <li>Keep formatting ATS-parseable — no tables</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
