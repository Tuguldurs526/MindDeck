// apps/server/src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { assertJwtEnv } from "../utils/jwt.js";

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    assertJwtEnv();

    const auth = req.header("authorization") || req.header("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = auth.slice("Bearer ".length).trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // 🔴 IMPORTANT: attach userId here
    req.userId = decoded.sub;
    req.userEmail = decoded.email;

    return next();
  } catch (e: any) {
    console.warn("DEBUG verifyToken error:", e);
    return res.status(401).json({ error: "Invalid auth token" });
  }
}
