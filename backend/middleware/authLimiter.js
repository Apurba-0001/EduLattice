import rateLimit from "express-rate-limit";

const authWindowMs =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const authMaxAttempts = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS, 10) || 10;

export const loginLimiter = rateLimit({
  windowMs: authWindowMs,
  max: process.env.NODE_ENV === "production" ? authMaxAttempts : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: `Too many authentication attempts. Please try again after ${Math.max(1, Math.round(authWindowMs / 60000))} minutes.`,
  },
});

export const generalAuthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
