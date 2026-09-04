import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getTechTrendsReport,
  getTechTrendsFresh,
  getTechTrendDetail,
  updateTechTracking,
  getTechTracking,
} from "@/lib/tech-trends.functions";
import { friendlyError } from "./user";

export type TechTrendsReport = Awaited<ReturnType<typeof getTechTrendsReport>>;
export type TechTrend = Awaited<ReturnType<typeof getTechTrendDetail>>;
export type TechTrackingItem = Awaited<ReturnType<typeof getTechTracking>>[number];

export const TECH_TREND_CATEGORIES = [
  "All",
  "AI",
  "Software",
  "Cybersecurity",
  "Cloud",
  "Data",
  "Web",
  "Robotics",
  "Computer Vision",
  "AR/VR",
  "Blockchain",
  "Quantum",
  "Developer Tools",
  "Other",
] as const;

export type TechTrendCategory = (typeof TECH_TREND_CATEGORIES)[number];

export const TECH_TRENDS_QUERY_KEY = ["tech-trends"] as const;
export const TECH_TRACKING_QUERY_KEY = ["tech-tracking"] as const;

/** Fetch a fresh global web report on every page mount. */
export function useTechTrends() {
  return useQuery({
    queryKey: TECH_TRENDS_QUERY_KEY,
    queryFn: async () => {
      try {
        const result = await getTechTrendsFresh();
        return result;
      } catch (error) {
        throw new Error(friendlyError(error, "Tech trends couldn't be loaded. Please try again."));
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/** Force-refresh the tech trends report, bypassing all caches. */
export function useRefreshTechTrends() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await getTechTrendsFresh();
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(TECH_TRENDS_QUERY_KEY, data);
    },
  });
}

/** Fetch detailed information about a specific technology. */
export function useTechTrendDetail(technologyName: string | null) {
  return useQuery({
    queryKey: ["tech-trend-detail", technologyName],
    queryFn: async () => {
      if (!technologyName) throw new Error("No technology specified");
      try {
        const result = await getTechTrendDetail({ data: { technologyName } });
        return result;
      } catch (error) {
        throw new Error(friendlyError(error, "Technology details couldn't be loaded."));
      }
    },
    enabled: !!technologyName,
    staleTime: 30 * 60_000, // 30 minutes
  });
}

/** Get the user's technology learning tracking data. */
export function useTechTracking() {
  return useQuery({
    queryKey: TECH_TRACKING_QUERY_KEY,
    queryFn: async () => {
      try {
        return await getTechTracking();
      } catch (error) {
        throw new Error(friendlyError(error, "Tracking data couldn't be loaded."));
      }
    },
    staleTime: 5 * 60_000,
  });
}

/** Update a technology's learning tracking status. */
export function useUpdateTechTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ technologyName, status }: { technologyName: string; status: string }) => {
      await updateTechTracking({ data: { technologyName, status } });
      return { technologyName, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TECH_TRACKING_QUERY_KEY });
    },
  });
}
