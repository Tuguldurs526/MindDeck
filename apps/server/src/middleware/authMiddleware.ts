import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const h = req.header("authorization") || "";
  const [, token] = h.split(" ");
  if (!token) return res.status(401).json({ error: "Missing bearer token" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "JWT secret not set" });

  try {
    const payload = jwt.verify(token, secret) as any;
    (req as any).user = { sub: payload.sub || payload.id || payload._id };
    if (!(req as any).user?.sub)
      return res.status(401).json({ error: "Invalid token" });
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}



