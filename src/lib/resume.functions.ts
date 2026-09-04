import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzeStoredResume } from "./resume.server";

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { resumeId: string }) => {
    const resumeId = String(input?.resumeId ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(resumeId)) throw new Error("Invalid resume reference.");
    return { resumeId };
  })
  .handler(async ({ data, context }) => {
    return analyzeStoredResume(context.supabase, context.userId, data.resumeId);
  });
