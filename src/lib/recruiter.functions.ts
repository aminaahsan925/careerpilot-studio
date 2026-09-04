import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const text = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

/** Runs the Brutal Honest Recruiter Audit engine for a target company. */
export const runRecruiterAuditFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input?: { company?: string; role?: string }) => {
    return {
      company: text(input?.company, 160) || undefined,
      role: text(input?.role, 160) || undefined,
    };
  })
  .handler(async ({ data, context }) => {
    console.info("[CareerPilot][runRecruiterAudit] start", { userId: context.userId, data });
    const { runRecruiterAudit } = await import("./recruiter.server");
    try {
      const options: { company?: string; role?: string } = {};
      if (data?.company) options.company = data.company;
      if (data?.role) options.role = data.role;
      const result = await runRecruiterAudit(context.supabase, context.userId, options);
      console.info("[CareerPilot][runRecruiterAudit] success", {
        userId: context.userId,
        sessionId: result.id,
        score: result.overallScore,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][runRecruiterAudit] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

/** Sends a message to the AI recruiter and gets a response. */
export const chatWithRecruiterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string; message: string }) => {
    const sessionId = text(input?.sessionId, 60);
    const message = text(input?.message, 2000);
    if (!sessionId) throw new Error("Session ID is required.");
    if (!message) throw new Error("Please type a message.");
    return { sessionId, message };
  })
  .handler(async ({ data, context }) => {
    console.info("[CareerPilot][chatWithRecruiter] start", {
      userId: context.userId,
      sessionId: data.sessionId,
    });
    const { chatWithRecruiter } = await import("./recruiter.server");
    try {
      const result = await chatWithRecruiter(
        context.supabase,
        context.userId,
        data.sessionId,
        data.message,
      );
      console.info("[CareerPilot][chatWithRecruiter] success", {
        userId: context.userId,
        replyLength: result.reply.length,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][chatWithRecruiter] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

/** Loads the latest recruiter session for the current user. */
export const loadRecruiterSessionFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadRecruiterSession } = await import("./recruiter.server");
    return loadRecruiterSession(context.supabase, context.userId);
  });
