import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import crypto from "crypto";
import { UnauthorizedError, InternalServerError } from "../lib/errors";
import { issueTokens } from "../middlewares/auth";

export type LoginInput = { email: string; password: string };
export type SignupInput = { email: string; password: string };

export class AuthService {
  static async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    return issueTokens(user.id);
  }

  static async signup({ email, password }: SignupInput) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new UnauthorizedError("Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    return issueTokens(user.id);
  }

  static async logout(refreshToken: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  static async refresh(refreshToken: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return issueTokens(stored.userId);
  }
}
