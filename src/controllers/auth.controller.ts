import { Response } from "express";
import { prisma } from "../db/prisma";
import type { LoginBody, SignupBody } from "../validations/auth.schemas";
import { AuthService } from "../services/auth.services";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../lib/cookies";
import type { Request } from "../lib/types";

export async function login(req: Request<LoginBody>, res: Response) {
  const tokens = await AuthService.login(req.body);
  setRefreshTokenCookie(res, tokens.refreshToken);

  res.json({ accessToken: tokens.accessToken });
}

export async function signup(req: Request<SignupBody>, res: Response) {
  const tokens = await AuthService.signup(req.body);
  setRefreshTokenCookie(res, tokens.refreshToken);
  res.status(201).json({ accessToken: tokens.accessToken });
}

export async function refresh(req: Request, res: Response) {
  const tokens = await AuthService.refresh(req.refreshToken!);
  setRefreshTokenCookie(res, tokens.refreshToken);
  res.json({ accessToken: tokens.accessToken });
}

export async function logout(req: Request, res: Response) {
  await AuthService.logout(req.refreshToken!);
  clearRefreshTokenCookie(res);
  res.json({ message: "Logged out successfully" });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(user);
}
