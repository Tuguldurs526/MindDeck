// apps/server/src/controllers/deckController.ts
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../middleware/error.js";
import Card from "../models/Card.js";
import Deck from "../models/Deck.js";

const { isValidObjectId } = mongoose;

const getUserId = (req: Request): string => (req as any).user?.sub ?? "";

// Shared helper: require authenticated user
function requireUser(req: Request): string {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "UNAUTHORIZED", "User not authenticated");
  }
  return userId;
}

// Shared helper: find a deck that belongs to the user
async function findOwnedDeckOrThrow(id: string, userId: string) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid deck id");
  }

  const deck = await Deck.findOne({
    _id: id,
    $or: [{ user: userId }, { owner: userId }],
  }).lean();

  if (!deck) {
    // Don't leak existence vs ownership; 404 is fine
    throw new ApiError(404, "NOT_FOUND", "Deck not found");
  }

  return deck;
}

/**
 * POST /decks
 * Body: { title, source? }
 */
export async function createDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, source } = (req.body ?? {}) as {
      title?: string;
      source?: string;
    };

    const normalizedTitle = title?.trim();
    if (!normalizedTitle) {
      throw new ApiError(400, "BAD_REQUEST", "Title is required");
    }

    const userId = requireUser(req);

    // Enforce per‑user unique title
    const existing = await Deck.findOne({
      title: normalizedTitle,
      $or: [{ user: userId }, { owner: userId }],
    })
      .select("_id")
      .lean();

    if (existing) {
      throw new ApiError(409, "CONFLICT", "Deck with this title already exists");
    }

    const deck = await Deck.create({
      title: normalizedTitle,
      // Set both for backward compatibility with older code/tests
      user: userId,
      owner: userId,
      // only treat explicit "ai" as AI; everything else/manual/undefined = "manual"
      source: source === "ai" ? "ai" : "manual",
    });

    return res.status(201).json(deck);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /decks
 * Returns all decks owned by the current user
 */
export async function listDecks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUser(req);

    // 1) find all decks of this user
    const decks = await Deck.find({
      $or: [{ user: userId }, { owner: userId }],
    }).sort({ createdAt: -1, _id: -1 });

    const deckIds = decks.map((d) => d._id);

    // 2) aggregate card counts per deck
    const counts = await Card.aggregate([
      { $match: { deck: { $in: deckIds } } },
      { $group: { _id: "$deck", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const row of counts) {
      countMap.set(String(row._id), row.count);
    }

    // 3) attach cardCount to each deck
    const items = decks.map((d) => {
      const obj = d.toObject();
      return {
        ...obj,
        cardCount: countMap.get(String(d._id)) ?? 0,
      };
    });

    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /decks/:id
 */
export async function getDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUser(req);
    const { id } = req.params;

    const deck = await findOwnedDeckOrThrow(id, userId);
    return res.json(deck);
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /decks/:id
 * Also deletes all cards in that deck
 */
export async function deleteDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUser(req);
    const { id } = req.params;

    // Ensure it exists and belongs to user
    await findOwnedDeckOrThrow(id, userId);

    // Delete deck
    await Deck.deleteOne({ _id: id });

    // Cascade delete cards in this deck
    await Card.deleteMany({ deck: id });

    return res.json({ deleted: true });
  } catch (err) {
    return next(err);
  }
}
