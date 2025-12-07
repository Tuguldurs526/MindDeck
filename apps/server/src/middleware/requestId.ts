import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.header("x-request-id") || randomUUID();
  (req as any).id = id;
  (res as any).locals = (res as any).locals || {};
  (res as any).locals.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}



