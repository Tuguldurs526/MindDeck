// apps/server/src/controllers/cardController.ts
import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import Card from "../models/Card.js"; // default export
import Deck from "../models/Deck.js"; // you already have this for /decks

/**
 * Helper: simple deck ownership check that does not rely on a separate service
 */
async function assertDeckOwned(deckId: string, userId: string) {
  if (!Types.ObjectId.isValid(deckId)) {
    const err: any = new Error("Invalid deck id");
    err.status = 400;
    throw err;
  }

  const deck = await Deck.findOne({ _id: deckId, ownerId: userId });
  if (!deck) {
    const err: any = new Error("Deck not found or not owned by user");
    err.status = 404;
    throw err;
  }
}

/**
 * POST /cards
 * Body: { front, back, deckId }
 * Creates a new card owned by the authenticated user.
 */
export async function createCard(req: Request, res: Response, next: NextFunction) {
  try {
    const { front, back, deckId } = req.body;

    if (!front || !back || !deckId) {
      const err: any = new Error("Missing fields");
      err.status = 400;
      throw err;
    }

    // user id is typically attached by verifyToken middleware
    const userId = (req as any).userId || (req as any).user?.id;
    if (!userId) {
      const err: any = new Error("User not authenticated");
      err.status = 401;
      throw err;
    }

    await assertDeckOwned(deckId, userId);

    const now = new Date();

    const card = await Card.create({
      front,
      back,
      deckId,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
      // SM-2 initial state; matches what reviews.e2e expects
      sm2: {
        interval: 1,
        reps: 0,
        efactor: 2.5,
        due: now,
      },
    });

    return res.status(201).json(card);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /cards?deck=<deckId>&limit=<n>&cursor=<id>
 * Paginates cards by deck.
 */
export async function listCards(req: Request, res: Response, next: NextFunction) {
  try {
    const deckId = req.query.deck as string;
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor as string | undefined;

    if (!deckId || !Types.ObjectId.isValid(deckId)) {
      const err: any = new Error("Invalid deck id");
      err.status = 400;
      throw err;
    }

    const userId = (req as any).userId || (req as any).user?.id;
    if (!userId) {
      const err: any = new Error("User not authenticated");
      err.status = 401;
      throw err;
    }

    await assertDeckOwned(deckId, userId);

    const query: any = { deckId };
    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $gt: cursor };
    }

    const items = await Card.find(query)
      .sort({ _id: 1 })
      .limit(limit + 1);

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const last = items[items.length - 1];
      nextCursor = String(last._id);
      items.pop();
    }

    return res.status(200).json({
      items,
      nextCursor,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /cards/:id
 * Allows updating front/back content.
 */
export async function updateCard(req: Request, res: Response, next: NextFunction) {
  try {
    const cardId = req.params.id;
    const { front, back } = req.body;

    if (!Types.ObjectId.isValid(cardId)) {
      const err: any = new Error("Invalid card id");
      err.status = 400;
      throw err;
    }

    const card = await Card.findById(cardId);
    if (!card) {
      const err: any = new Error("Card not found");
      err.status = 404;
      throw err;
    }

    const userId = (req as any).userId || (req as any).user?.id;
    if (!userId || String(card.ownerId) !== String(userId)) {
      const err: any = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    if (front !== undefined) card.front = front;
    if (back !== undefined) card.back = back;
    card.updatedAt = new Date();

    await card.save();

    return res.status(200).json(card);
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /cards/:id
 */
export async function deleteCard(req: Request, res: Response, next: NextFunction) {
  try {
    const cardId = req.params.id;

    if (!Types.ObjectId.isValid(cardId)) {
      const err: any = new Error("Invalid card id");
      err.status = 400;
      throw err;
    }

    const card = await Card.findById(cardId);
    if (!card) {
      const err: any = new Error("Card not found");
      err.status = 404;
      throw err;
    }

    const userId = (req as any).userId || (req as any).user?.id;
    if (!userId || String(card.ownerId) !== String(userId)) {
      const err: any = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    await card.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
