import type { Request, Response } from "express";

export type PageQuery = { limit: number; cursor?: string };
export function parsePage(req: Request): PageQuery {
  const limitRaw = Number(req.query.limit ?? 20);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 100)
    : 20;
  const cursor =
    typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  return { limit, cursor };
}

export function withPageHeaders(res: Response, nextCursor?: string) {
  if (nextCursor) res.setHeader("x-next-cursor", nextCursor);
}



