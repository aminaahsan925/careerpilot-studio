import { supabaseAdmin } from "@/integrations/supabase/client.server";

// The roadmap v2 tables are not yet in the generated Supabase types.
// Use an untyped alias for operations on those tables only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

type NotificationType = "daily_work" | "streak_warning" | "mcq_ready" | "level_up" | "market_alert";

/* ------------------------------------------------------------------ *
 * 1. createNotification — insert a notification row
 * ------------------------------------------------------------------ */

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  dailyWorkId?: string,
) {
  try {
    const { data, error } = await db
      .from("roadmap_notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        ...(dailyWorkId ? { daily_work_id: dailyWorkId } : {}),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Notifications] createNotification error:", error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("[Notifications] createNotification failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 2. getUnreadNotifications — unread notifications (limit 50)
 * ------------------------------------------------------------------ */

export async function getUnreadNotifications(userId: string) {
  try {
    const { data, error } = await db
      .from("roadmap_notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[Notifications] getUnreadNotifications error:", error.message);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("[Notifications] getUnreadNotifications failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 3. getAllNotifications — all notifications with optional limit
 * ------------------------------------------------------------------ */

export async function getAllNotifications(userId: string, limit = 50) {
  try {
    const { data, error } = await db
      .from("roadmap_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Notifications] getAllNotifications error:", error.message);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("[Notifications] getAllNotifications failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 4. markNotificationRead — mark a single notification as read
 * ------------------------------------------------------------------ */

export async function markNotificationRead(userId: string, notificationId: string) {
  try {
    const { error } = await db
      .from("roadmap_notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("[Notifications] markNotificationRead error:", error.message);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("[Notifications] markNotificationRead failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 5. markAllNotificationsRead — mark all user notifications as read
 * ------------------------------------------------------------------ */

export async function markAllNotificationsRead(userId: string) {
  try {
    const { error } = await db
      .from("roadmap_notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("[Notifications] markAllNotificationsRead error:", error.message);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("[Notifications] markAllNotificationsRead failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 6. getUnreadCount — count of unread notifications
 * ------------------------------------------------------------------ */

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await db
      .from("roadmap_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("[Notifications] getUnreadCount error:", error.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error("[Notifications] getUnreadCount failed:", error);
    return 0;
  }
}

/* ------------------------------------------------------------------ *
 * 7. createDailyWorkNotification — helper for daily work nudge
 * ------------------------------------------------------------------ */

export async function createDailyWorkNotification(
  userId: string,
  dayTitle: string,
  dayNumber: number,
  dailyWorkId: string,
) {
  return createNotification(
    userId,
    "daily_work",
    `Day ${dayNumber}: ${dayTitle}`,
    `Day ${dayNumber}: ${dayTitle} is ready. Time to learn!`,
    dailyWorkId,
  );
}

/* ------------------------------------------------------------------ *
 * 8. createStreakWarning — helper for streak warnings
 * ------------------------------------------------------------------ */

export async function createStreakWarning(userId: string, streakDays: number) {
  return createNotification(
    userId,
    "streak_warning",
    "Your streak is at risk!",
    `You've completed ${streakDays} day${streakDays === 1 ? "" : "s"} in a row. Don't break the chain — do today's work!`,
  );
}

/* ------------------------------------------------------------------ *
 * 9. createLevelUpNotification — helper for level-up events
 * ------------------------------------------------------------------ */

export async function createLevelUpNotification(userId: string, newLevel: string) {
  return createNotification(
    userId,
    "level_up",
    `Level Up: ${newLevel}`,
    `You've reached ${newLevel} level. New, harder material is now available in your roadmap.`,
  );
}
