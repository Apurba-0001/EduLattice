import Resource from "../models/Resource.js";
import googleDriveService from "../services/googleDrive.js";
import cloudinaryService from "../services/cloudinary.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
    const { title, description, subject, semester, resourceType } = req.body;
    const file = req.file;

    // Validation
    if (!title || !description || !subject || !semester || !resourceType) {
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

    // Extract file extension from original file
    const fileExtension = path.extname(file.originalname);

    // Generate unique UUID for this file
    const fileId = uuidv4();

    // Create storage fileName: "Title_UUID.ext"
    // Format: title_[uuid].[extension] to ensure uniqueness
    const storageFileName = `${title}_${fileId.substring(0, 8)}${fileExtension}`;

    // Display fileName: "Title.ext" for user-friendly downloads
    const displayFileName = title + fileExtension;

    // Upload to appropriate service with unique storage name
    if (fileType === "image") {
      // Upload to Cloudinary
      uploadResult = await cloudinaryService.uploadImage(
        file.buffer,
        storageFileName,
      );
    } else {
      // Upload to Google Drive
      uploadResult = await googleDriveService.uploadFile(
        file.buffer,
        storageFileName,
        file.mimetype,
      );
      driveFileId = uploadResult.fileId;
    }

    // Create resource in database
    const resource = await Resource.create({
      fileId,
      title,
      description,
      subject,
      semester,
      resourceType,
      fileType,
      fileUrl: uploadResult.fileUrl,
      driveFileId,
      fileName: displayFileName,
      storageFileName: storageFileName,
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
      resourceType,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {};

    if (subject) {
      query.subject = { $regex: subject, $options: "i" };
    }

    if (semester) {
      query.semester = { $regex: semester, $options: "i" };
    }

    if (resourceType) {
      query.resourceType = resourceType;
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

    // Build sort object
    const sortObj = {};
    const sortField =
      sortBy === "createdAt"
        ? "createdAt"
        : sortBy === "title"
          ? "title"
          : "views";
    const sortVal = sortOrder === "asc" ? 1 : -1;
    sortObj[sortField] = sortVal;

    // Execute query
    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email")
      .sort(sortObj)
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
      "name email isAdmin",
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
// @access  Private (Owner or Admin only)
export const deleteResource = async (req, res) => {
  try {
    const resource = req.resource; // Set by authorizeResourceAccess middleware
    const userId = req.user._id.toString();
    const uploadedBy = resource.uploadedBy._id.toString();
    const isAdmin = req.user.isAdmin === true;

    // Log deletion attempt
    console.log(`Delete attempt:
      User ID: ${userId}
      Uploaded By: ${uploadedBy}
      Is Admin: ${isAdmin}
      File: ${resource.fileName}
      FileId: ${resource.fileId}`);

    // Authorization check (redundant but explicit)
    if (!isAdmin && userId !== uploadedBy) {
      console.log(`❌ Unauthorized deletion attempt by user ${userId}`);
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this resource. Only the uploader or admin can delete files.",
      });
    }

    // Delete from storage
    if (resource.fileType === "image") {
      // Extract public_id from Cloudinary URL
      const urlParts = resource.fileUrl.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = `edulattice/${publicIdWithExt.split(".")[0]}`;
      await cloudinaryService.deleteImage(publicId);
      console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
    } else if (resource.driveFileId) {
      await googleDriveService.deleteFile(resource.driveFileId);
      console.log(
        `✅ Deleted document from Google Drive: ${resource.driveFileId}`,
      );
    }

    // Delete from database
    await Resource.findByIdAndDelete(req.params.id);
    console.log(`✅ Deleted resource from database: ${resource.fileId}`);

    // Log who deleted it
    const deletedBy = isAdmin && userId !== uploadedBy ? "Admin" : "Owner";
    console.log(`✅ Resource deleted successfully by ${deletedBy}`);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
      data: {
        deletedFileId: resource.fileId,
        fileName: resource.fileName,
        deletedBy: deletedBy,
      },
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
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
