import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProjects, saveProjectsFn } from "@/lib/project.functions";
import type { ProjectInput } from "@/lib/project.server";

export type { UserProject } from "@/lib/project.server";

export const PROJECTS_QUERY_KEY = ["user-projects"] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => {
      console.info("[CareerPilot][client][getProjects] request");
      try {
        const result = await getProjects();
        console.info("[CareerPilot][client][getProjects] success", {
          count: result.length,
        });
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][getProjects] failed", error);
        throw error;
      }
    },
  });
}

export function useSaveProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projects: ProjectInput[]) => {
      console.info("[CareerPilot][client][saveProjects] request", {
        count: projects.length,
      });
      try {
        const result = await saveProjectsFn({ data: { projects } });
        console.info("[CareerPilot][client][saveProjects] success", result);
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][saveProjects] failed", error);
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["career-overview"] });
      void queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}
