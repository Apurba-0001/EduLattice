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
  trackView,
} from "../controllers/resourceController.js";
import {
  protect,
  adminOnly,
  authorizeResourceAccess,
} from "../middleware/auth.js";
import validateObjectId from "../middleware/validateId.js";
import upload from "../middleware/upload.js";
import {
  validateTitle,
  validateDescription,
  validateSubject,
  validateObjectId as validateObjId,
  handleValidationErrors,
} from "../middleware/validation.js";
import { csrfProtection } from "../middleware/csrf.js";

const router = express.Router();

// Protected routes
router.post(
  "/",
  protect,
  csrfProtection,
  validateTitle,
  validateDescription,
  validateSubject,
  handleValidationErrors,
  upload.array("file", 5),
  uploadResource,
);
router.get("/", protect, getResources);
router.get("/my/uploads", protect, getMyUploads);
router.post("/:id/view", protect, validateObjectId, trackView);
router.get(
  "/:id/download-group",
  protect,
  validateObjectId,
  downloadGroupedResources,
);
router.get("/:id/download", protect, validateObjectId, downloadResource);
router.get("/stats/overview", protect, adminOnly, getResourceStats);
router.get("/:id", protect, validateObjectId, getResource);
router.put(
  "/:id",
  protect,
  validateObjectId,
  validateTitle,
  validateDescription,
  validateSubject,
  handleValidationErrors,
  authorizeResourceAccess,
  updateResource,
);
router.delete(
  "/:id",
  protect,
  validateObjectId,
  authorizeResourceAccess,
  deleteResource,
);

export default router;
