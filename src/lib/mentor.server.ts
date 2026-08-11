import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { groqChat, type ChatMsg } from "./ai.server";

type Client = SupabaseClient<Database>;

export const MENTOR_HISTORY_LIMIT = 20;

/** Builds a compact, factual snapshot of the user's career data for the model. */
export async function buildCareerContext(supabase: Client, userId: string): Promise<string> {
  const [profileRes, goalRes, skillsRes, analysisRes, stagesRes, appsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("career_goals").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("user_skills")
      .select("proficiency, skills(name, category)")
      .eq("user_id", userId),
    supabase
      .from("resume_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("roadmap_stages")
      .select("title, timeframe, completed, skills")
      .eq("user_id", userId)
      .order("position"),
    supabase.from("applications").select("company, role_title, status").eq("user_id", userId),
  ]);

  const profile = profileRes.data;
  const goal = goalRes.data;
  const skills = (skillsRes.data ?? [])
    .map((r) => {
      const s = r.skills as unknown as { name?: string } | null;
      return s?.name ? `${s.name} (${r.proficiency}%)` : null;
    })
    .filter(Boolean);
  const analysis = analysisRes.data;
  const stages = stagesRes.data ?? [];
  const apps = appsRes.data ?? [];

  const lines: string[] = [];
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  if (name) lines.push(`Name: ${name}`);
  if (profile?.current_role) lines.push(`Current role: ${profile.current_role}`);
  const education = [profile?.degree, profile?.university, profile?.graduation_year]
    .filter(Boolean)
    .join(", ");
  if (education) lines.push(`Education: ${education}`);
  if (goal?.target_role) lines.push(`Target role: ${goal.target_role}`);
  if (goal?.target_industry) lines.push(`Target industry: ${goal.target_industry}`);
  lines.push(skills.length ? `Skills: ${skills.join(", ")}` : "Skills: none recorded yet");

  if (analysis) {
    lines.push(
      `Latest resume analysis — ATS ${analysis.ats_score}/100, resume ${analysis.resume_score}/100, career match ${analysis.career_match}/100.`,
    );
    const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
    if (weaknesses.length) lines.push(`Resume gaps: ${weaknesses.slice(0, 5).join("; ")}`);
  } else {
    lines.push("No resume has been analysed yet.");
  }

  if (stages.length) {
    const done = stages.filter((s) => s.completed).length;
    lines.push(
      `Roadmap (${done}/${stages.length} stages complete): ${stages
        .map((s) => `${s.title}${s.completed ? " ✓" : ""}`)
        .join(" → ")}`,
    );
  } else {
    lines.push("No roadmap generated yet.");
  }

  if (apps.length) {
    lines.push(
      `Applications: ${apps
        .map((a) => `${a.role_title} @ ${a.company} (${a.status})`)
        .slice(0, 8)
        .join("; ")}`,
    );
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are CareerPilot's AI career mentor: a sharp, senior career coach for students and early-career professionals.

Rules:
- Ground every answer in the user's actual profile data provided below. Never invent scores, employers or achievements that aren't listed.
- If a fact isn't in the profile, say what's missing and how to add it (e.g. upload a resume, set a goal).
- Be concrete and actionable: name specific skills, projects, resources and next steps.
- Keep replies under 180 words, plain text, no markdown headings. Short paragraphs or dashes only.
- Warm, direct and practical — never generic filler.`;

export async function runMentorTurn(
  supabase: Client,
  userId: string,
  message: string,
): Promise<{ reply: string }> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Please type a message first.");
  if (trimmed.length > 2000) throw new Error("That message is too long — keep it under 2000 characters.");

  const [context, historyRes] = await Promise.all([
    buildCareerContext(supabase, userId),
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MENTOR_HISTORY_LIMIT),
  ]);
  if (historyRes.error) throw historyRes.error;

  const history = (historyRes.data ?? []).slice().reverse();

  const messages: ChatMsg[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n=== USER CAREER PROFILE ===\n${context}` },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: trimmed },
  ];

  const reply = await groqChat(messages, { maxTokens: 700, temperature: 0.65 });

  const { error } = await supabase.from("chat_messages").insert([
    { user_id: userId, role: "user", content: trimmed },
    { user_id: userId, role: "assistant", content: reply },
  ]);
  if (error) throw error;

  return { reply };
}
