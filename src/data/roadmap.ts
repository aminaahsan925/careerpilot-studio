import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { generateRoadmap } from "@/lib/roadmap.functions";

export type RoadmapCourse = { name: string; provider: string; weeks: string };

export type RoadmapStage = {
  id: string;
  title: string;
  timeframe: string | null;
  description: string | null;
  skills: string[];
  project: string | null;
  courses: RoadmapCourse[];
  position: number;
  completed: boolean;
};

export type Milestone = { id: string; label: string; completed: boolean; position: number };

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export function useRoadmap() {
  return useQuery({
    queryKey: ["roadmap"],
    queryFn: async (): Promise<{ stages: RoadmapStage[]; milestones: Milestone[] }> => {
      const [stagesRes, msRes] = await Promise.all([
        supabase.from("roadmap_stages").select("*").order("position"),
        supabase.from("roadmap_milestones").select("*").order("position"),
      ]);
      if (stagesRes.error) throw stagesRes.error;
      if (msRes.error) throw msRes.error;

      const stages = (stagesRes.data ?? []).map((s) => ({
        id: s.id as string,
        title: s.title as string,
        timeframe: s.timeframe as string | null,
        description: s.description as string | null,
        skills: asStrings(s.skills),
        project: s.project as string | null,
        courses: Array.isArray(s.courses) ? (s.courses as unknown as RoadmapCourse[]) : [],
        position: s.position as number,
        completed: s.completed as boolean,
      }));

      const milestones = (msRes.data ?? []).map((m) => ({
        id: m.id as string,
        label: m.label as string,
        completed: m.completed as boolean,
        position: m.position as number,
      }));

      return { stages, milestones };
    },
  });
}

export function roadmapProgress(stages: RoadmapStage[]): number {
  if (!stages.length) return 0;
  return Math.round((stages.filter((s) => s.completed).length / stages.length) * 100);
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateRoadmap({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useToggleStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("roadmap_stages").update({ completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roadmap"] }),
  });
}

export function useToggleMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("roadmap_milestones")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roadmap"] }),
  });
}
