import { Router } from "express";
import {
  createDeck,
  deleteDeck,
  getDeck,
  listDecks,
} from "../controllers/deckController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", verifyToken, createDeck);
router.get("/", verifyToken, listDecks);
router.get("/:id", verifyToken, getDeck);
router.delete("/:id", verifyToken, deleteDeck);

export default router;
