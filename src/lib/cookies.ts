import type { Response } from "express";

export const AUTH_REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30d

const isProduction = process.env.NODE_ENV === "production";

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(AUTH_REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: REFRESH_MAX_AGE_MS,
    path: "/",
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(AUTH_REFRESH_TOKEN_COOKIE_NAME, { path: "/" });
}
