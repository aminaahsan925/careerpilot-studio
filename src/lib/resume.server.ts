import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { clampScore, groqChat, parseJsonObject, stringList } from "./ai.server";
import { syncResumeEvidence } from "./career.server";
import { buildCareerState } from "./career-state.server";
import { buildCareerContext } from "./mentor.server";
import { saveReadiness } from "./readiness.server";

type Client = SupabaseClient<Database>;

function stripXml(xml: string): string {
  return xml.replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractResumeText(bytes: Uint8Array, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const doc = await getDocumentProxy(bytes);
    const { text } = await extractText(doc, { mergePages: true });
    return String(text ?? "").trim();
  }
  if (lower.endsWith(".docx")) {
    const { unzipSync, strFromU8 } = await import("fflate");
    const files = unzipSync(bytes);
    const doc = files["word/document.xml"];
    if (!doc) throw new Error("That .docx file couldn't be read. Try exporting it as a PDF.");
    return stripXml(strFromU8(doc));
  }
  if (lower.endsWith(".txt")) return new TextDecoder().decode(bytes).trim();
  throw new Error("Unsupported file type. Upload a PDF, DOCX or TXT resume.");
}

export type AnalysisResult = {
  ats_score: number; resume_score: number; career_match: number; summary: string;
  strengths: string[]; weaknesses: string[]; detected_skills: string[];
  recommendations: { title: string; impact: string }[];
  role_matches: { role: string; match: number }[];
};

const SYSTEM = `You are an expert technical recruiter and ATS auditor. Grade resumes strictly and honestly.
Return ONLY JSON with: ats_score, resume_score, career_match (numbers 0-100), summary (max 220 chars), strengths (3-5), weaknesses (3-5), detected_skills (up to 14 concrete skills), recommendations ([{title, impact}]), and role_matches ([{role, match}]). Base career_match on fit with the stated target role. Never invent experience.`;

export async function analyzeResumeText(supabase: Client, userId: string, resumeText: string): Promise<AnalysisResult> {
  const context = await buildCareerContext(supabase, userId);
  const raw = await groqChat(
    [{ role: "system", content: SYSTEM }, { role: "user", content: `=== CANDIDATE PROFILE ===\n${context}\n\n=== RESUME TEXT ===\n${resumeText.slice(0, 18000)}` }],
    { json: true, maxTokens: 1600, temperature: 0.3 },
  );
  const parsed = parseJsonObject<Record<string, unknown>>(raw);
  const recommendations = Array.isArray(parsed["recommendations"])
    ? (parsed["recommendations"] as Record<string, unknown>[]).map((r) => ({
        title: String(r?.["title"] ?? "").trim(),
        impact: String(r?.["impact"] ?? "").trim() || "High impact",
      })).filter((r) => r.title).slice(0, 5)
    : [];
  const roleMatches = Array.isArray(parsed["role_matches"])
    ? (parsed["role_matches"] as Record<string, unknown>[]).map((r) => ({
        role: String(r?.["role"] ?? "").trim(), match: clampScore(r?.["match"]),
      })).filter((r) => r.role).slice(0, 5)
    : [];
  return {
    ats_score: clampScore(parsed["ats_score"]), resume_score: clampScore(parsed["resume_score"]),
    career_match: clampScore(parsed["career_match"]), summary: String(parsed["summary"] ?? "").slice(0, 400),
    strengths: stringList(parsed["strengths"], 6), weaknesses: stringList(parsed["weaknesses"], 6),
    detected_skills: stringList(parsed["detected_skills"], 14), recommendations, role_matches: roleMatches,
  };
}

export async function analyzeStoredResume(supabase: Client, userId: string, resumeId: string) {
  const { data: resume, error } = await supabase.from("resumes").select("*").eq("id", resumeId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!resume) throw new Error("That resume couldn't be found.");

  let text = resume.content_text ?? "";
  if (!text) {
    const download = await supabase.storage.from("resumes").download(resume.file_path);
    if (download.error || !download.data) throw new Error("Couldn't read the uploaded file. Please upload it again.");
    text = await extractResumeText(new Uint8Array(await download.data.arrayBuffer()), resume.file_name);
    if (text.replace(/\s/g, "").length < 120) throw new Error("We couldn't extract enough text from that file. If it's a scanned image, upload a text-based PDF instead.");
    const { error: updateError } = await supabase.from("resumes").update({ content_text: text }).eq("id", resume.id);
    if (updateError) throw updateError;
  }

  const analysis = await analyzeResumeText(supabase, userId, text);
  const { data: saved, error: insertError } = await supabase.from("resume_analyses").insert({ user_id: userId, resume_id: resume.id, ...analysis }).select("*").single();
  if (insertError) throw insertError;

  // Resume mentions are supporting evidence, never verified project demonstrations.
  await syncResumeEvidence(supabase, userId, analysis.detected_skills, resume.file_name);
  await saveReadiness(supabase, userId, await buildCareerState(supabase, userId));
  return saved;
}
