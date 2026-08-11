/**
 * Server-only Groq client. GROQ_API_KEY is read inside the call, never at
 * module scope, and is never exposed to the browser.
 */

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export class AiError extends Error {}

export async function groqChat(
  messages: ChatMsg[],
  opts: { json?: boolean; maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    throw new AiError(
      "The AI service isn't configured yet. Add a Groq API key in project secrets to enable it.",
    );
  }

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens ?? 1024,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch (error) {
    console.error("groq network error", error);
    throw new AiError("Couldn't reach the AI service. Please try again in a moment.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("groq error", res.status, body.slice(0, 500));
    if (res.status === 401 || res.status === 403)
      throw new AiError("The AI service rejected the configured credentials.");
    if (res.status === 429)
      throw new AiError("The AI service is rate limited right now. Try again shortly.");
    throw new AiError("The AI service returned an error. Please try again.");
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AiError("The AI service returned an empty response.");
  return content;
}

/** Parses a JSON object out of a model response, tolerating stray prose/fences. */
export function parseJsonObject<T>(raw: string): T {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    throw new AiError("The AI response couldn't be read. Please try again.");
  }
}

export function clampScore(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function stringList(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}
