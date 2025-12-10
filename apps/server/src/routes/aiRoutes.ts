// apps/server/src/routes/aiRoutes.ts
import type { Request, Response } from "express";
import { Router } from "express";
import { createRequire } from "module";
import multer from "multer";
import OpenAI from "openai";
import { postExplain, postHint } from "../controllers/aiController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const require = createRequire(import.meta.url);

// ---- CommonJS libs: pdf-parse & mammoth ----
// pdf-parse v2+ exposes a PDFParse *class*, not a default function.
const { PDFParse } = require("pdf-parse") as {
  PDFParse: new (options: { data: Buffer }) => {
    getText: () => Promise<{ text: string }>;
    destroy: () => Promise<void>;
  };
};

const mammoth = require("mammoth") as typeof import("mammoth");

// ---- Router & OpenAI client ----
const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// use a chat model that supports JSON output
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

// ---- Multer for in-memory uploads ----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Small helper: extract text from a PDF Buffer using PDFParse class.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    // TextResult has a `text` field containing the whole text.
    return (result as any).text || "";
  } finally {
    // make sure resources are freed
    if (typeof parser.destroy === "function") {
      await parser.destroy();
    }
  }
}

/**
 * Shared helper: given raw text, ask OpenAI to produce flashcards.
 */
async function generateCardsFromText(text: string, numCards = 10) {
  const safeNum = Math.min(Math.max(Number(numCards) || 10, 1), 30);

  const prompt = `
You are a helpful study assistant.
From the following study material, create ${safeNum} high-quality Q&A flashcards.

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
`.trim();

  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a helpful study assistant. You always respond with JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("DEBUG /ai generate JSON parse error:", e, raw);
    throw new Error("Model did not return valid JSON");
  }

  const cards = Array.isArray(parsed?.cards) ? parsed.cards : [];
  return cards as { front: string; back: string }[];
}

/**
 * POST /ai/generate
 * Body: { text: string; numCards?: number }
 * Returns: { cards: { front: string; back: string }[] }
 */
router.post("/generate", verifyToken, async (req: Request, res: Response) => {
  try {
    const { text, numCards = 10 } = req.body as {
      text?: string;
      numCards?: number;
    };

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return res.status(400).json({ error: "Please provide at least a few sentences of text." });
    }

    const cards = await generateCardsFromText(text, numCards);
    return res.json({ cards });
  } catch (err: any) {
    console.error("DEBUG /ai/generate error", err);
    return res.status(500).json({ error: err.message ?? "Failed to generate cards" });
  }
});

/**
 * POST /ai/upload
 * multipart/form-data with field "file"
 * Accepts: PDF or DOCX, extracts text, then reuses generateCardsFromText.
 */
router.post("/upload", verifyToken, upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file || !file.buffer) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { originalname, mimetype, buffer } = file;
    const lowerName = originalname.toLowerCase();
    let text = "";

    if (mimetype === "application/pdf" || lowerName.endsWith(".pdf")) {
      text = await extractPdfText(buffer);
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else {
      return res.status(400).json({
        error: "Unsupported file type. Please upload a PDF or DOCX file.",
      });
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        error: "Could not extract enough text from the document.",
      });
    }

    // ✅ read numCards from the form (sent by frontend)
    const rawNum =
      req.body && (req.body as any).numCards !== undefined
        ? Number((req.body as any).numCards)
        : 10;

    const cards = await generateCardsFromText(text, rawNum);

    return res.json({ cards });
  } catch (err: any) {
    console.error("DEBUG /ai/upload error", err);
    return res.status(500).json({
      error: err.message ?? "Failed to generate cards from file",
    });
  }
});

/**
 * Existing AI helper endpoints
 */
router.post("/explain", verifyToken, postExplain);
router.post("/hint", verifyToken, postHint);

export default router;
