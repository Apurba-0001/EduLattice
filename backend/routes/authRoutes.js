import express from "express";
import {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
