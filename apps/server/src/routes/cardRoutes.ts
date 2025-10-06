import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createCard, getCardsByDeck, updateCard, deleteCard } from "../controllers/cardController.js";

const router = Router();
router.post("/", verifyToken, createCard);
router.get("/:deckId", verifyToken, getCardsByDeck);
router.put("/:id", verifyToken, updateCard);
router.delete("/:id", verifyToken, deleteCard);
export default router;