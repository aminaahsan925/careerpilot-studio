import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Build the Job Mirror — the researched market held up against the
 * student's own recorded evidence.
 *
 * `role` optionally overrides the saved target role, so a student whose
 * goal falls outside the eight researched roles can still read a real
 * profile instead of generic guidance.
 */
export const getJobMirrorReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: { role?: string } | undefined) => ({
    role: typeof input?.role === "string" ? input.role.slice(0, 120) : undefined,
  }))
  .handler(async ({ context, data }) => {
    console.info("[CareerPilot][getJobMirrorReport] start", {
      userId: context.userId,
      roleOverride: data.role ?? null,
    });
    const { generateJobMirror } = await import("./jobmirror.server");
    try {
      const result = await generateJobMirror(context.supabase, context.userId, data.role);
      console.info("[CareerPilot][getJobMirrorReport] success", {
        userId: context.userId,
        roleId: result.role.roleId,
        skills: result.skills.length,
        personalized: Boolean(result.personalized),
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][getJobMirrorReport] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });
