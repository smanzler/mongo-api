import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { InternalServerError, UnauthorizedError } from "../lib/errors";
import { AUTH_REFRESH_TOKEN_COOKIE_NAME } from "../lib/cookies";
import { prisma } from "../db/prisma";
import crypto from "crypto";
import type { Request } from "../lib/types";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const accessToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;

  if (!accessToken) {
    next(new UnauthorizedError("Missing or invalid token"));
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    next(new UnauthorizedError("Server configuration error"));
    return;
  }

  try {
    const payload = jwt.verify(accessToken, secret) as { sub?: string };

    if (!payload.sub) {
      next(new UnauthorizedError("Invalid token"));
      return;
    }

    req.userId = payload.sub;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function requireRefreshToken(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const refreshToken = req.cookies?.[AUTH_REFRESH_TOKEN_COOKIE_NAME];
  if (!refreshToken) {
    next(new UnauthorizedError("Missing or invalid refresh token"));
    return;
  }
  req.refreshToken = refreshToken;
  next();
}

export async function issueTokens(userId: string) {
  if (!process.env.JWT_SECRET)
    throw new InternalServerError("Server configuration error");

  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = crypto.randomBytes(64).toString("hex");
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return { accessToken, refreshToken };
}
