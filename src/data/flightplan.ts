import { useMutation } from "@tanstack/react-query";

import { assessFlightPlanJob } from "@/lib/flightplan.functions";

export type FlightPlanAssessmentInput = {
  role: string;
  company?: string;
  jobDescription: string;
  selfDescription?: string;
  gitlabUrl?: string;
};

export type FlightPlanAssessment = Awaited<ReturnType<typeof assessFlightPlanJob>>;

export function useFlightPlanAssessment() {
  return useMutation({
    mutationFn: (input: FlightPlanAssessmentInput) => assessFlightPlanJob({ data: input }),
  });
}
