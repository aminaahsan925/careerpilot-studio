import { supabaseAdmin } from "@/integrations/supabase/client.server";

// The roadmap v2 tables are not yet in the generated Supabase types.
// Use an untyped alias for operations on those tables only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

/* ------------------------------------------------------------------ *
 * 1. getTodayWork — current uncompleted daily work item
 * ------------------------------------------------------------------ */

export async function getTodayWork(userId: string) {
  try {
    // First uncompleted day, ordered by learning path position then day number
    const { data: day, error } = await db
      .from("roadmap_daily_work")
      .select(
        `
        id,
        learning_path_id,
        day_number,
        date_assigned,
        title,
        explanation,
        what_is_this,
        why_companies_care,
        how_to_learn,
        hands_on_task,
        curated_links,
        estimated_minutes,
        problem_solving_exercise,
        completed,
        mcq_passed,
        created_at,
        roadmap_learning_paths!inner (title, level)
      `,
      )
      .eq("user_id", userId)
      .eq("completed", false)
      .order("position", { ascending: true, referencedTable: "roadmap_learning_paths" })
      .order("day_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[DailyWork] getTodayWork query error:", error.message);
      throw error;
    }

    return day ?? null;
  } catch (error) {
    console.error("[DailyWork] getTodayWork failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 2. getDailyWorkByPath — all daily work items for a learning path
 * ------------------------------------------------------------------ */

export async function getDailyWorkByPath(userId: string, pathId: string) {
  try {
    const { data: days, error } = await db
      .from("roadmap_daily_work")
      .select("*")
      .eq("user_id", userId)
      .eq("learning_path_id", pathId)
      .order("day_number", { ascending: true });

    if (error) {
      console.error("[DailyWork] getDailyWorkByPath query error:", error.message);
      throw error;
    }

    return days ?? [];
  } catch (error) {
    console.error("[DailyWork] getDailyWorkByPath failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 3. claimDayComplete — mark day as ready for MCQ testing
 * ------------------------------------------------------------------ */

export async function claimDayComplete(userId: string, dayId: string) {
  try {
    // Verify the day belongs to this user and is not yet completed
    const { data: day, error: fetchError } = await db
      .from("roadmap_daily_work")
      .select("id, completed")
      .eq("id", dayId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("[DailyWork] claimDayComplete fetch error:", fetchError.message);
      throw fetchError;
    }

    if (!day) {
      throw new Error("Daily work item not found.");
    }

    if (day.completed) {
      return { success: true, needsMcq: false };
    }

    // Do NOT mark completed yet — that happens after MCQ pass
    return { success: true, needsMcq: true };
  } catch (error) {
    console.error("[DailyWork] claimDayComplete failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 4. markDayCompleted — called after MCQ pass
 * ------------------------------------------------------------------ */

export async function markDayCompleted(userId: string, dayId: string) {
  try {
    // Mark the day as completed
    const { data: day, error: updateError } = await db
      .from("roadmap_daily_work")
      .update({ completed: true, mcq_passed: true })
      .eq("id", dayId)
      .eq("user_id", userId)
      .select("id, learning_path_id")
      .single();

    if (updateError) {
      console.error("[DailyWork] markDayCompleted update error:", updateError.message);
      throw updateError;
    }

    if (!day) {
      throw new Error("Daily work item not found.");
    }

    // Check if all days in the learning path are now complete
    const { data: allDays, error: countError } = await db
      .from("roadmap_daily_work")
      .select("id, completed")
      .eq("learning_path_id", day.learning_path_id);

    if (countError) {
      console.error("[DailyWork] markDayCompleted count error:", countError.message);
      // Non-fatal — the day is already marked complete
      return { success: true, pathCompleted: false };
    }

    const allComplete = (allDays ?? []).every((d: { completed: boolean }) => d.completed);

    if (allComplete) {
      await db
        .from("roadmap_learning_paths")
        .update({ completed: true })
        .eq("id", day.learning_path_id);
    }

    return { success: true, pathCompleted: allComplete };
  } catch (error) {
    console.error("[DailyWork] markDayCompleted failed:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * 5. getDayStreak — consecutive-day completion streak
 * ------------------------------------------------------------------ */

export async function getDayStreak(userId: string): Promise<number> {
  try {
    const { data: days, error } = await db
      .from("roadmap_daily_work")
      .select("created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[DailyWork] getDayStreak query error:", error.message);
      return 0;
    }

    if (!days || days.length === 0) return 0;

    // Extract unique dates (YYYY-MM-DD) from created_at timestamps
    const uniqueDates = new Set<string>();
    for (const d of days) {
      const dateStr = (d.created_at as string).split("T")[0] ?? "";
      uniqueDates.add(dateStr);
    }

    const sorted = Array.from(uniqueDates).sort().reverse();

    // Walk backwards from today counting consecutive days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const cursor = new Date(today);

    for (const dateStr of sorted) {
      const expected = cursor.toISOString().split("T")[0] ?? "";
      if (dateStr === expected) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (dateStr < expected) {
        // Gap found — streak is broken
        break;
      }
      // If dateStr > expected, skip (future dates shouldn't exist but be safe)
    }

    return streak;
  } catch (error) {
    console.error("[DailyWork] getDayStreak failed:", error);
    return 0;
  }
}
