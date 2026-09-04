import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const text = (value: unknown, max: number) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

export const assessFlightPlanJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      role?: string;
      company?: string;
      jobDescription?: string;
      selfDescription?: string;
      gitlabUrl?: string;
    }) => {
      const role = text(input?.role, 160);
      const company = text(input?.company, 160) || null;
      const jobDescription = text(input?.jobDescription, 16_000);
      const selfDescription = text(input?.selfDescription, 3_000) || null;
      const gitlabUrl = text(input?.gitlabUrl, 500) || null;
      if (!role) throw new Error("Add the target role.");
      if (jobDescription.length < 100)
        throw new Error("Paste the full job description (at least a few sentences).");
      if (selfDescription && selfDescription.length < 40)
        throw new Error(
          "Please describe your background, education, and skills in a little more detail.",
        );
      return { role, company, jobDescription, selfDescription, gitlabUrl };
    },
  )
  .handler(async ({ context, data }) => {
    console.info("[CareerPilot][assessFlightPlanJob] start", {
      userId: context.userId,
      role: data.role,
      company: data.company,
      hasSelfDescription: Boolean(data.selfDescription),
      hasGitLabUrl: Boolean(data.gitlabUrl),
    });
    const { assessFlightPlan } = await import("./flightplan.server");
    try {
      const result = await assessFlightPlan(context.supabase, context.userId, data);
      console.info("[CareerPilot][assessFlightPlanJob] success", {
        userId: context.userId,
        role: result.role,
        readiness: result.readiness,
        marketStatus: result.market.status,
        gitlabInspected: result.gitlab.inspected,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][assessFlightPlanJob] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });
