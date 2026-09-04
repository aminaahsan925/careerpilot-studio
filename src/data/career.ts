import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addSkillEvidence,
  analyzeJobDescription,
  getCareerOverview,
  getDiagnosticIntake,
  runDiagnosis,
  saveDiagnosticIntake,
  setCareerTarget,
  type DiagnosticIntakeInput,
} from "@/lib/career.functions";

export type CareerOverview = Awaited<ReturnType<typeof getCareerOverview>>;

export function useCareerOverview() {
  return useQuery({
    queryKey: ["career-overview"],
    queryFn: async () => {
      console.info("[CareerPilot][client][getCareerOverview] request");
      try {
        const result = await getCareerOverview();
        console.info("[CareerPilot][client][getCareerOverview] success", {
          targetRole: result.targetRole,
          hasDiagnosis: Boolean(result.diagnosis),
        });
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][getCareerOverview] failed", error);
        throw error;
      }
    },
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
    mutationFn: async (input?: { company?: string; role?: string }) => {
      console.info("[CareerPilot][client][runDiagnosis] request", input);
      try {
        const result = await runDiagnosis({ data: input });
        console.info("[CareerPilot][client][runDiagnosis] success", { diagnosisId: result.id });
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][runDiagnosis] failed", error);
        throw error;
      }
    },
    onSuccess: invalidate,
  });
}

export function useSetCareerTarget() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { role: string; industry?: string }) => setCareerTarget({ data: input }),
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

export function useAddSkillEvidence() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { source: "github" | "project"; detail: string; skills: string[] }) =>
      addSkillEvidence({ data: input }),
    onSuccess: invalidate,
  });
}

export function useDiagnosticIntake() {
  return useQuery({
    queryKey: ["diagnostic-intake"],
    queryFn: async () => {
      console.info("[CareerPilot][client][getDiagnosticIntake] request");
      try {
        const result = await getDiagnosticIntake();
        console.info("[CareerPilot][client][getDiagnosticIntake] success", {
          hasIntake: Boolean(result),
        });
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][getDiagnosticIntake] failed", error);
        throw error;
      }
    },
  });
}

export function useSaveDiagnosticIntake() {
  const invalidate = useInvalidate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DiagnosticIntakeInput) => saveDiagnosticIntake({ data: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["diagnostic-intake"] });
      invalidate();
    },
  });
}
