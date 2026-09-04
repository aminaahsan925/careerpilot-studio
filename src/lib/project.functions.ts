import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadProjects } = await import("./project.server");
    return loadProjects(context.supabase, context.userId);
  });

export const saveProjectsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      projects: {
        name: string;
        description?: string;
        technologies: string[];
        projectUrl?: string;
        projectType: string;
        completed?: boolean;
      }[];
    }) => {
      const projects = Array.isArray(input?.projects) ? input.projects : [];
      return { projects };
    },
  )
  .handler(async ({ data, context }) => {
    const { saveProjects } = await import("./project.server");
    const projects = data.projects.map((p) => ({
      name: String(p?.name ?? "").trim(),
      description: String(p?.description ?? "").trim() || undefined,
      technologies: Array.isArray(p?.technologies)
        ? p.technologies.map((t) => String(t ?? "").trim()).filter(Boolean)
        : [],
      projectUrl: String(p?.projectUrl ?? "").trim() || undefined,
      projectType: ["personal", "academic", "freelance", "open-source", "hackathon"].includes(
        String(p?.projectType ?? ""),
      )
        ? (p.projectType as "personal" | "academic" | "freelance" | "open-source" | "hackathon")
        : ("personal" as const),
      completed: Boolean(p?.completed),
    })) as import("./project.server").ProjectInput[];
    return saveProjects(context.supabase, context.userId, projects);
  });
