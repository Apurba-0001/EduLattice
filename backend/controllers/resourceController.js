import Resource from "../models/Resource.js";
import googleDriveService from "../services/googleDrive.js";
import cloudinaryService from "../services/cloudinary.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import https from "https";
import archiver from "archiver";

// List of dangerous file extensions and MIME types to block
const DANGEROUS_EXTENSIONS = [
  // Windows executables
  ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".pif", ".vbs", ".vbe",
  // Linux/Unix executables
  ".sh", ".bash", ".ksh", ".csh", ".run", ".elf",
  // Mac executables
  ".app", ".dmg", ".pkg",
  // Java
  ".jar", ".jnlp", ".class",
  // Archives (can contain executables)
  ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".iso", ".cab", ".arj", ".ace",
  // Libraries (can be dangerous)
  ".dll", ".so", ".dylib", ".o", ".a", ".lib", ".exe.manifest",
  // Scripts (can be dangerous)
  ".js", ".vbs", ".ps1", ".psm1", ".psd1", ".wsh", ".js.txt",
  // System files
  ".sys", ".drv", ".ko", ".dbg",
  // Office macros
  ".docm", ".xlsm", ".pptm",
];

const DANGEROUS_MIME_TYPES = [
  "application/x-executable",
  "application/x-elf",
  "application/x-mach-binary",
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-msi",
  "application/x-sh",
  "application/x-shellscript",
  "application/x-bash",
  "application/x-javascript",
  "text/x-shellscript",
  "text/x-python",
  "text/x-perl",
  "text/x-ruby",
];

// Helper function to check if file is dangerous
const isDangerousFile = (mimetype, filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  // Check against blocked extensions
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return true;
  }
  
  // Check against blocked MIME types
  if (DANGEROUS_MIME_TYPES.includes(mimetype)) {
    return true;
  }
  
  // Check for double extensions (e.g., image.jpg.exe)
  if (filename.lastIndexOf(".") !== filename.indexOf(".")) {
    const doubleExt = filename.substring(filename.lastIndexOf(".") - 4);
    if (DANGEROUS_EXTENSIONS.some(dangerous => doubleExt.includes(dangerous))) {
      return true;
    }
  }
  
  return false;
};

// Helper function to determine file type
const getFileType = (mimetype, filename) => {
  const ext = path.extname(filename).toLowerCase();

  // PDF
  if (mimetype === "application/pdf" || ext === ".pdf") return "pdf";
  
  // PowerPoint (MS Office & OpenDocument)
  if (mimetype.includes("powerpoint") || ext === ".ppt" || ext === ".pptx" ||
      ext === ".odp" || mimetype.includes("presentation"))
    return "ppt";
  
  // Word (MS Office & OpenDocument)
  if (mimetype.includes("word") || ext === ".doc" || ext === ".docx" ||
      ext === ".odt" || ext === ".txt" || ext === ".rtf" ||
      mimetype === "text/plain" || mimetype === "application/rtf")
    return "doc";
  
  // Excel (MS Office, OpenDocument & Apple)
  if (
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel") ||
    ext === ".xls" ||
    ext === ".xlsx" ||
    ext === ".ods" ||
    ext === ".csv" ||
    mimetype === "text/csv"
  )
    return "excel";
  
  // Apple formats
  if (ext === ".pages" || mimetype === "application/vnd.apple.pages") return "doc";
  if (ext === ".numbers" || mimetype === "application/vnd.apple.numbers") return "excel";
  if (ext === ".keynote" || mimetype === "application/vnd.apple.keynote") return "ppt";
  
  // Images
  if (mimetype.startsWith("image/")) return "image";

  return null;
};

// @desc    Upload a new resource or multiple resources (images only)
// @route   POST /api/resources
// @access  Private
// @logic   Images: max 5 per upload, grouped with imageGroupId
//          Documents: max 1 per upload, independent
//          Mixing images and documents in single upload is not allowed
export const uploadResource = async (req, res) => {
  try {
    const { title, description, subject, semester, resourceType } = req.body;
    const files = req.files;

    // Validation
    if (!title || !description || !subject || !semester || !resourceType) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one file",
      });
    }

    // SECURITY: Check for dangerous file types
    for (let file of files) {
      if (isDangerousFile(file.mimetype, file.originalname)) {
        console.log(`🚨 SECURITY ALERT: Blocked dangerous file upload: ${file.originalname}`);
        return res.status(400).json({
          success: false,
          message: `Security alert: File type not allowed. "${file.originalname}" contains executable or dangerous content.`,
        });
      }
    }

    // Validate file types and count
    const fileTypes = files.map((file) =>
      getFileType(file.mimetype, file.originalname)
    );

    // Check all file types are valid
    if (fileTypes.some((type) => !type)) {
      return res.status(400).json({
        success: false,
        message: "One or more files have invalid file type",
      });
    }

    // Check if mixing images and documents
    const hasImages = fileTypes.includes("image");
    const hasDocuments = fileTypes.some(
      (type) => type !== "image" && type !== null
    );

    if (hasImages && hasDocuments) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot upload images and documents together. Please upload them separately.",
      });
    }

    // Validate count: images max 5, documents max 1
    if (hasImages && files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images can be uploaded at once",
      });
    }

    if (!hasImages && files.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Only 1 document can be uploaded at a time",
      });
    }

    // Validate file sizes (individual and collective)
    let totalSize = 0;
    const maxIndividualImageSize = 10 * 1024 * 1024; // 10MB per image
    const maxTotalImageSize = 5 * 10 * 1024 * 1024; // 50MB total for 5 images
    const maxDocumentSize = 25 * 1024 * 1024; // 25MB per document

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = fileTypes[i];
      totalSize += file.size;

      // Check individual file size
      if (fileType === "image" && file.size > maxIndividualImageSize) {
        return res.status(400).json({
          success: false,
          message: `Image "${file.originalname}" exceeds size limit. Max per image: 10MB`,
        });
      } else if (fileType !== "image" && file.size > maxDocumentSize) {
        return res.status(400).json({
          success: false,
          message: `Document "${file.originalname}" exceeds size limit. Max per document: 25MB`,
        });
      }
    }

    // Check collective size limit
    if (hasImages && totalSize > maxTotalImageSize) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `Total size of all images (${totalMB}MB) exceeds limit. Max: 50MB for 5 images`,
      });
    }

    if (!hasImages && totalSize > maxDocumentSize) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `Document size (${totalMB}MB) exceeds limit. Max: 25MB`,
      });
    }

    // Generate imageGroupId for grouped image uploads
    const imageGroupId = hasImages ? uuidv4() : null;

    // Upload and create resources for each file
    const createdResources = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = fileTypes[i];

      // Extract file extension
      const fileExtension = path.extname(file.originalname);

      // Generate unique UUID for this file
      const fileId = uuidv4();

      // Create storage fileName: "Title_UUID.ext"
      const storageFileName = `${title}_${fileId.substring(0, 8)}${fileExtension}`;

      // Display fileName: "Title.ext" for user-friendly downloads
      // For multiple images, add sequence number: "Title (1).ext", "Title (2).ext", etc.
      const displayFileName =
        files.length > 1
          ? `${title} (${i + 1})${fileExtension}`
          : title + fileExtension;

      // Upload to Cloudinary
      let uploadResult;
      if (fileType === "image") {
        uploadResult = await cloudinaryService.uploadImage(
          file.buffer,
          storageFileName
        );
      } else {
        uploadResult = await cloudinaryService.uploadDocument(
          file.buffer,
          storageFileName,
          file.mimetype
        );
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
        cloudinaryPublicId: uploadResult.publicId,
        driveFileId: null,
        fileName: displayFileName,
        storageFileName: storageFileName,
        fileSize: file.size,
        uploadedBy: req.user._id,
        imageGroupId: imageGroupId,
      });

      // Populate uploader info
      await resource.populate("uploadedBy", "name email");
      createdResources.push(resource);
    }

    res.status(201).json({
      success: true,
      data: createdResources,
      message:
        createdResources.length > 1
          ? `Successfully uploaded ${createdResources.length} files`
          : "File uploaded successfully",
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
      includeArchived = false,
    } = req.query;

    // Build query
    let query = {};

    // Exclude archived resources by default
    if (includeArchived !== "true") {
      query.isArchived = { $ne: true };
    }

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
    const { includeArchived = false } = req.query;

    // Build query
    let query = { uploadedBy: req.user._id };

    // Optionally include archived resources
    if (includeArchived !== "true") {
      query.isArchived = { $ne: true };
    }

    const resources = await Resource.find(query)
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

// @desc    Update resource (metadata only)
// @route   PUT /api/resources/:id
// @access  Private (Owner or Admin only)
export const updateResource = async (req, res) => {
  try {
    const resource = req.resource; // Set by authorizeResourceAccess middleware

    // SECURITY: Double-check resource and user exist
    if (!resource || !req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const userId = req.user._id.toString();
    const uploadedBy = resource.uploadedBy._id
      ? resource.uploadedBy._id.toString()
      : resource.uploadedBy.toString();
    const isAdmin = req.user.isAdmin === true;

    // SECURITY: Explicit authorization check (defense in depth)
    if (!isAdmin && userId !== uploadedBy) {
      console.log(`❌ Unauthorized update attempt by user ${userId}`);
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this resource.",
      });
    }

    // Only allow updating specific fields (prevent tampering with fileUrl, uploadedBy, etc.)
    const allowedUpdates = ["title", "description", "subject", "semester", "resourceType"];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // If title changes, update fileName as well
    if (updates.title && updates.title !== resource.title) {
      const ext = resource.fileName.substring(resource.fileName.lastIndexOf("."));
      updates.fileName = updates.title + ext;
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email");

    console.log(`✅ Resource updated by ${isAdmin && userId !== uploadedBy ? "Admin" : "Owner"}:
      User: ${userId}
      Resource: ${resource.fileId}
      Fields: ${Object.keys(updates).join(", ")}`);

    res.status(200).json({
      success: true,
      data: updatedResource,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during update",
    });
  }
};

// @desc    Delete resource (and all grouped resources if imageGroupId exists)
// @route   DELETE /api/resources/:id
// @access  Private (Owner or Admin only)
export const deleteResource = async (req, res) => {
  try {
    const resource = req.resource; // Set by authorizeResourceAccess middleware
    
    // SECURITY: Double-check resource and user exist
    if (!resource || !req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const userId = req.user._id.toString();
    // Handle both populated and non-populated uploadedBy
    const uploadedBy = resource.uploadedBy._id
      ? resource.uploadedBy._id.toString()
      : resource.uploadedBy.toString();
    const isAdmin = req.user.isAdmin === true;

    // Log deletion attempt
    console.log(`Delete attempt:
      User ID: ${userId}
      Uploaded By: ${uploadedBy}
      Is Admin: ${isAdmin}
      File: ${resource.fileName}
      FileId: ${resource.fileId}
      ImageGroupId: ${resource.imageGroupId || "none"}`);

    // SECURITY: Explicit authorization check (defense in depth)
    if (!isAdmin && userId !== uploadedBy) {
      console.log(`❌ Unauthorized deletion attempt by user ${userId}`);
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this resource. Only the uploader or admin can delete files.",
      });
    }

    // Find all resources to delete (if imageGroupId exists, delete all grouped resources)
    let resourcesToDelete = [resource];
    
    if (resource.imageGroupId) {
      console.log(`📸 Found grouped images with imageGroupId: ${resource.imageGroupId}`);
      const groupedResources = await Resource.find({
        imageGroupId: resource.imageGroupId,
      });
      resourcesToDelete = groupedResources;
      console.log(`📸 Deleting ${resourcesToDelete.length} grouped images`);
    }

    // Delete all resources from Cloudinary and database
    const deletedFileIds = [];
    const failedDeletions = [];

    for (const res of resourcesToDelete) {
      try {
        // Delete from storage (all files now on Cloudinary)
        // First try to use stored cloudinaryPublicId, then fall back to URL extraction
        let publicId = res.cloudinaryPublicId;
        
        if (!publicId && res.fileUrl && res.fileUrl.includes('cloudinary')) {
          // Extract public_id from Cloudinary URL
          // URL format: https://res.cloudinary.com/xxx/image/upload/v123/edulattice/filename.ext
          try {
            const url = new URL(res.fileUrl);
            const pathParts = url.pathname.split("/");
            const edulatticeIndex = pathParts.indexOf("edulattice");
            if (edulatticeIndex !== -1) {
              const fileNameWithExt = pathParts[edulatticeIndex + 1];
              const fileName = fileNameWithExt.split(".")[0];
              publicId = `edulattice/${fileName}`;
            }
          } catch (e) {
            console.log(`Failed to parse URL: ${e.message}`);
          }
        }

        console.log(`Attempting to delete from Cloudinary: ${publicId}`);
        
        if (publicId) {
          try {
            await cloudinaryService.deleteImage(publicId);
            console.log(`✅ Deleted file from Cloudinary: ${publicId}`);
          } catch (cloudError) {
            console.log(`⚠️ Cloudinary deletion failed for ${publicId}: ${cloudError.message}`);
            failedDeletions.push({
              fileId: res.fileId,
              fileName: res.fileName,
              reason: cloudError.message,
            });
          }
        } else if (res.driveFileId) {
          console.log(`⚠️ Resource was stored on Google Drive (ID: ${res.driveFileId}), which is no longer supported. Removing database record only.`);
        }

        // Delete from database
        await Resource.findByIdAndDelete(res._id);
        console.log(`✅ Deleted resource from database: ${res.fileId}`);
        deletedFileIds.push(res.fileId);
      } catch (err) {
        console.error(`❌ Error deleting resource ${res.fileId}:`, err);
        failedDeletions.push({
          fileId: res.fileId,
          fileName: res.fileName,
          reason: err.message,
        });
      }
    }

    // Log who deleted it
    const deletedBy = isAdmin && userId !== uploadedBy ? "Admin" : "Owner";
    console.log(`✅ ${resourcesToDelete.length} resource(s) deleted successfully by ${deletedBy}`);

    res.status(200).json({
      success: true,
      message: 
        resourcesToDelete.length > 1
          ? `Successfully deleted ${resourcesToDelete.length} grouped images`
          : "Resource deleted successfully",
      data: {
        deletedCount: deletedFileIds.length,
        deletedFileIds: deletedFileIds,
        failedCount: failedDeletions.length,
        failedDeletions: failedDeletions.length > 0 ? failedDeletions : undefined,
        deletedBy: deletedBy,
        isGroupDelete: resourcesToDelete.length > 1,
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
    const totalExcels = await Resource.countDocuments({ fileType: "excel" });
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
          excel: totalExcels,
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

export const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "name email",
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Increment download count
    resource.downloads = (resource.downloads || 0) + 1;
    await resource.save();

    // Get the file URL and name
    const fileUrl = resource.fileUrl;
    const fileName = resource.fileName || resource.title || "download";

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: "File URL not available",
      });
    }

    // Set proper headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Fetch file from Cloudinary and pipe to response
    try {
      https
        .get(fileUrl, (cloudRes) => {
          // Forward headers from Cloudinary
          if (cloudRes.headers["content-type"]) {
            res.setHeader("Content-Type", cloudRes.headers["content-type"]);
          }
          // Pipe the response
          cloudRes.pipe(res);
        })
        .on("error", (err) => {
          console.error("Cloudinary request error:", err.message);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Error downloading file",
            });
          }
        });
    } catch (err) {
      console.error("Error downloading file:", err.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error downloading file",
        });
      }
    }
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Download grouped resources (all images in imageGroupId as zip)
// @route   GET /api/resources/:id/download-group
// @access  Private
export const downloadGroupedResources = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "name email",
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Check if this resource is part of a group
    if (!resource.imageGroupId) {
      return res.status(400).json({
        success: false,
        message: "This resource is not part of a grouped upload. Use the regular download endpoint.",
      });
    }

    // Get all resources in the group
    const groupedResources = await Resource.find({
      imageGroupId: resource.imageGroupId,
    }).sort({ createdAt: 1 });

    if (groupedResources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No grouped resources found",
      });
    }

    console.log(`📦 Downloading group of ${groupedResources.length} images with groupId: ${resource.imageGroupId}`);

    // Increment download count for all images in the group
    for (const res of groupedResources) {
      res.downloads = (res.downloads || 0) + 1;
      await res.save();
    }

    // Create zip file
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // Set response headers for zip download
    const zipFileName = `${resource.title || "images"}_group.zip`;
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(zipFileName)}"`,
    );
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Handle archive errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error creating zip file",
        });
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add each file to the archive
    let fileIndex = 1;
    for (const groupResource of groupedResources) {
      try {
        const fileUrl = groupResource.fileUrl;
        if (!fileUrl) {
          console.warn(`⚠️ File URL not available for: ${groupResource.fileName}`);
          continue;
        }

        // Create a promise-based wrapper for https.get
        await new Promise((resolve, reject) => {
          https
            .get(fileUrl, (cloudRes) => {
              if (cloudRes.statusCode !== 200) {
                reject(new Error(`HTTP ${cloudRes.statusCode}`));
                return;
              }

              // Add file to archive with sequential naming
              const fileExtension = path.extname(groupResource.fileName);
              const fileName = `${fileIndex}_${groupResource.title}${fileExtension}`;
              archive.append(cloudRes, { name: fileName });
              fileIndex++;
              
              resolve();
            })
            .on("error", reject);
        });
      } catch (err) {
        console.warn(`⚠️ Failed to add file to archive: ${err.message}`);
        // Continue with other files
      }
    }

    // Finalize the archive
    await archive.finalize();
    console.log(`✅ Group download completed for ${groupedResources.length} images`);
  } catch (error) {
    console.error("Group download error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error during group download",
      });
    }
  }
};
