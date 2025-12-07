import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { overview } from "../controllers/statsController";

const router = Router();
router.get("/overview", verifyToken, overview);
export default router;



