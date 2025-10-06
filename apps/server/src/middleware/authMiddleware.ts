// apps/server/src/middleware/authMiddleware.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    // attach minimal identity to req
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
