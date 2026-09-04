import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Trimmed non-empty id, or a user-facing error. */
const id = (value: unknown, label: string) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
};

export type McqAnswer = { questionId: string; selectedOption: string };

/* ------------------------------------------------------------------ *
 * Brutal Roadmap v2 — TanStack Start server functions
 *
 * Thin, authenticated wrappers around the roadmap-v2 server modules.
 * The userId always comes from the request context — never the client —
 * and the underlying modules persist with the service-role client.
 * ------------------------------------------------------------------ */

/** Generate (or fully regenerate) the Brutal Roadmap. One expensive AI call. */
export const generateRoadmapFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.info("[CareerPilot][generateRoadmapFn] start", { userId: context.userId });
    const { generateRoadmapV2 } = await import("./roadmap-v2.server");
    try {
      const result = await generateRoadmapV2(context.userId);
      if (result.success) {
        console.info("[CareerPilot][generateRoadmapFn] success", {
          userId: context.userId,
          pathCount: result.pathCount,
        });
      } else {
        console.error("[CareerPilot][generateRoadmapFn] failed", {
          userId: context.userId,
          error: result.error ?? "unknown error",
        });
      }
      return result;
    } catch (error) {
      console.error("[CareerPilot][generateRoadmapFn] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

/** All learning paths, ordered beginner → intermediate → expert. */
export const getLearningPathsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getLearningPaths } = await import("./roadmap-v2.server");
    return getLearningPaths(context.userId);
  });

/** Overall roadmap stats: paths, days, current level, MCQs passed. */
export const getRoadmapProgressFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getRoadmapProgress } = await import("./roadmap-v2.server");
    return getRoadmapProgress(context.userId);
  });

/** The next uncompleted day of work across all learning paths. */
export const getTodayWorkFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getTodayWork } = await import("./daily-work.server");
    return getTodayWork(context.userId);
  });

/** Every day of work for one learning path, ordered by day number. */
export const getDailyWorkByPathFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pathId?: string }) => ({
    pathId: id(input?.pathId, "A learning path"),
  }))
  .handler(async ({ data, context }) => {
    const { getDailyWorkByPath } = await import("./daily-work.server");
    return getDailyWorkByPath(context.userId, data.pathId);
  });

/** Claim a day's work is done — reports whether the MCQ gate still applies. */
export const claimDayCompleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dayId?: string }) => ({
    dayId: id(input?.dayId, "A day of work"),
  }))
  .handler(async ({ data, context }) => {
    const { claimDayComplete } = await import("./daily-work.server");
    return claimDayComplete(context.userId, data.dayId);
  });

/** The MCQ gate questions for a day's path (correct answers withheld). */
export const getMcqsForDayFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dayId?: string }) => ({
    dayId: id(input?.dayId, "A day of work"),
  }))
  .handler(async ({ data, context }) => {
    const { getMcqsForDay } = await import("./mcq.server");
    return getMcqsForDay(context.userId, data.dayId);
  });

/** Submit a day's MCQ answers — grades, records the attempt, applies side effects. */
export const submitMcqFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      dayId?: string;
      answers?: Array<{ questionId?: string; selectedOption?: string }>;
    }) => {
      const dayId = id(input?.dayId, "A day of work");
      const answers = Array.isArray(input?.answers)
        ? input.answers
            .map((answer) => ({
              questionId: String(answer.questionId ?? "").trim(),
              selectedOption: String(answer.selectedOption ?? "")
                .trim()
                .toLowerCase(),
            }))
            .filter((answer) => answer.questionId && answer.selectedOption)
        : [];
      if (answers.length === 0) throw new Error("Answer every question before submitting.");
      return { dayId, answers: answers as McqAnswer[] };
    },
  )
  .handler(async ({ data, context }) => {
    console.info("[CareerPilot][submitMcqFn] start", {
      userId: context.userId,
      dayId: data.dayId,
      answerCount: data.answers.length,
    });
    const { submitMcqAttempt } = await import("./mcq.server");
    try {
      const result = await submitMcqAttempt(context.userId, data.dayId, data.answers);
      console.info("[CareerPilot][submitMcqFn] success", {
        userId: context.userId,
        dayId: data.dayId,
        score: result.score,
        passed: result.passed,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][submitMcqFn] failed", {
        userId: context.userId,
        dayId: data.dayId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

/** Previous MCQ attempts for a day, newest first. */
export const getMcqHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dayId?: string }) => ({
    dayId: id(input?.dayId, "A day of work"),
  }))
  .handler(async ({ data, context }) => {
    const { getMcqHistory } = await import("./mcq.server");
    return getMcqHistory(context.userId, data.dayId);
  });

/** Unread roadmap notifications, newest first (limit 50). */
export const getUnreadNotificationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getUnreadNotifications } = await import("./roadmap-notifications.server");
    return getUnreadNotifications(context.userId);
  });

/** All roadmap notifications, newest first (limit 50). */
export const getAllNotificationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getAllNotifications } = await import("./roadmap-notifications.server");
    return getAllNotifications(context.userId);
  });

/** Mark a single notification as read. */
export const markNotificationReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { notificationId?: string }) => ({
    notificationId: id(input?.notificationId, "A notification"),
  }))
  .handler(async ({ data, context }) => {
    const { markNotificationRead } = await import("./roadmap-notifications.server");
    return markNotificationRead(context.userId, data.notificationId);
  });

/** Mark every unread notification as read. */
export const markAllNotificationsReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { markAllNotificationsRead } = await import("./roadmap-notifications.server");
    return markAllNotificationsRead(context.userId);
  });

/** Count of unread notifications — drives the bell badge. */
export const getUnreadCountFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getUnreadCount } = await import("./roadmap-notifications.server");
    return getUnreadCount(context.userId);
  });
