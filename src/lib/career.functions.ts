import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Career State summary + the latest persisted diagnosis, in one call. */
export const getCareerOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { buildCareerState } = await import("./career-state.server");
    const { loadLatestDiagnosis } = await import("./diagnosis.server");
    const [state, diagnosis] = await Promise.all([
      buildCareerState(context.supabase, context.userId),
      loadLatestDiagnosis(context.supabase, context.userId),
    ]);

    const requiredSkills = Array.isArray(state.targetJob?.parsed?.["required_skills"])
      ? (state.targetJob.parsed["required_skills"] as unknown[])
          .map((v) => String(v))
          .slice(0, 20)
      : [];

    return {
      diagnosis,
      profileName: [state.profile.firstName, state.profile.lastName].filter(Boolean).join(" "),
      targetRole: state.targetRole,
      targetIndustry: state.targetIndustry,
      targetJob: state.targetJob
        ? {
            title: state.targetJob.title,
            company: state.targetJob.company,
            requiredSkills,
          }
        : null,
      hasResume: state.resume.hasResume,
      skills: state.skills.map((s) => ({
        name: s.name,
        proficiency: s.proficiency,
        evidenceStrength: s.evidenceStrength,
        sources: s.sources.map((x) => String(x)),
      })),
      gaps: state.gaps.map((g) => ({
        skill: g.skill,
        status: String(g.status),
        priority: String(g.priority),
        evidence: g.evidence,
        action: g.action,
        proofTask: g.proofTask,
        whyItMatters: g.whyItMatters,
      })),
      readiness: state.readiness
        ? { overall: state.readiness.overall, stage: state.readiness.stage }
        : null,
    };
  });


/** Runs (or re-runs) the Career Gap → Action engine. */
export const runDiagnosis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { runCareerDiagnosis } = await import("./diagnosis.server");
    return runCareerDiagnosis(context.supabase, context.userId);
  });

export const setCareerTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { role?: string; industry?: string; recommendationId?: string }) => {
    const role = text(input?.role, 120);
    const recommendationId = text(input?.recommendationId, 60);
    if (!role && !recommendationId) throw new Error("Please choose or enter a target role.");
    return { role, industry: text(input?.industry, 120) || null, recommendationId };
  })
  .handler(async ({ data, context }) => {
    const { selectCareerTarget } = await import("./career.server");
    return selectCareerTarget(context.supabase, context.userId, {
      role: data.role,
      industry: data.industry,
      ...(data.recommendationId ? { recommendationId: data.recommendationId } : {}),
    });
  });

export const analyzeJobDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title?: string; company?: string; description?: string }) => {
    const title = text(input?.title, 160);
    const description = String(input?.description ?? "").trim();
    if (!title) throw new Error("Add the job title.");
    if (description.length < 80)
      throw new Error("Paste the full job description (at least a few sentences).");
    return { title, company: text(input?.company, 160) || null, description };
  })
  .handler(async ({ data, context }) => {
    const { analyzeTargetJob } = await import("./career.server");
    return analyzeTargetJob(context.supabase, context.userId, data);
  });
