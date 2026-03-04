import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getMe,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import validateObjectId from "../middleware/validateId.js";

const router = express.Router();

// Rate limiting for auth endpoints - prevent brute force attacks
// Configurable via RATE_LIMIT_MAX_ATTEMPTS and RATE_LIMIT_WINDOW_MS env vars
const rateLimitWindowMs =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS, 10) || 10;
const windowMinutes = Math.round(rateLimitWindowMs / 60000);

const authLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: process.env.NODE_ENV === "production" ? rateLimitMax : 100, // Relaxed in dev
  message: {
    success: false,
    message: `Too many authentication attempts. Please try again after ${windowMinutes} minutes.`,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, validateObjectId, deleteUser);

export default router;
