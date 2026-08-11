import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { sendMentorMessage } from "@/lib/mentor.functions";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function useChatHistory() {
  return useQuery({
    queryKey: ["chat-messages"],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChatMessage[];
    },
  });
}

export function useSendMentorMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => sendMentorMessage({ data: { message } }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["chat-messages"] }),
  });
}

export function useClearChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Your session has expired. Please sign in again.");
      const { error } = await supabase.from("chat_messages").delete().eq("user_id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-messages"] }),
  });
}
