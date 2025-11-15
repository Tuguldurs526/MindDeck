import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("[aiService] OPENAI_API_KEY not set. /ai endpoints will fail if called.");
}

const client = new OpenAI({ apiKey });
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function aiExplain(prompt: string): Promise<string> {
  const res = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: "Explain briefly and clearly for a CS student. Avoid fluff. 3–5 sentences." },
      { role: "user", content: prompt }
    ]
  });
  // @ts-ignore
  return res.output_text || JSON.stringify(res);
}

export async function aiHint(prompt: string): Promise<string> {
  const res = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: "Provide a short hint only. Do not reveal the full answer." },
      { role: "user", content: prompt }
    ]
  });
  // @ts-ignore
  return res.output_text || JSON.stringify(res);
}
