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

// Common validators
const oid = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

// Schemas
const createCardSchema = z.object({
  body: z
    .object({
      front: z.string().trim().min(1),
      back: z.string().trim().min(1),
      deckId: oid,
    })
    .strict(),
});

const getByDeckSchema = z.object({
  params: z.object({ deckId: oid }).strict(),
  query: paginationQuery.partial(),
});

// Build update body separately so .strict() is called on the object, then refine.
const updateCardBody = z
  .object({
    front: z.string().trim().min(1).optional(),
    back: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Nothing to update",
  });

const updateCardSchema = z.object({
  params: z.object({ id: oid }).strict(),
  body: updateCardBody,
});

const deleteCardSchema = z.object({
  params: z.object({ id: oid }).strict(),
});

// Routes
router.post("/", verifyToken, validate(createCardSchema), createCard);
router.get("/:deckId", verifyToken, validate(getByDeckSchema), getCardsByDeck);
router.put("/:id", verifyToken, validate(updateCardSchema), updateCard);
router.delete("/:id", verifyToken, validate(deleteCardSchema), deleteCard);

export default router;
