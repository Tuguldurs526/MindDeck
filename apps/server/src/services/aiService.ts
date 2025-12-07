// apps/server/src/services/aiService.ts
import OpenAI, { type ClientOptions } from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const useMock =
  process.env.NODE_ENV === "test" || process.env.OPENAI_MOCK === "1";

let _client: OpenAI | null = null;

/** Dependency injection for tests or custom transports */
export function setOpenAIClient(client: OpenAI | null) {
  _client = client;
}

function getClient(): OpenAI {
  if (_client) return _client;
  if (useMock) {
    // In test, never require a real key
    // Create a no-op client only to satisfy types (won't be called)
    _client = {} as unknown as OpenAI;
    return _client;
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("[aiService] OPENAI_API_KEY is not set");

  const opts: ClientOptions = { apiKey };
  // Optional: proxy/azure support via env
  if (process.env.OPENAI_BASE_URL) {
    // openai sdk v4 supports baseURL via this key
    // @ts-ignore
    opts.baseURL = process.env.OPENAI_BASE_URL;
  }
  _client = new OpenAI(opts);
  return _client;
}

function extractText(res: any): string {
  // OpenAI Responses API
  if (typeof res?.output_text === "string" && res.output_text.trim()) {
    return res.output_text.trim();
  }
  try {
    const pieces = (res?.output ?? [])
      .flatMap((o: any) => o?.content ?? [])
      .map((c: any) => c?.text ?? c?.content ?? "")
      .filter(Boolean);
    const txt = pieces.join("\n").trim();
    if (txt) return txt;
  } catch {
    // ignore
  }
  // Last resort: concise fallback
  return "[no_text]";
}

function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  signal?: AbortSignal
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`LLM timeout after ${ms}ms`)),
      ms
    );
    const abort = () => {
      clearTimeout(t);
      reject(new Error("LLM aborted"));
    };
    if (signal) {
      if (signal.aborted) return abort();
      signal.addEventListener("abort", abort, { once: true });
    }
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

function clamp(s: string, max = 8000): string {
  // Protect against ridiculous prompts accidentally logged or sent
  return s.length <= max ? s : s.slice(0, max);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(base: number) {
  return base + Math.floor(Math.random() * 150);
}

/** Single call primitive the tests spy on */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  opts?: {
    maxOutputTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }
): Promise<string> {
  if (useMock) {
    // Slightly smarter mock to surface format bugs
    const sp = clamp(systemPrompt, 100);
    const up = clamp(userPrompt, 100);
    return `[mock:${sp ? "sys" : ""}${up ? "+user" : ""}] X`;
  }

  const client = getClient();
  const max_output_tokens = opts?.maxOutputTokens ?? 250;
  const temperature = opts?.temperature ?? 0.2;
  const timeoutMs = opts?.timeoutMs ?? 15000;
  const signal = opts?.signal;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await withTimeout(
        client.responses.create({
          model: MODEL,
          input: [
            { role: "system", content: clamp(systemPrompt) },
            { role: "user", content: clamp(userPrompt) },
          ],
          max_output_tokens,
          temperature,
        }),
        timeoutMs,
        signal
      );
      return extractText(res);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const retriable =
        status === 429 ||
        (typeof status === "number" && status >= 500 && status < 600) ||
        /timeout/i.test(String(err?.message)) ||
        /ECONNRESET|ETIMEDOUT|aborted/i.test(String(err?.message));
      if (attempt < maxAttempts && retriable) {
        await sleep(jitter(300 * attempt));
        continue;
      }
      throw err;
    }
  }
  // Unreachable, but TS appeasement
  throw new Error("LLM failed unexpectedly");
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



