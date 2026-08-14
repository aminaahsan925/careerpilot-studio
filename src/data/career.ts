import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  analyzeJobDescription,
  getCareerOverview,
  runDiagnosis,
  setCareerTarget,
} from "@/lib/career.functions";

export type CareerOverview = Awaited<ReturnType<typeof getCareerOverview>>;

export function useCareerOverview() {
  return useQuery({
    queryKey: ["career-overview"],
    queryFn: () => getCareerOverview(),
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["career-overview"] });
    void qc.invalidateQueries({ queryKey: ["chat-messages"] });
  };
}

export function useRunDiagnosis() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => runDiagnosis(),
    onSuccess: invalidate,
  });
}

export function useSetCareerTarget() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { role: string; industry?: string }) =>
      setCareerTarget({ data: input }),
    onSuccess: invalidate,
  });
}

export function useAnalyzeJob() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { title: string; company?: string; description: string }) =>
      analyzeJobDescription({ data: input }),
    onSuccess: invalidate,
  });
}
