import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Session timeout: 20 minutes of inactivity (in milliseconds)
const SESSION_TIMEOUT = 20 * 60 * 1000;

// Helper to generate token with current activity timestamp
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId, lastActivity: Date.now() },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
};

// Helper to set auth cookie
// Removed cookie logic. Middleware will only use Authorization header.

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
        console.error("Error updating lastActivity:", err);
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
    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "_id name email isAdmin",
    );

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

    const userId = req.user._id.toString();
    // Handle both populated and non-populated uploadedBy
    const uploadedById = resource.uploadedBy._id
      ? resource.uploadedBy._id.toString()
      : resource.uploadedBy.toString();
    const isAdmin = req.user.isAdmin === true;

    // Allow if user is admin or the uploader
    if (isAdmin || uploadedById === userId) {
      console.log(`✅ Authorization granted:
        User: ${userId}
        Uploader: ${uploadedById}
        Is Admin: ${isAdmin}
        Resource: ${resource.fileId}
        Action: ${req.method}`);
      req.resource = resource;
      next();
    } else {
      console.log(`❌ Authorization denied:
        User: ${userId}
        Uploader: ${uploadedById}
        Is Admin: ${isAdmin}
        Resource: ${resource.fileId}
        Action: ${req.method}`);
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to perform this action. Only the file uploader or an admin can modify this resource.",
      });
    }
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authorization check",
    });
  }
};
