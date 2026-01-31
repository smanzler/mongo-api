import { Router } from "express";
import {
  login,
  signup,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { loginSchema, signupSchema } from "../validations/auth.schemas";
import { requireAuth, requireRefreshToken } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";

const router = Router();

router.post("/login", validateBody(loginSchema), asyncHandler(login));
router.post("/signup", validateBody(signupSchema), asyncHandler(signup));
router.post("/refresh", requireRefreshToken, asyncHandler(refresh));
router.post("/logout", requireRefreshToken, asyncHandler(logout));

router.get("/me", requireAuth, asyncHandler(me));

export default router;
