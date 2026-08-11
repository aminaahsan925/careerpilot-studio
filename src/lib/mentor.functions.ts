import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendMentorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { message: string }) => {
    const message = String(input?.message ?? "").trim();
    if (!message) throw new Error("Please type a message first.");
    if (message.length > 2000)
      throw new Error("That message is too long — keep it under 2000 characters.");
    return { message };
  })
  .handler(async ({ data, context }) => {
    const { runMentorTurn } = await import("./mentor.server");
    return runMentorTurn(context.supabase, context.userId, data.message);
  });
