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
    // Don't leak existence vs ownership; 404 is fine for tests
    throw new ApiError(404, "NOT_FOUND", "Deck not found");
  }

  return deck;
}

/**
 * POST /decks
 * Body: { title }
 */
export async function createDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const { title } = (req.body ?? {}) as { title?: string };

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

    const decks = await Deck.find({
      $or: [{ user: userId }, { owner: userId }],
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    // Shape not strongly asserted in tests; this is safe & simple
    return res.json({ items: decks });
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
