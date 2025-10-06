import type { AnyZodObject } from "zod";
import { ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) => (req: any, res: any, next: any) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({ error: e.flatten() });
      }
      return res.status(400).json({ error: "Invalid request" });
    }
  };
