import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const text = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

/** Career State summary + the latest persisted diagnosis, in one call. */
export const getCareerOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.info("[CareerPilot][getCareerOverview] start", { userId: context.userId });
    const { buildCareerState } = await import("./career-state.server");
    const { loadLatestDiagnosis } = await import("./diagnosis.server");
    const [state, diagnosis] = await Promise.all([
      buildCareerState(context.supabase, context.userId),
      loadLatestDiagnosis(context.supabase, context.userId),
    ]).catch((error) => {
      console.error("[CareerPilot][getCareerOverview] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    });

    const requiredSkills = Array.isArray(state.targetJob?.parsed?.["required_skills"])
      ? (state.targetJob.parsed["required_skills"] as unknown[]).map((v) => String(v)).slice(0, 20)
      : [];

    const result = {
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
        proficiency: String(s.proficiency),
        evidenceStrength: String(s.evidenceStrength),
        sources: s.sources.map((x) => String(x)),
      })),
      gaps: state.gaps.map((g) => ({
        skill: g.skill,
        status: String(g.status),
        priority: String(g.priority),
        evidence: g.evidence ? String(g.evidence) : "",
        action: g.action ? String(g.action) : "",
        proofTask: g.proofTask ? String(g.proofTask) : "",
        whyItMatters: g.whyItMatters ? String(g.whyItMatters) : "",
      })),
      readiness: state.readiness
        ? {
            overall: state.readiness.overall,
            stage: state.readiness.stage,
            blockers: state.readiness.blockers,
            nextAction: state.readiness.nextAction,
          }
        : null,
    };
    console.info("[CareerPilot][getCareerOverview] success", {
      userId: context.userId,
      targetRole: result.targetRole,
      hasDiagnosis: Boolean(result.diagnosis),
    });
    return result;
  });

/** Runs (or re-runs) the Company-Specific Career Gap & Rejection engine. */
export const runDiagnosis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input?: { company?: string; role?: string }) => {
    return {
      company: text(input?.company, 160) || undefined,
      role: text(input?.role, 160) || undefined,
    };
  })
  .handler(async ({ data, context }) => {
    console.info("[CareerPilot][runDiagnosis] start", { userId: context.userId, data });
    const { runCareerDiagnosis } = await import("./diagnosis.server");
    try {
      const options: { company?: string; role?: string } = {};
      if (data?.company) options.company = data.company;
      if (data?.role) options.role = data.role;
      const result = await runCareerDiagnosis(context.supabase, context.userId, options);
      console.info("[CareerPilot][runDiagnosis] success", {
        userId: context.userId,
        diagnosisId: result.id,
        targetRole: result.targetRole,
        targetCompany: result.targetCompany,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][runDiagnosis] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
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
    console.info("[CareerPilot][setCareerTarget] start", {
      userId: context.userId,
      hasRole: Boolean(data.role),
    });
    const { selectCareerTarget } = await import("./career.server");
    const result = await selectCareerTarget(context.supabase, context.userId, {
      role: data.role,
      industry: data.industry,
      ...(data.recommendationId ? { recommendationId: data.recommendationId } : {}),
    });
    console.info("[CareerPilot][setCareerTarget] success", { userId: context.userId });
    return result;
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

export const addSkillEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { source?: string; detail?: string; skills?: string[] }) => {
    const source: "github" | "project" | null =
      input?.source === "github" || input?.source === "project" ? input.source : null;
    if (!source) throw new Error("Choose GitHub or project evidence.");
    const skills = Array.isArray(input?.skills)
      ? input.skills.map((skill) => text(skill, 120)).filter(Boolean)
      : [];
    return { source, detail: text(input?.detail, 500), skills };
  })
  .handler(async ({ data, context }) => {
    const { recordSkillEvidence } = await import("./career.server");
    return recordSkillEvidence(context.supabase, context.userId, data);
  });

export const runDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      interests?: string;
      strengths?: string;
      favouriteSubjects?: string;
      workType?: string;
      environment?: string;
      goals?: string;
    }) => {
      return {
        interests: text(input?.interests, 400) || "Not specified",
        strengths: text(input?.strengths, 400) || "Not specified",
        favouriteSubjects: text(input?.favouriteSubjects, 400) || "Not specified",
        workType: text(input?.workType, 200) || "Not specified",
        environment: text(input?.environment, 200) || "Not specified",
        goals: text(input?.goals, 400) || "Not specified",
      };
    },
  )
  .handler(async ({ data, context }) => {
    const { runCareerDiscovery } = await import("./career.server");
    return runCareerDiscovery(context.supabase, context.userId, data);
  });

export const getRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("career_recommendations")
      .select("id, role, why_fit, required_skills, already_have, need_to_build, fit_note, selected")
      .eq("user_id", context.userId)
      .order("position");
    if (error) throw error;
    return data ?? [];
  });

/* ------------------------------------------------------------------ *
 * Diagnostic intake
 * ------------------------------------------------------------------ */

export type DiagnosticIntakeInput = {
  universityYear: string;
  whatBuilt: string;
  languagesFrameworks: string;
  practicalExperience: string;
  deploymentExperience: string;
  primaryCareerGoal: string;
  biggestBlocker: string;
  weeklyHours: number | null;
  learnNextSkill: string;
  whyNotLearned: string;
};

export const saveDiagnosticIntake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: DiagnosticIntakeInput) => {
    const languagesFrameworks = text(input?.languagesFrameworks, 500);
    const primaryCareerGoal = text(input?.primaryCareerGoal, 200);
    const biggestBlocker = text(input?.biggestBlocker, 500);
    if (!languagesFrameworks) throw new Error("Please enter at least one language or framework.");
    if (!primaryCareerGoal) throw new Error("Please describe your primary career goal.");
    if (!biggestBlocker) throw new Error("Please describe your biggest blocker.");
    return {
      universityYear: text(input?.universityYear, 60) || null,
      whatBuilt: text(input?.whatBuilt, 1000) || null,
      languagesFrameworks,
      practicalExperience: text(input?.practicalExperience, 500) || null,
      deploymentExperience: text(input?.deploymentExperience, 500) || null,
      primaryCareerGoal,
      biggestBlocker,
      weeklyHours:
        typeof input?.weeklyHours === "number" && input.weeklyHours > 0 ? input.weeklyHours : null,
      learnNextSkill: text(input?.learnNextSkill, 300) || null,
      whyNotLearned: text(input?.whyNotLearned, 500) || null,
    };
  })
  .handler(async ({ data, context }) => {
    console.info("[CareerPilot][saveDiagnosticIntake] start", { userId: context.userId });

    // 1. Save raw intake answers
    const { error: intakeError } = await context.supabase.from("diagnostic_intakes").upsert(
      {
        user_id: context.userId,
        university_year: data.universityYear,
        what_built: data.whatBuilt,
        languages_frameworks: data.languagesFrameworks,
        practical_experience: data.practicalExperience,
        deployment_experience: data.deploymentExperience,
        primary_career_goal: data.primaryCareerGoal,
        biggest_blocker: data.biggestBlocker,
        weekly_hours: data.weeklyHours,
        learn_next_skill: data.learnNextSkill,
        why_not_learned: data.whyNotLearned,
      } as never,
      { onConflict: "user_id" },
    );
    if (intakeError) throw intakeError;

    // 2. Seed career_goals from primary career goal
    const { error: goalError } = await context.supabase.from("career_goals").upsert(
      {
        user_id: context.userId,
        target_role: data.primaryCareerGoal,
        target_industry: null,
      } as never,
      { onConflict: "user_id" },
    );
    if (goalError) throw goalError;

    // 3. Seed user_skills from claimed languages/frameworks
    const skillNames = data.languagesFrameworks
      .split(/[,;/\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15);

    if (skillNames.length > 0) {
      // Upsert skills into catalog
      const { error: skillsCatalogError } = await context.supabase
        .from("skills")
        .upsert(skillNames.map((name) => ({ name, category: "General" })) as never, {
          onConflict: "name",
          ignoreDuplicates: true,
        });
      if (skillsCatalogError) throw skillsCatalogError;

      // Read back skill IDs
      const { data: skillRows } = await context.supabase
        .from("skills")
        .select("id, name")
        .in("name", skillNames);

      const skillIds = (skillRows ?? []).map((r) => r.id as string);

      // Replace user skills (clean slate for intake)
      const { error: deleteSkillsError } = await context.supabase
        .from("user_skills")
        .delete()
        .eq("user_id", context.userId);
      if (deleteSkillsError) throw deleteSkillsError;

      if (skillIds.length > 0) {
        const { error: insertSkillsError } = await context.supabase.from("user_skills").insert(
          skillIds.map((skill_id) => ({
            user_id: context.userId,
            skill_id,
            proficiency: 50,
          })) as never,
        );
        if (insertSkillsError) throw insertSkillsError;
      }
    }

    // 4. Record claimed skills as "claim" evidence (strength 0)
    if (skillNames.length > 0) {
      const { data: existing, error: existingClaimsError } = await context.supabase
        .from("skill_evidence")
        .select("skill_name")
        .eq("user_id", context.userId)
        .eq("source", "claim");
      if (existingClaimsError) throw existingClaimsError;

      const have = new Set((existing ?? []).map((e) => (e.skill_name ?? "").toLowerCase()));
      const claimRows = skillNames
        .filter((n) => !have.has(n.toLowerCase()))
        .map((name) => ({
          user_id: context.userId,
          skill_name: name,
          source: "claim",
          detail: "Self-reported in diagnostic intake",
          strength: 0,
        }));

      if (claimRows.length > 0) {
        const { error: claimsError } = await context.supabase
          .from("skill_evidence")
          .insert(claimRows as never);
        if (claimsError) throw claimsError;
      }
    }

    console.info("[CareerPilot][saveDiagnosticIntake] success", { userId: context.userId });
    return { success: true };
  });

export const getDiagnosticIntake = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.info("[CareerPilot][getDiagnosticIntake] start", { userId: context.userId });
    const { data, error } = await context.supabase
      .from("diagnostic_intakes")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("[CareerPilot][getDiagnosticIntake] error", {
        userId: context.userId,
        error: error.message,
      });
      throw error;
    }
    console.info("[CareerPilot][getDiagnosticIntake] success", {
      userId: context.userId,
      hasIntake: Boolean(data),
    });
    if (!data) return null;
    return {
      id: data.id as string,
      createdAt: data.created_at as string,
      universityYear: (data.university_year as string | null) ?? null,
      whatBuilt: (data.what_built as string | null) ?? null,
      languagesFrameworks: data.languages_frameworks as string,
      practicalExperience: (data.practical_experience as string | null) ?? null,
      deploymentExperience: (data.deployment_experience as string | null) ?? null,
      primaryCareerGoal: data.primary_career_goal as string,
      biggestBlocker: data.biggest_blocker as string,
      weeklyHours: (data.weekly_hours as number | null) ?? null,
      learnNextSkill: (data.learn_next_skill as string | null) ?? null,
      whyNotLearned: (data.why_not_learned as string | null) ?? null,
    };
  });
