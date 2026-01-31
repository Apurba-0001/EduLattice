import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

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
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

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

    const userId = req.user._id.toString();
    const uploadedById = resource.uploadedBy.toString();
    const isAdmin = req.user.isAdmin === true;

    // Allow if user is admin or the uploader
    if (isAdmin || uploadedById === userId) {
      console.log(`✅ Authorization granted:
        User: ${userId}
        Uploader: ${uploadedById}
        Is Admin: ${isAdmin}
        Resource: ${resource.fileId}`);
      req.resource = resource;
      next();
    } else {
      console.log(`❌ Authorization denied:
        User: ${userId}
        Uploader: ${uploadedById}
        Is Admin: ${isAdmin}
        Resource: ${resource.fileId}`);
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
