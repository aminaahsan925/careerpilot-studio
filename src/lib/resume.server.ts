import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { buildCareerContext } from "./mentor.server";
import { clampScore, groqChat, parseJsonObject, stringList } from "./ai.server";

type Client = SupabaseClient<Database>;

/* ---------------------------- text extraction ---------------------------- */

function stripXml(xml: string): string {
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

/* -------------------------------- analysis ------------------------------- */

export type AnalysisResult = {
  ats_score: number;
  resume_score: number;
  career_match: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  detected_skills: string[];
  recommendations: { title: string; impact: string }[];
  role_matches: { role: string; match: number }[];
};

const SYSTEM = `You are an expert technical recruiter and ATS auditor. You grade resumes strictly and honestly.
Return ONLY a JSON object with exactly these keys:
{
  "ats_score": number 0-100,
  "resume_score": number 0-100,
  "career_match": number 0-100,
  "summary": string (max 220 chars),
  "strengths": string[] (3-5 short items),
  "weaknesses": string[] (3-5 short items),
  "detected_skills": string[] (up to 14 concrete skills found in the resume),
  "recommendations": [{"title": string, "impact": string like "+6 ATS"}] (3-5 items),
  "role_matches": [{"role": string, "match": number 0-100}] (4 roles relevant to the target role)
}
Base career_match on the fit between the resume and the stated target role. Never invent experience.`;

export async function analyzeResumeText(
  supabase: Client,
  userId: string,
  resumeText: string,
): Promise<AnalysisResult> {
  const context = await buildCareerContext(supabase, userId);
  const trimmed = resumeText.slice(0, 18000);

  const raw = await groqChat(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `=== CANDIDATE PROFILE ===\n${context}\n\n=== RESUME TEXT ===\n${trimmed}`,
      },
    ],
    { json: true, maxTokens: 1600, temperature: 0.3 },
  );

  const parsed = parseJsonObject<Record<string, unknown>>(raw);

  const recommendations = Array.isArray(parsed["recommendations"])
    ? (parsed["recommendations"] as Record<string, unknown>[])
        .map((r) => ({
          title: String(r?.["title"] ?? "").trim(),
          impact: String(r?.["impact"] ?? "").trim() || "High impact",
        }))
        .filter((r) => r.title)
        .slice(0, 5)
    : [];

  const roleMatches = Array.isArray(parsed["role_matches"])
    ? (parsed["role_matches"] as Record<string, unknown>[])
        .map((r) => ({
          role: String(r?.["role"] ?? "").trim(),
          match: clampScore(r?.["match"]),
        }))
        .filter((r) => r.role)
        .slice(0, 5)
    : [];

  return {
    ats_score: clampScore(parsed["ats_score"]),
    resume_score: clampScore(parsed["resume_score"]),
    career_match: clampScore(parsed["career_match"]),
    summary: String(parsed["summary"] ?? "").slice(0, 400),
    strengths: stringList(parsed["strengths"], 6),
    weaknesses: stringList(parsed["weaknesses"], 6),
    detected_skills: stringList(parsed["detected_skills"], 14),
    recommendations,
    role_matches: roleMatches,
  };
}

export async function analyzeStoredResume(supabase: Client, userId: string, resumeId: string) {
  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!resume) throw new Error("That resume couldn't be found.");

  let text = resume.content_text ?? "";
  if (!text) {
    const download = await supabase.storage.from("resumes").download(resume.file_path);
    if (download.error || !download.data)
      throw new Error("Couldn't read the uploaded file. Please upload it again.");
    const bytes = new Uint8Array(await download.data.arrayBuffer());
    text = await extractResumeText(bytes, resume.file_name);
    if (text.replace(/\s/g, "").length < 120)
      throw new Error(
        "We couldn't extract enough text from that file. If it's a scanned image, upload a text-based PDF instead.",
      );
    await supabase.from("resumes").update({ content_text: text }).eq("id", resume.id);
  }

  const analysis = await analyzeResumeText(supabase, userId, text);

  const { data: saved, error: insertError } = await supabase
    .from("resume_analyses")
    .insert({ user_id: userId, resume_id: resume.id, ...analysis })
    .select("*")
    .single();
  if (insertError) throw insertError;

  return saved;
}
