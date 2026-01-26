import Resource from "../models/Resource.js";
import googleDriveService from "../services/googleDrive.js";
import cloudinaryService from "../services/cloudinary.js";
import path from "path";

// Helper function to determine file type
const getFileType = (mimetype, filename) => {
  const ext = path.extname(filename).toLowerCase();

  if (mimetype === "application/pdf" || ext === ".pdf") return "pdf";
  if (mimetype.includes("powerpoint") || ext === ".ppt" || ext === ".pptx")
    return "ppt";
  if (mimetype.includes("word") || ext === ".doc" || ext === ".docx")
    return "doc";
  if (mimetype.startsWith("image/")) return "image";

  return null;
};

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private
export const uploadResource = async (req, res) => {
  try {
    const { title, description, subject, semester, tags } = req.body;
    const file = req.file;

    // Validation
    if (!title || !description || !subject || !semester) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Determine file type
    const fileType = getFileType(file.mimetype, file.originalname);

    if (!fileType) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    // Check file size limits
    const maxSize = fileType === "image" ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds limit. Max size: ${fileType === "image" ? "5MB" : "20MB"}`,
      });
    }

    let uploadResult;
    let driveFileId = null;

    // Upload to appropriate service
    if (fileType === "image") {
      // Upload to Cloudinary
      uploadResult = await cloudinaryService.uploadImage(
        file.buffer,
        file.originalname,
      );
    } else {
      // Upload to Google Drive
      uploadResult = await googleDriveService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
      driveFileId = uploadResult.fileId;
    }

    // Parse tags
    const tagsArray =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags || [];

    // Create resource in database
    const resource = await Resource.create({
      title,
      description,
      subject,
      semester,
      tags: tagsArray,
      fileType,
      fileUrl: uploadResult.fileUrl,
      driveFileId,
      fileName: file.originalname,
      fileSize: file.size,
      uploadedBy: req.user._id,
    });

    // Populate uploader info
    await resource.populate("uploadedBy", "name email");

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during file upload",
    });
  }
};

// @desc    Get all resources with filters
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
  try {
    const {
      subject,
      semester,
      keyword,
      tags,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    let query = {};

    if (subject) {
      query.subject = { $regex: subject, $options: "i" };
    }

    if (semester) {
      query.semester = { $regex: semester, $options: "i" };
    }

    if (tags) {
      const tagsArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagsArray };
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { subject: { $regex: keyword, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Resource.countDocuments(query);

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: resources,
    });
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching resources",
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "name email role",
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get user's uploaded resources
// @route   GET /api/resources/my/uploads
// @access  Private
export const getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user._id })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Owner or Admin)
export const deleteResource = async (req, res) => {
  try {
    const resource = req.resource; // Set by authorizeResourceAccess middleware

    // Delete from storage
    if (resource.fileType === "image") {
      // Extract public_id from Cloudinary URL
      const urlParts = resource.fileUrl.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = `edulattice/${publicIdWithExt.split(".")[0]}`;
      await cloudinaryService.deleteImage(publicId);
    } else if (resource.driveFileId) {
      await googleDriveService.deleteFile(resource.driveFileId);
    }

    // Delete from database
    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting resource",
    });
  }
};

// @desc    Get resource statistics
// @route   GET /api/resources/stats/overview
// @access  Private/Admin
export const getResourceStats = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const totalPDFs = await Resource.countDocuments({ fileType: "pdf" });
    const totalPPTs = await Resource.countDocuments({ fileType: "ppt" });
    const totalDocs = await Resource.countDocuments({ fileType: "doc" });
    const totalImages = await Resource.countDocuments({ fileType: "image" });

    const resourcesBySubject = await Resource.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const resourcesBySemester = await Resource.aggregate([
      {
        $group: {
          _id: "$semester",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalResources,
        byType: {
          pdf: totalPDFs,
          ppt: totalPPTs,
          doc: totalDocs,
          image: totalImages,
        },
        bySubject: resourcesBySubject,
        bySemester: resourcesBySemester,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
