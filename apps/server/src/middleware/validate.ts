// src/middleware/validate.ts
import type { RequestHandler } from "express";
import type { AnyZodObject, ZodTypeAny } from "zod";

type Schema = AnyZodObject | ZodTypeAny;

export const validate = (schema: Schema): RequestHandler => {
  return (req, res, next) => {
    try {
      if (req.method === "GET" || req.method === "DELETE") {
        // Always validate params + query together
        schema.parse({ ...req.params, ...req.query });
      } else {
        // POST / PUT / PATCH => validate body
        schema.parse(req.body);
      }
      next();
    } catch (err) {
      return res.status(400).json({ error: "Validation error", details: String(err) });
    }
  };
};
