import { Router } from "express";
import { overview } from "../controllers/statsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/overview", verifyToken, overview);
export default router;
