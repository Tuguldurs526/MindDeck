import { Router } from "express";
import { z } from "zod";
import {
  createCard,
  deleteCard,
  getCardsByDeck,
  updateCard,
} from "../controllers/cardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createCardSchema = z.object({
  body: z.object({
    front: z.string().min(1),
    back: z.string().min(1),
    deckId: z.string().min(1),
  }),
});

router.post("/", verifyToken, validate(createCardSchema), createCard);
router.get("/:deckId", verifyToken, getCardsByDeck);
router.put("/:id", verifyToken, updateCard);
router.delete("/:id", verifyToken, deleteCard);

export default router;
