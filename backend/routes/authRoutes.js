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
import { generalAuthLimiter, loginLimiter } from "../middleware/authLimiter.js";
import validateObjectId from "../middleware/validateId.js";

const router = express.Router();

router.post("/register", generalAuthLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, validateObjectId, deleteUser);

export default router;
