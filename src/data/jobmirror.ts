import { useQuery } from "@tanstack/react-query";

import { getJobMirrorReport } from "@/lib/jobmirror.functions";
import { friendlyError } from "./user";

export type JobMirrorReport = Awaited<ReturnType<typeof getJobMirrorReport>>;

export const JOB_MIRROR_QUERY_KEY = ["job-mirror"] as const;

/**
 * Read the Job Mirror for the signed-in student.
 *
 * `roleOverride` reads a different researched role than the saved target;
 * it is part of the query key so each role is cached separately.
 */
export function useJobMirror(roleOverride?: string) {
  return useQuery({
    queryKey: [...JOB_MIRROR_QUERY_KEY, roleOverride ?? null],
    queryFn: async () => {
      console.info("[CareerPilot][client][getJobMirrorReport] request", { roleOverride });
      try {
        const result = await getJobMirrorReport({
          data: roleOverride ? { role: roleOverride } : undefined,
        });
        console.info("[CareerPilot][client][getJobMirrorReport] success", {
          roleId: result.role.roleId,
          skills: result.skills.length,
        });
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][getJobMirrorReport] failed", error);
        throw new Error(
          friendlyError(error, "Flight Plan data couldn't be loaded. Please try again."),
        );
      }
    },
    // The dataset is versioned and changes only when re-researched, so the
    // only moving part is the student's own evidence.
    staleTime: 15 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
