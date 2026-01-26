import express from "express";
import {
  register,
  login,
  getMe,
  getAllUsers,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, adminOnly, getAllUsers);

export default router;
