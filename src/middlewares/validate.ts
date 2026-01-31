import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
      next();
    } else {
      next(result.error);
    }
  };
}
