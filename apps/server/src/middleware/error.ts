import type { NextFunction, Request, Response } from "express";

export type ApiErrorBody = {
  error: { code: string; message: string; details?: any; requestId?: string };
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: any;
  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(_req: Request, res: Response<ApiErrorBody>) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Not found",
      requestId: (res as any).locals?.requestId,
    },
  });
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction
) {
  const status = err?.status ?? (err?.name === "ZodError" ? 400 : 500);
  const code =
    err?.code ??
    (status === 400
      ? "BAD_REQUEST"
      : status === 401
      ? "UNAUTHORIZED"
      : status === 403
      ? "FORBIDDEN"
      : status === 404
      ? "NOT_FOUND"
      : "INTERNAL");
  const message = err?.message ?? "Internal Server Error";
  const details = err?.issues ?? err?.details;

  res.status(status).json({
    error: {
      code,
      message,
      details,
      requestId: (res as any).locals?.requestId,
    },
  });
}



