import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "../db/mongo";
import { UnauthorizedError } from "../lib/errors";
import { issueTokens } from "../middlewares/auth";
import { ObjectId } from "mongodb";

export type LoginInput = { email: string; password: string };
export type SignupInput = { email: string; password: string };

export class AuthService {
  static async login({ email, password }: LoginInput) {
    const user = await db.collection("users").findOne({ email });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    return issueTokens(user._id.toString());
  }

  static async signup({ email, password }: SignupInput) {
    const existing = await db.collection("users").findOne({ email });
    if (existing) throw new UnauthorizedError("Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    const { insertedId } = await db.collection("users").insertOne({
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    return issueTokens(insertedId.toString());
  }

  static async logout(refreshToken: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await db
      .collection("refreshTokens")
      .updateMany({ tokenHash }, { $set: { revokedAt: new Date() } });
  }

  static async refresh(refreshToken: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const stored = await db.collection("refreshTokens").findOne({ tokenHash });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid credentials");
    }

    await db
      .collection("refreshTokens")
      .updateOne({ _id: stored._id }, { $set: { revokedAt: new Date() } });

    return issueTokens(stored.userId);
  }

  static async me(userId: string) {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) throw new UnauthorizedError("User not found");
    return user;
  }
}
