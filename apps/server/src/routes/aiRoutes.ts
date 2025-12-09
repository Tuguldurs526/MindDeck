// apps/server/src/routes/aiRoutes.ts
import { Response, Router } from "express";
import OpenAI from "openai";
import { postExplain, postHint } from "../controllers/aiController.js";
import { AuthRequest, verifyToken } from "../middleware/auth.js";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// You can keep this env-based model:
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * POST /ai/generate
 * Body: { text: string; numCards?: number }
 * Returns: { cards: { front: string; back: string }[] }
 */
router.post("/generate", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { text, numCards = 10 } = req.body as {
      text?: string;
      numCards?: number;
    };

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return res.status(400).json({ error: "Please provide at least a few sentences of text." });
    }

    const prompt = `
You are a helpful study assistant.
From the following study material, create ${numCards} high-quality Q&A flashcards.

Return ONLY valid JSON in this exact shape:
{
  "cards": [
    { "front": "Question 1", "back": "Answer 1" },
    { "front": "Question 2", "back": "Answer 2" }
  ]
}

Do not include any other text outside JSON.

Text:
"""${text}"""
`;

    const completion = await openai.responses.create({
      model: MODEL,
      input: prompt,
      // ❌ REMOVE this – it causes the 400 error with the Responses API
      // response_format: { type: "json_object" },
    });

    // Responses API: text lives here
    const raw = (completion as any).output[0].content[0].text as string;

    // We still told the model to respond with JSON, so parse it:
    const parsed = JSON.parse(raw) as {
      cards?: { front: string; back: string }[];
    };

    const cards = Array.isArray(parsed.cards) ? parsed.cards : [];

    return res.json({ cards });
  } catch (err: any) {
    console.error("DEBUG /ai/generate error", err);
    return res.status(500).json({ error: err.message ?? "Failed to generate cards" });
  }
});

/**
 * Keep the existing AI helper endpoints
 * POST /ai/explain
 * POST /ai/hint
 */
router.post("/explain", verifyToken, postExplain);
router.post("/hint", verifyToken, postHint);

export default router;
