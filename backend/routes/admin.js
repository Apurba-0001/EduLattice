import express from "express";
import AdminAuditLog from "../models/AdminAuditLog.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/audit-log", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const skip = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    AdminAuditLog.countDocuments(),
    AdminAuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return res.status(200).json({
    data: logs,
    page,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export default router;
