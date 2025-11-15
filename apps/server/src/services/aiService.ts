// apps/server/src/services/aiService.ts
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn(
    "[aiService] OPENAI_API_KEY not set. /ai endpoints will fail if called."
  );
}

const client = new OpenAI({ apiKey });
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/**
 * Extract a plain string from OpenAI Responses API result, with fallbacks.
 */
function extractText(res: any): string {
  // New SDK convenience
  if (res && typeof res.output_text === "string" && res.output_text.trim()) {
    return res.output_text.trim();
  }
  // Structured fallback: responses output[]
  try {
    const pieces = (res?.output ?? [])
      .flatMap((o: any) => o?.content ?? [])
      .map((c: any) => c?.text ?? c?.content ?? "")
      .filter(Boolean);
    const txt = pieces.join("\n").trim();
    if (txt) return txt;
  } catch (_) {}
  // Last resort: stringify
  return JSON.stringify(res);
}

/**
 * Core seam used by tests to verify caching/limits without real network.
 * Use this everywhere instead of hitting the client directly.
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  opts?: {
    maxOutputTokens?: number;
    temperature?: number;
    timeoutMs?: number;
  }
): Promise<string> {
  const maxOutputTokens = opts?.maxOutputTokens ?? 250;
  const temperature = opts?.temperature ?? 0.2;
  const timeoutMs = opts?.timeoutMs ?? 15000;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);

  // Tiny backoff for 429/5xx
  let attempt = 0;
  // at most 2 retries (3 total tries)
  while (true) {
    try {
      const res = await client.responses.create({
        model: MODEL,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_output_tokens: maxOutputTokens,
        temperature,
        // @ts-ignore — SDK supports signal passthrough
        signal: ac.signal,
      });

      clearTimeout(t);
      return extractText(res);
    } catch (err: any) {
      attempt++;
      const status = err?.status ?? err?.response?.status;
      const retriable =
        status === 429 ||
        (status >= 500 && status < 600) ||
        err?.name === "AbortError";
      if (attempt <= 2 && retriable) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
        continue;
      }
      clearTimeout(t);
      throw err;
    }
  }
}

export async function aiExplain(prompt: string): Promise<string> {
  return callLLM(
    "Explain briefly and clearly for a CS student. Avoid fluff. Prefer 3–5 sentences. If the input is malformed, state the assumption you made.",
    prompt,
    { maxOutputTokens: 300, temperature: 0.2 }
  );
}

export async function aiHint(prompt: string): Promise<string> {
  return callLLM(
    "Provide a short hint only. Nudge the learner but do not reveal the full answer.",
    prompt,
    { maxOutputTokens: 120, temperature: 0.2 }
  );
}
