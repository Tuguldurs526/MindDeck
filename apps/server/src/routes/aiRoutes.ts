import { Router } from "express";
import { postExplain, postHint } from "../controllers/aiController.js";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();
router.post("/explain", verifyToken, postExplain);
router.post("/hint", verifyToken, postHint);

export default router;
