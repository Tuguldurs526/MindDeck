import { Request, Response } from "express";
import mongoose from "mongoose";
import Card from "../models/Card.js";
import Deck from "../models/Deck.js";

const { isValidObjectId } = mongoose;
const getUserId = (req: Request) => (req as any).user?.sub as string;

// CREATE
export async function createCard(req: Request, res: Response) {
  try {
    const { front, back, deckId } = req.body as {
      front?: string;
      back?: string;
      deckId?: string;
    };
    if (!front?.trim() || !back?.trim() || !deckId)
      return res.status(400).json({ error: "Missing fields" });
    if (!isValidObjectId(deckId))
      return res.status(400).json({ error: "Invalid deckId" });

    const deck = await Deck.findOne({
      _id: deckId,
      user: getUserId(req),
    }).select("_id");
    if (!deck)
      return res.status(403).json({ error: "Deck not found or not yours" });

    const card = await Card.create({
      front: front.trim(),
      back: back.trim(),
      deck: deckId,
    });
    return res.status(201).json(card);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// READ BY DECK
export async function getCardsByDeck(req: Request, res: Response) {
  try {
    const { deckId } = req.params;
    if (!isValidObjectId(deckId))
      return res.status(400).json({ error: "Invalid deckId" });

    const deck = await Deck.findOne({
      _id: deckId,
      user: getUserId(req),
    }).select("_id");
    if (!deck)
      return res.status(403).json({ error: "Deck not found or not yours" });

    // optional pagination: /cards/:deckId?limit=50&page=1
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const cards = await Card.find({ deck: deckId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json(cards); // keep the same response shape (array)
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// UPDATE
export async function updateCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid card id" });

    const card = await Card.findById(id).populate("deck", "user _id");
    if (!card) return res.status(404).json({ error: "Card not found" });

    if (String((card.deck as any).user) !== String(getUserId(req)))
      return res.status(403).json({ error: "Not your card" });

    // allow only front/back changes
    const { front, back } = req.body as { front?: string; back?: string };
    if (typeof front === "string") card.front = front.trim();
    if (typeof back === "string") card.back = back.trim();

    await card.save(); // bumps updatedAt

    // normalize response: deck as id (not populated object)
    const clean = await Card.findById(card._id).lean();
    return res.json(clean);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// DELETE
export async function deleteCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid card id" });

    const card = await Card.findById(id).populate("deck", "user _id");
    if (!card) return res.status(404).json({ error: "Card not found" });

    if (String((card.deck as any).user) !== String(getUserId(req)))
      return res.status(403).json({ error: "Not your card" });

    await Card.findByIdAndDelete(id);
    return res.json({ message: "Card deleted" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
