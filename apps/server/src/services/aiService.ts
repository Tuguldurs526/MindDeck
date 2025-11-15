// apps/server/src/services/aiService.ts
import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("[aiService] OPENAI_API_KEY is not set");
  _client = new OpenAI({ apiKey });
  return _client;
}

function extractText(res: any): string {
  if (typeof res?.output_text === "string" && res.output_text.trim())
    return res.output_text.trim();
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

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`LLM timeout after ${ms}ms`)),
      ms
    );
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  opts?: { maxOutputTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<string> {
  const max_output_tokens = opts?.maxOutputTokens ?? 250;
  const temperature = opts?.temperature ?? 0.2;
  const timeoutMs = opts?.timeoutMs ?? 15000;

  let attempt = 0;
  while (true) {
    try {
      const res = await withTimeout(
        getClient().responses.create({
          model: MODEL,
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_output_tokens,
          temperature,
        }),
        timeoutMs
      );
      return extractText(res);
    } catch (err: any) {
      attempt++;
      const status = err?.status ?? err?.response?.status;
      const retriable =
        status === 429 ||
        (status >= 500 && status < 600) ||
        /timeout/i.test(String(err?.message));
      if (attempt <= 2 && retriable) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
        continue;
      }
      throw err;
    }
  }
}

export async function aiExplain(prompt: string): Promise<string> {
  return callLLM(
    "Explain briefly and clearly for a CS student. Avoid fluff. Prefer 3–5 sentences. If input is ambiguous, state assumptions.",
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
