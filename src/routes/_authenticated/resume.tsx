import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/app/AppLayout";
import { useLatestAnalysis, useLatestResume, useUploadAndAnalyze } from "@/data/resume";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({
    meta: [
      { title: "Resume & Career Analysis — CareerPilot AI" },
      { name: "description", content: "Upload your resume for a real ATS score, evidence-aware skill detection, and improvement recommendations." },
    ],
  }),
  component: ResumePage,
});

function Ring({ value, label }: { value: number; label: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[120px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--secondary)" strokeWidth="8" />
          <motion.circle cx="60" cy="60" r={r} fill="none" stroke="var(--terracotta)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (value / 100) * c }} transition={{ duration: 0.9, ease: "easeOut" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[26px] font-bold tracking-[-0.03em]">{value}</span>
      </div>
      <p className="mt-2 text-[12.5px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">{children}</p>;
}

function ResumePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: resume } = useLatestResume();
  const { data: analysis, isLoading } = useLatestAnalysis();
  const upload = useUploadAndAnalyze();

  function chooseFile(file: File | undefined) {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: () => toast.success("Resume analyzed", { description: "Your evidence and readiness have been refreshed." }),
      onError: (error) => toast.error(error instanceof Error ? error.message : "We couldn't analyze that resume."),
    });
  }

  const busy = upload.isPending || isLoading;

  return (
    <AppLayout title="Resume & Career Analysis" subtitle="Real resume feedback and evidence for your career diagnosis">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-[14.5px] font-bold">Resume Upload</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">PDF, DOCX, or TXT up to 5MB. Your resume stays private.</p>
              </div>
              <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {upload.isPending ? "Analyzing…" : "Upload Resume"}
              </button>
              <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(event) => { chooseFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-border px-5 py-6">
              <FileText className="h-5 w-5 text-terracotta" />
              <div>
                <p className="text-[13px] font-medium">{resume?.file_name ?? "No resume analyzed yet"}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {resume ? "Latest saved resume" : "Upload a text-based PDF, DOCX, or TXT file to begin."}
                </p>
              </div>
            </div>
          </div>

          {analysis ? (
            <>
              <div className="card-surface grid gap-6 p-6 sm:grid-cols-3">
                <Ring value={analysis.ats_score} label="ATS Score" />
                <Ring value={analysis.resume_score} label="Resume Score" />
                <Ring value={analysis.career_match} label="Career Match" />
              </div>
              {analysis.summary ? <div className="card-surface p-5"><h3 className="text-[14.5px] font-bold">Analysis Summary</h3><p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{analysis.summary}</p></div> : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="card-surface p-5"><h3 className="text-[14.5px] font-bold">Strengths</h3>{analysis.strengths.length ? <ul className="mt-4 space-y-3">{analysis.strengths.map((item) => <li key={item} className="flex gap-2.5 text-[12.5px]"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul> : <Empty>No strengths were returned from the analysis.</Empty>}</div>
                <div className="card-surface p-5"><h3 className="text-[14.5px] font-bold">Weaknesses</h3>{analysis.weaknesses.length ? <ul className="mt-4 space-y-3">{analysis.weaknesses.map((item) => <li key={item} className="flex gap-2.5 text-[12.5px]"><AlertTriangle className="h-4 w-4 shrink-0 text-terracotta" />{item}</li>)}</ul> : <Empty>No weaknesses were returned from the analysis.</Empty>}</div>
              </div>
              <div className="card-surface p-5"><h3 className="text-[14.5px] font-bold">AI Recommendations</h3>{analysis.recommendations.length ? <div className="mt-4 space-y-1">{analysis.recommendations.map((item, index) => <div key={item.title} className={index ? "flex items-center gap-3 border-t border-border py-3.5" : "flex items-center gap-3 py-3.5"}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink text-white"><Sparkles className="h-3.5 w-3.5" /></span><p className="flex-1 text-[13px]">{item.title}</p><span className="rounded-md bg-terracotta/10 px-2 py-1 text-[11px] font-semibold text-terracotta">{item.impact}</span></div>)}</div> : <Empty>No recommendations were returned from the analysis.</Empty>}</div>
            </>
          ) : (
            <div className="card-surface p-6"><h3 className="text-[15px] font-bold">Your analysis will appear here</h3><Empty>CareerPilot will show only results from your uploaded resume. Resume mentions are recorded as supporting evidence, not verified project proof.</Empty></div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card-surface p-5"><h3 className="text-[14.5px] font-bold">Skills Detected</h3>{analysis?.detected_skills.length ? <div className="mt-4 flex flex-wrap gap-2">{analysis.detected_skills.map((skill) => <span key={skill} className="rounded-full border border-border px-3 py-1.5 text-[12px]">{skill}</span>)}</div> : <Empty>Detected skills will appear after a successful analysis.</Empty>}</div>
          <div className="card-surface p-5"><h3 className="text-[14.5px] font-bold">Career Match</h3>{analysis?.role_matches.length ? <div className="mt-4 space-y-3.5">{analysis.role_matches.map((match) => <div key={match.role} className="flex items-center gap-3"><p className="w-[130px] shrink-0 truncate text-[12.5px]">{match.role}</p><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"><motion.span initial={{ width: 0 }} animate={{ width: match.match + "%" }} transition={{ duration: 0.7 }} className="block h-full rounded-full bg-terracotta" /></span><span className="w-9 text-right text-[12px] font-semibold">{match.match}%</span></div>)}</div> : <Empty>Role matches are based on your saved target role and resume.</Empty>}</div>
          <div className="card-surface bg-ink p-5 text-white"><h3 className="text-[14px] font-bold">Evidence note</h3><p className="mt-3 text-[12.5px] leading-relaxed text-white/70">Skills found in a resume improve the evidence picture, but CareerPilot still treats them as mentions until supported by a project, repository, or other proof.</p></div>
        </div>
      </div>
    </AppLayout>
  );
}
