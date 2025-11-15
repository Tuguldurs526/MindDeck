import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { overview } from "../controllers/statsController.js";

const router = Router();
router.get("/overview", verifyToken, overview);
export default router;
