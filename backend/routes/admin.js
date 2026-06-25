import express from "express";
import AdminAuditLog from "../models/AdminAuditLog.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { validateIdParam } from "../middleware/validate.js";

const router = express.Router();

router.use(protect, adminOnly);

router.patch(
  "/users/:userId/role",
  validateIdParam("userId"),
  async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body || {};
    const allowedRoles = ["STUDENT", "EDUCATOR", "ADMIN"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (String(req.user._id) === String(userId)) {
      return res
        .status(400)
        .json({ error: "Admins cannot change their own role" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const oldRole =
      targetUser.role || (targetUser.isAdmin ? "ADMIN" : "STUDENT");
    if (oldRole === role) {
      return res
        .status(400)
        .json({ error: "Role is already set to the requested value" });
    }

    targetUser.role = role;
    targetUser.isAdmin = role === "ADMIN";
    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    await targetUser.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      action: "ROLE_CHANGE",
      targetUserId: targetUser._id,
      oldRole,
      newRole: role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({ data: targetUser.toObject() });
  },
);

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
