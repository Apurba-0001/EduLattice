import express from "express";
import {
  uploadResource,
  getResources,
  getResource,
  getMyUploads,
  deleteResource,
  getResourceStats,
} from "../controllers/resourceController.js";
import {
  protect,
  adminOnly,
  authorizeResourceAccess,
} from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Protected routes
router.post("/", protect, upload.single("file"), uploadResource);
router.get("/", protect, getResources);
router.get("/my/uploads", protect, getMyUploads);
router.get("/stats/overview", protect, adminOnly, getResourceStats);
router.get("/:id", protect, getResource);
router.delete("/:id", protect, authorizeResourceAccess, deleteResource);

export default router;
