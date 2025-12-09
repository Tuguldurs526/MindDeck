import { Response, Router } from "express";
import { Types } from "mongoose";

import { AuthRequest, verifyToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Card from "../models/Card.js";
import Deck from "../models/Deck.js";
import { createCardSchema, listQuerySchema } from "../schemas/cardSchemas.js";

const router = Router();

function getReqUserId(req: AuthRequest): string {
  if (!req.userId) {
    throw new Error("Missing user id on request");
  }
  return req.userId;
}

/**
 * POST /cards
 * Create a card owned by the current user in the given deck.
 */
router.post(
  "/",
  verifyToken,
  validate(createCardSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = getReqUserId(req);
      const { front, back, deckId } = req.body as any;

      if (!Types.ObjectId.isValid(deckId)) {
        return res.status(400).json({ error: "Invalid deck id" });
      }

      const deck = await Deck.findById(deckId).select("_id");
      if (!deck) {
        return res.status(404).json({ error: "Deck not found" });
      }

      const card = await Card.create({
        owner: userId,
        deck: deckId,
        front,
        back,
      });

      return res.status(201).json(card);
    } catch (err: any) {
      console.debug("DEBUG /cards POST error:", err);
      return res.status(500).json({ error: err.message ?? "Internal error" });
    }
  }
);

/**
 * GET /cards/:deckId
 * Returns a simple ARRAY of cards.
 * NOTE: Ensure frontend calls this with the ID directly, not as a query param.
 */
router.get("/:deckId", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { deckId } = req.params;

    if (!Types.ObjectId.isValid(deckId)) {
      return res.status(400).json({ error: "Invalid deck id" });
    }

    const deck = await Deck.findById(deckId).select("_id");
    if (!deck) {
      return res.status(403).json({ error: "Deck not accessible" });
    }

    const cards = await Card.find({ deck: deckId }).sort({ createdAt: 1 });

    // Returns plain array [ {}, {} ]
    return res.json(cards);
  } catch (err: any) {
    console.debug("DEBUG /cards/:deckId GET error:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

/**
 * PUT /cards/:id
 * Update a card.
 */
router.put("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getReqUserId(req);
    const { id } = req.params;
    const { front, back } = req.body as any;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid card id" });
    }

    const update: any = {};
    if (typeof front === "string") update.front = front;
    if (typeof back === "string") update.back = back;

    const card = await Card.findOneAndUpdate(
      { _id: id, owner: userId },
      { $set: update },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    return res.json(card);
  } catch (err: any) {
    console.debug("DEBUG /cards/:id PUT error:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

/**
 * DELETE /cards/:id
 * Delete a card.
 */
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getReqUserId(req);
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid card id" });
    }

    const deleted = await Card.findOneAndDelete({ _id: id, owner: userId });
    if (!deleted) {
      return res.status(404).json({ error: "Card not found" });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.debug("DEBUG /cards/:id DELETE error:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

/**
 * GET /cards
 * Query params: ?deck=...&limit=...
 * Returns an OBJECT { items: [], nextCursor: ... }
 */
router.get("/", verifyToken, validate(listQuerySchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = getReqUserId(req);
    const { deck, cursor } = req.query as any;

    if (!Types.ObjectId.isValid(deck)) {
      return res.status(400).json({ error: "Invalid deck id" });
    }

    const limit = Number((req.query as any).limit ?? 10) || 10;
    const query: any = { owner: userId, deck };
    if (cursor) {
      query._id = { $gt: cursor };
    }

    const items = await Card.find(query).sort({ _id: 1 }).limit(limit);
    const nextCursor = items.length === limit ? items[items.length - 1]._id : null;

    return res.json({ items, nextCursor });
  } catch (err: any) {
    console.debug("DEBUG /cards GET error:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

export default router;
