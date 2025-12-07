import { Router } from "express";
import { z } from "zod";
import { createDeck, deleteDeck, getDeck, listDecks } from "../controllers/deckController.js";
import { verifyToken } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";

// schemas local to route to avoid “undefined” import headaches
const createDeckSchema = z.object({
  title: z.string().min(1),
});
const idParamSchema = z.object({
  id: z.string().min(1),
});

const router = Router();

router.post("/", verifyToken, validate(createDeckSchema), createDeck);
router.get("/", verifyToken, listDecks);
router.get("/:id", verifyToken, validate(idParamSchema), getDeck);
router.delete("/:id", verifyToken, validate(idParamSchema), deleteDeck);

export default router;
