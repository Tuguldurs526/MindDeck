// apps/server/src/services/aiService.ts
import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // If tests stub callLLM, they won't hit here. If they don't, fail clearly.
    throw new Error("[aiService] OPENAI_API_KEY is not set");
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

/** Extract plain text from Responses API result */
function extractText(res: any): string {
  if (res?.output_text && typeof res.output_text === "string") {
    const s = res.output_text.trim();
    if (s) return s;
  }
  try {
    const pieces = (res?.output ?? [])
      .flatMap((o: any) => o?.content ?? [])
      .map((c: any) => c?.text ?? c?.content ?? "")
      .filter(Boolean);
    const txt = pieces.join("\n").trim();
    if (txt) return txt;
  } catch {}
  return JSON.stringify(res);
}

/** Single seam; tests spy on this to avoid network */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  opts?: { maxOutputTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<string> {
  const maxOutputTokens = opts?.maxOutputTokens ?? 250;
  const temperature = opts?.temperature ?? 0.2;
  const timeoutMs = opts?.timeoutMs ?? 15000;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  let attempt = 0;
  while (true) {
    try {
      const res = await getClient().responses.create({
        model: MODEL,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_output_tokens: maxOutputTokens,
        temperature,
        // @ts-ignore
        signal: ac.signal,
      });
      clearTimeout(timer);
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
      clearTimeout(timer);
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
