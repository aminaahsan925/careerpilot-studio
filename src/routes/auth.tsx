import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { friendlyError } from "@/data/user";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — CareerPilot AI" },
      {
        name: "description",
        content:
          "Sign in to CareerPilot AI or create a free account to build your personalised career profile, goals and skills.",
      },
      { property: "og:title", content: "Sign In — CareerPilot AI" },
      { property: "og:description", content: "Access your personalised CareerPilot AI workspace." },
    ],
  }),
  component: AuthPage,
});

const HIGHLIGHTS = [
  "A profile built around your real education and skills",
  "One career goal, tracked end to end",
  "Guidance that adapts as you grow",
];

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function safeRedirect() {
    const target = search.redirect;
    if (target && target.startsWith("/") && !target.startsWith("//")) return target;
    return "/dashboard";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      await navigate({ to: safeRedirect(), replace: true });
    } catch (err) {
      setError(friendlyError(err, "We couldn't complete that. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* EDITORIAL PANEL */}
      <div className="relative hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Link to="/" className="inline-flex flex-col">
          <Sparkles className="h-6 w-6 text-white" strokeWidth={1.5} />
          <span className="mt-3 text-[17px] font-extrabold tracking-[0.14em]">CAREERPILOT</span>
          <span className="text-[13px] font-semibold tracking-[0.16em] text-terracotta">AI</span>
        </Link>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-terracotta">
            Your career, deliberately built
          </p>
          <h2 className="editorial-title mt-4 text-[clamp(2rem,3.4vw,3rem)]">
            Build your future
            <br />
            on purpose.
          </h2>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3 text-[13.5px] text-white/65">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[12px] text-white/40">
          © {new Date().getFullYear()} CareerPilot AI
        </p>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden">
            <p className="text-[16px] font-extrabold tracking-[0.14em]">CAREERPILOT</p>
            <p className="text-[12px] font-semibold tracking-[0.16em] text-terracotta">AI</p>
          </div>

          <h1 className="mt-6 text-[28px] font-bold tracking-[-0.02em] lg:mt-0">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            {mode === "signin"
              ? "Sign in to continue building your career."
              : "Start with a profile that's actually yours."}
          </p>

          <div className="mt-7 flex rounded-xl border border-border bg-card p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                  mode === m ? "bg-ink text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-[12.5px] font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-[13.5px] outline-none transition-colors focus:border-terracotta"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-[12.5px] font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-[13.5px] outline-none transition-colors focus:border-terracotta"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-terracotta/30 bg-terracotta/8 px-4 py-3 text-[12.5px] text-terracotta">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-xl border border-border bg-secondary px-4 py-3 text-[12.5px] text-foreground">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta px-4 py-3 text-[13.5px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
            {mode === "signin" ? "New to CareerPilot?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="font-semibold text-terracotta hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
