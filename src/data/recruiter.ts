import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  chatWithRecruiterFn,
  loadRecruiterSessionFn,
  runRecruiterAuditFn,
} from "@/lib/recruiter.functions";

export type { RecruiterAudit, RecruiterSession, BrutalVerdict } from "@/lib/recruiter.server";

export function useRecruiterSession() {
  return useQuery({
    queryKey: ["recruiter-session"],
    queryFn: async () => {
      console.info("[CareerPilot][client][loadRecruiterSession] request");
      try {
        const result = await loadRecruiterSessionFn();
        console.info("[CareerPilot][client][loadRecruiterSession] success", {
          hasSession: Boolean(result),
        });
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][loadRecruiterSession] failed", error);
        throw error;
      }
    },
  });
}

export function useRunRecruiterAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input?: { company?: string; role?: string }) => {
      console.info("[CareerPilot][client][runRecruiterAudit] request", input);
      try {
        const result = await runRecruiterAuditFn({ data: input });
        console.info("[CareerPilot][client][runRecruiterAudit] success", {
          sessionId: result.id,
          score: result.overallScore,
        });
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][runRecruiterAudit] failed", error);
        throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["recruiter-session"] });
      void qc.invalidateQueries({ queryKey: ["career-overview"] });
    },
  });
}

export function useChatWithRecruiter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { sessionId: string; message: string }) => {
      console.info("[CareerPilot][client][chatWithRecruiter] request");
      try {
        const result = await chatWithRecruiterFn({ data: input });
        console.info("[CareerPilot][client][chatWithRecruiter] success");
        return result;
      } catch (error) {
        console.error("[CareerPilot][client][chatWithRecruiter] failed", error);
        throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["recruiter-session"] });
    },
  });
}
