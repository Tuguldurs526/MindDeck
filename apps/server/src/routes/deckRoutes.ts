import { Router } from "express";
import { z } from "zod";
import {
  createDeck,
  deleteDeck,
  getDeck,
  listDecks,
} from "../controllers/deckController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createDeckSchema = z.object({
  body: z.object({ title: z.string().trim().min(1) }),
});
const idParamSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
});

router.post("/", verifyToken, validate(createDeckSchema), createDeck);
router.get("/", verifyToken, listDecks);
router.get("/:id", verifyToken, validate(idParamSchema), getDeck);
router.delete("/:id", verifyToken, validate(idParamSchema), deleteDeck);

export default router;
