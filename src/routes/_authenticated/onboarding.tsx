import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, X } from "lucide-react";

import { friendlyError, useSaveProfile, useSkillCatalog } from "@/data/user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Profile — CareerPilot AI" },
      {
        name: "description",
        content: "Tell CareerPilot AI about your education, career goal and skills to personalise your workspace.",
      },
      { property: "og:title", content: "Set Up Your Profile — CareerPilot AI" },
      { property: "og:description", content: "Three quick steps to a personalised career workspace." },
    ],
  }),
  component: OnboardingPage,
});

const EDUCATION_LEVELS = ["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Self-taught"];

const STEPS = [
  { label: "About you", hint: "The basics we'll use across your workspace." },
  { label: "Your goal", hint: "The role you're working towards." },
  { label: "Your skills", hint: "What you can already do today." },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const save = useSaveProfile();
  const { data: catalog = [] } = useSkillCatalog();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [degree, setDegree] = useState("");
  const [university, setUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const canContinue =
    step === 0 ? firstName.trim().length > 0 : step === 1 ? targetRole.trim().length > 0 : true;

  function toggleSkill(name: string) {
    setSkills((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }

  function addCustomSkill() {
    const name = customSkill.trim();
    if (!name) return;
    setSkills((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setCustomSkill("");
  }

  async function finish() {
    setError(null);
    try {
      const year = Number.parseInt(graduationYear, 10);
      await save.mutateAsync({
        profile: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          education_level: educationLevel || null,
          degree: degree.trim() || null,
          university: university.trim() || null,
          graduation_year: Number.isFinite(year) ? year : null,
          current_role: currentRole.trim() || null,
        },
        goal: targetRole.trim() || null,
        skills,
      });
      await navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(friendlyError(err, "We couldn't save your profile. Please try again."));
    }
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto w-full max-w-[720px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-terracotta">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="editorial-title mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">
          {STEPS[step]!.label}
        </h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">{STEPS[step]!.hint}</p>

        <div className="mt-6 flex gap-2">
          {STEPS.map((s, i) => (
            <span
              key={s.label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-terracotta" : "bg-border",
              )}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="card-surface mt-8 p-6 sm:p-8"
        >
          {step === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" required>
                <Input value={firstName} onChange={setFirstName} placeholder="Ada" />
              </Field>
              <Field label="Last name">
                <Input value={lastName} onChange={setLastName} placeholder="Lovelace" />
              </Field>
              <Field label="Education level">
                <div className="flex flex-wrap gap-2">
                  {EDUCATION_LEVELS.map((level) => (
                    <Chip
                      key={level}
                      label={level}
                      active={educationLevel === level}
                      onClick={() => setEducationLevel(educationLevel === level ? "" : level)}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Degree / field of study">
                <Input value={degree} onChange={setDegree} placeholder="Computer Science" />
              </Field>
              <Field label="University or school">
                <Input value={university} onChange={setUniversity} placeholder="University of…" />
              </Field>
              <Field label="Graduation year">
                <Input
                  value={graduationYear}
                  onChange={setGraduationYear}
                  placeholder="2026"
                  inputMode="numeric"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Current role or status">
                  <Input value={currentRole} onChange={setCurrentRole} placeholder="Student, Junior Developer…" />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <Field label="Target role" required>
                <Input value={targetRole} onChange={setTargetRole} placeholder="Senior Frontend Engineer" />
              </Field>
              <p className="text-[12.5px] text-muted-foreground">
                One clear goal keeps your roadmap, skills and guidance pointed in the same direction. You can
                change it any time from your profile.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <p className="text-[12.5px] font-semibold">Pick what you already know</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {catalog.map((s) => (
                    <Chip
                      key={s.id}
                      label={s.name}
                      active={skills.includes(s.name)}
                      onClick={() => toggleSkill(s.name)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12.5px] font-semibold">Add your own</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                    placeholder="e.g. Data Storytelling"
                    className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-[13.5px] outline-none focus:border-terracotta"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-[13px] font-semibold hover:border-terracotta hover:text-terracotta"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>

              {skills.length ? (
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-white"
                    >
                      {s}
                      <button type="button" onClick={() => toggleSkill(s)} aria-label={`Remove ${s}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-muted-foreground">
                  No skills selected yet — you can always add them later.
                </p>
              )}
            </div>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-xl border border-terracotta/30 bg-terracotta/8 px-4 py-3 text-[12.5px] text-terracotta">
              {error}
            </p>
          ) : null}
        </motion.div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || save.isPending}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
              className="flex items-center gap-2 rounded-xl bg-terracotta px-5 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={save.isPending}
              className="flex items-center gap-2 rounded-xl bg-terracotta px-5 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {save.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  Finish setup <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[12.5px] font-semibold">
        {label}
        {required ? <span className="text-terracotta"> *</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <input
      value={value}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13.5px] outline-none transition-colors focus:border-terracotta"
    />
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
        active
          ? "border-terracotta bg-terracotta text-primary-foreground"
          : "border-border text-muted-foreground hover:border-terracotta hover:text-terracotta",
      )}
    >
      {label}
    </button>
  );
}
