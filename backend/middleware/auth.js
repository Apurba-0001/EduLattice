import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Session timeout configurable via SESSION_TIMEOUT_MINUTES env var (default: 20 min)
const SESSION_TIMEOUT_MINUTES =
  parseInt(process.env.SESSION_TIMEOUT_MINUTES, 10) || 20;
const SESSION_TIMEOUT = SESSION_TIMEOUT_MINUTES * 60 * 1000;

export const protect = async (req, res, next) => {
  try {
    let token;
    // Only check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. Please login.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check for session timeout due to inactivity (20 minutes)
      if (decoded.lastActivity) {
        const now = Date.now();
        const lastActivity = decoded.lastActivity;
        const inactivityDuration = now - lastActivity;

        // If inactive for more than 20 minutes, logout user
        if (inactivityDuration > SESSION_TIMEOUT) {
          return res.status(401).json({
            success: false,
            message: "Session expired due to inactivity. Please login again.",
          });
        }
      }

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Update last activity in database (non-blocking)
      req.user.lastActivity = new Date();
      req.user.save().catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Error updating lastActivity:", err.message);
        }
      });

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

export const authorizeResourceAccess = async (req, res, next) => {
  try {
    const Resource = (await import("../models/Resource.js")).default;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const isAdmin = req.user.isAdmin === true;
    const userId = req.user._id.toString();
    const uploadedById = resource.uploadedBy
      ? resource.uploadedBy.toString()
      : null;

    // Handle orphaned resources where uploader reference is missing
    if (!uploadedById) {
      if (isAdmin) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({
        success: false,
        message:
          "Resource owner information is missing. Please contact an admin.",
      });
    }

    // Allow if user is admin or the uploader
    if (isAdmin || uploadedById === userId) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `✅ Authorization granted: IsAdmin=${isAdmin} Action=${req.method}`,
        );
      }
      req.resource = resource;
      return next();
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log(`❌ Authorization denied: Action=${req.method}`);
      }
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to perform this action. Only the file uploader or an admin can modify this resource.",
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Authorization error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Server error during authorization check",
    });
  }
};
