import express from "express";
import {
  uploadResource,
  getResources,
  getResource,
  getMyUploads,
  updateResource,
  deleteResource,
  getResourceStats,
  downloadResource,
  downloadGroupedResources,
} from "../controllers/resourceController.js";
import {
  protect,
  adminOnly,
  authorizeResourceAccess,
} from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Protected routes
router.post("/", protect, upload.array("file", 5), uploadResource);
router.get("/", protect, getResources);
router.get("/my/uploads", protect, getMyUploads);
router.get("/:id/download-group", protect, downloadGroupedResources);
router.get("/:id/download", protect, downloadResource);
router.get("/stats/overview", protect, adminOnly, getResourceStats);
router.get("/:id", protect, getResource);
router.put("/:id", protect, authorizeResourceAccess, updateResource);
router.delete("/:id", protect, authorizeResourceAccess, deleteResource);

export default router;
