import { z } from "zod";

const email = z.email("Invalid email");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email,
  password,
});

export type LoginBody = z.infer<typeof loginSchema>;
export type SignupBody = z.infer<typeof signupSchema>;
