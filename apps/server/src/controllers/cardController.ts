import { Request, Response } from "express";
import Card from "../models/Card.js";

export async function createCard(req: Request, res: Response) {
  try {
    const { front, back, deckId } = req.body;
    if (!front || !back || !deckId) return res.status(400).json({ error: "Missing fields" });
    const card = await Card.create({ front, back, deck: deckId });
    res.status(201).json(card);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function getCardsByDeck(req: Request, res: Response) {
  try {
    const { deckId } = req.params;
    const cards = await Card.find({ deck: deckId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await Card.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Card not found" });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function deleteCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await Card.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Card not found" });
    res.json({ message: "Card deleted" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}