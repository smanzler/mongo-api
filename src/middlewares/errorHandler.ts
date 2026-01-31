import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { HttpError } from "../lib/errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const { formErrors, fieldErrors } = z.flattenError(err);
    res.status(400).json({
      error: "Validation failed",
      details: { formErrors, fieldErrors },
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
