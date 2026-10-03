import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Fetch (or generate) the Market Reality report for the authenticated user.
 *  Returns cached data when available. */
export const getMarketReality = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.info("[CareerPilot][getMarketReality] start", { userId: context.userId });
    const { generateMarketReality } = await import("./market.server");
    try {
      const result = await generateMarketReality(context.supabase, context.userId);
      console.info("[CareerPilot][getMarketReality] success", {
        userId: context.userId,
        targetRole: result.targetRole,
        fromCache: result.fromCache ?? false,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][getMarketReality] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

/** Force-regenerate the Market Reality report, bypassing all caches. */
export const getMarketRealityFresh = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.info("[CareerPilot][getMarketRealityFresh] start", { userId: context.userId });
    const { generateMarketReality, invalidateMarketRealityCache } = await import("./market.server");
    try {
      // Clear server-side cache first
      await invalidateMarketRealityCache(context.supabase, context.userId);
      // Generate fresh report
      const result = await generateMarketReality(context.supabase, context.userId, {
        forceRefresh: true,
      });
      console.info("[CareerPilot][getMarketRealityFresh] success", {
        userId: context.userId,
        targetRole: result.targetRole,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][getMarketRealityFresh] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

/** Invalidate the cached market report for the authenticated user.
 *  Called when the user changes their career goal / target role. */
export const invalidateMarketReality = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.info("[CareerPilot][invalidateMarketReality]", { userId: context.userId });
    const { invalidateMarketRealityCache } = await import("./market.server");
    await invalidateMarketRealityCache(context.supabase, context.userId);
    return { ok: true };
  });

/** Update the user's target role and invalidate the market cache so a
 *  fresh report is generated on the next visit. */
export const updateTargetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { targetRole: string }) => {
    const targetRole = String(input?.targetRole ?? "").trim();
    if (!targetRole) throw new Error("Please enter a target role.");
    if (targetRole.length > 120) throw new Error("Target role is too long — keep it under 120 characters.");
    return { targetRole };
  })
  .handler(async ({ data, context }) => {
    console.info("[CareerPilot][updateTargetRole]", { userId: context.userId, targetRole: data.targetRole });
    const { invalidateMarketRealityCache } = await import("./market.server");
    const { error } = await context.supabase
      .from("career_goals")
      .upsert(
        { user_id: context.userId, target_role: data.targetRole } as never,
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("[CareerPilot][updateTargetRole] DB error:", error.message);
      throw error;
    }
    await invalidateMarketRealityCache(context.supabase, context.userId);
    return { ok: true };
  });

/** Update the user's market location and invalidate the market cache so a
 *  fresh, geographically-scoped report is generated on the next visit. */
export const updateMarketLocation = createServerFn({ method: "POST" })
  .inputValidator((input: { location: string | null }) => {
    const raw = input?.location;
    const location = typeof raw === "string" ? raw.trim().slice(0, 120) : null;
    return { location: location && location.length > 0 ? location : null };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    console.info("[CareerPilot][updateMarketLocation]", {
      userId: context.userId,
      location: data.location,
    });
    const { invalidateMarketRealityCache } = await import("./market.server");
    // career_goals.target_role is NOT NULL, so this must be an UPDATE of an
    // existing goal row (the Market Reality page requires a target role
    // before it can load at all).
    const { data: updated, error } = await context.supabase
      .from("career_goals")
      .update({ location: data.location } as never)
      .eq("user_id", context.userId)
      .select("user_id");
    if (error) {
      console.error(
        "[CareerPilot][updateMarketLocation] DB error:",
        error.message,
      );
      throw error;
    }
    if (!updated || updated.length === 0) {
      throw new Error(
        "Set a target role first, then choose a market location.",
      );
    }
    await invalidateMarketRealityCache(context.supabase, context.userId);
    return { ok: true, location: data.location };
  });

/** Detect outdated technologies in the student's skill set relative to
 *  their target role. Uses Tavily for fresh market signals. */
export const getOutdatedTech = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.info("[CareerPilot][getOutdatedTech] start", { userId: context.userId });
    const { detectOutdatedTechnologies } = await import("./outdated-tech.server");
    try {
      const result = await detectOutdatedTechnologies(context.userId);
      console.info("[CareerPilot][getOutdatedTech] success", {
        userId: context.userId,
        outdatedCount: result.outdatedItems.length,
        skillCount: result.studentSkills.length,
      });
      return result;
    } catch (error) {
      console.error("[CareerPilot][getOutdatedTech] failed", {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });
