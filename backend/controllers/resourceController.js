import Resource from "../models/Resource.js";
import cloudinaryService from "../services/cloudinary.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import https from "https";
import archiver from "archiver";

// Helper function to check if file is dangerous and return description
const getDangerousFileReason = (mimetype, filename) => {
  const ext = path.extname(filename).toLowerCase();

  // Mapping of dangerous extensions to descriptions
  const extensionDescriptions = {
    // Windows executables
    ".exe": "Windows executable",
    ".bat": "Windows batch script",
    ".cmd": "Windows command script",
    ".com": "Windows executable",
    ".msi": "Windows installer",
    ".scr": "Windows screensaver",
    ".pif": "Windows shortcut",
    ".vbs": "Visual Basic script",
    ".vbe": "Visual Basic encrypted script",
    // Linux/Unix executables
    ".sh": "Shell script",
    ".bash": "Bash script",
    ".ksh": "Korn shell script",
    ".csh": "C shell script",
    ".run": "Linux executable",
    ".elf": "Linux executable",
    // Mac executables
    ".app": "Mac application",
    ".dmg": "Mac disk image",
    ".pkg": "Mac installer",
    // Java
    ".jar": "Java executable",
    ".jnlp": "Java web start",
    ".class": "Java class file",
    // Archives (can contain executables)
    ".zip": "ZIP archive (may contain malicious files)",
    ".rar": "RAR archive (may contain malicious files)",
    ".7z": "7-Zip archive (may contain malicious files)",
    ".tar": "TAR archive (may contain malicious files)",
    ".gz": "GZIP archive (may contain malicious files)",
    ".bz2": "BZIP2 archive (may contain malicious files)",
    ".iso": "ISO image (may contain malicious files)",
    ".cab": "Cabinet archive (may contain malicious files)",
    ".arj": "ARJ archive (may contain malicious files)",
    ".ace": "ACE archive (may contain malicious files)",
    // Libraries (can be dangerous)
    ".dll": "Windows library (can contain malware)",
    ".so": "Linux shared library (can contain malware)",
    ".dylib": "Mac dynamic library (can contain malware)",
    ".o": "Object file (compiled code)",
    ".a": "Static library",
    ".lib": "Windows library",
    // Scripts (can be dangerous)
    ".js": "JavaScript file (potential security risk)",
    ".ps1": "PowerShell script",
    ".psm1": "PowerShell module",
    ".psd1": "PowerShell data file",
    ".wsh": "Windows script host",
    // System files
    ".sys": "System driver",
    ".drv": "Device driver",
    ".ko": "Linux kernel module",
    ".dbg": "Debug file",
    // Office macros
    ".docm": "Word document with macros (potential risk)",
    ".xlsm": "Excel workbook with macros (potential risk)",
    ".pptm": "PowerPoint with macros (potential risk)",
  };

  // Check against blocked extensions
  if (extensionDescriptions[ext]) {
    return extensionDescriptions[ext];
  }

  // Mapping of dangerous MIME types to descriptions
  const mimeTypeDescriptions = {
    "application/x-executable": "Executable file",
    "application/x-elf": "Linux executable",
    "application/x-mach-binary": "Mac executable",
    "application/x-msdownload": "Windows executable",
    "application/x-msdos-program": "DOS executable",
    "application/x-msi": "Windows installer",
    "application/x-sh": "Shell script",
    "application/x-shellscript": "Shell script",
    "application/x-bash": "Bash script",
    "application/x-javascript": "JavaScript (potential security risk)",
    "text/x-shellscript": "Shell script",
    "text/x-python": "Python script",
    "text/x-perl": "Perl script",
    "text/x-ruby": "Ruby script",
  };

  // Check against blocked MIME types
  if (mimeTypeDescriptions[mimetype]) {
    return mimeTypeDescriptions[mimetype];
  }

  // Check for double extensions (e.g., image.jpg.exe)
  if (filename.lastIndexOf(".") !== filename.indexOf(".")) {
    const doubleExt = filename.substring(filename.lastIndexOf(".") - 4);
    for (const [dangerous, description] of Object.entries(
      extensionDescriptions,
    )) {
      if (doubleExt.includes(dangerous)) {
        return (
          "File with suspicious double extension (" +
          dangerous +
          ") - may be disguised malware"
        );
      }
    }
  }

  return null;
};

// Helper function to determine file type
const getFileType = (mimetype, filename) => {
  const ext = path.extname(filename).toLowerCase();

  // PDF
  if (mimetype === "application/pdf" || ext === ".pdf") return "pdf";

  // PowerPoint (MS Office & OpenDocument)
  if (
    mimetype.includes("powerpoint") ||
    ext === ".ppt" ||
    ext === ".pptx" ||
    ext === ".odp" ||
    mimetype.includes("presentation")
  )
    return "ppt";

  // Word (MS Office & OpenDocument)
  if (
    mimetype.includes("word") ||
    ext === ".doc" ||
    ext === ".docx" ||
    ext === ".odt" ||
    ext === ".txt" ||
    ext === ".rtf" ||
    mimetype === "text/plain" ||
    mimetype === "application/rtf"
  )
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
  if (ext === ".pages" || mimetype === "application/vnd.apple.pages")
    return "doc";
  if (ext === ".numbers" || mimetype === "application/vnd.apple.numbers")
    return "excel";
  if (ext === ".keynote" || mimetype === "application/vnd.apple.keynote")
    return "ppt";

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

    // SECURITY: Ensure all text inputs are strings (blocks NoSQL operator injection)
    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof subject !== "string" ||
      typeof semester !== "string" ||
      typeof resourceType !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input types",
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
      const dangerReason = getDangerousFileReason(
        file.mimetype,
        file.originalname,
      );
      if (dangerReason) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `🚨 SECURITY: Blocked dangerous file upload (${dangerReason})`,
          );
        }
        return res.status(400).json({
          success: false,
          message: `Security alert: File "${file.originalname}" is blocked. Reason: ${dangerReason}. Please upload a safe file instead.`,
        });
      }
    }

    // Validate file types and count
    const fileTypes = files.map((file) =>
      getFileType(file.mimetype, file.originalname),
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
      (type) => type !== "image" && type !== null,
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
          storageFileName,
        );
      } else {
        uploadResult = await cloudinaryService.uploadDocument(
          file.buffer,
          storageFileName,
          file.mimetype,
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
        fileName: displayFileName,
        storageFileName: storageFileName,
        fileSize: file.size,
        uploadedBy: req.user._id,
        imageGroupId: imageGroupId,
        imageGroupCount: files.length,
        imageGroupSize: totalSize,
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
    if (process.env.NODE_ENV === "development") {
      console.error("Upload error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Server error during file upload",
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

    // Validate and sanitize pagination parameters
    let pageNum = Math.max(1, parseInt(page) || 1);
    let limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 items per page

    // Validate sort parameters
    const allowedSortFields = ["createdAt", "title", "views"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortVal = sortOrder === "asc" ? 1 : -1;

    // Build query
    let query = {};

    // Exclude archived resources by default
    if (includeArchived !== "true") {
      query.isArchived = { $ne: true };
    }

    if (subject) {
      // Escape regex special characters to prevent ReDoS attacks
      const escapedSubject = String(subject).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      query.subject = { $regex: escapedSubject, $options: "i" };
    }

    if (semester) {
      // Escape regex special characters to prevent ReDoS attacks
      const escapedSemester = String(semester).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      query.semester = { $regex: escapedSemester, $options: "i" };
    }

    if (resourceType) {
      query.resourceType = String(resourceType);
    }

    if (keyword) {
      // Escape regex special characters to prevent NoSQL injection
      const escapedKeyword = String(keyword).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      query.$or = [
        { title: { $regex: escapedKeyword, $options: "i" } },
        { description: { $regex: escapedKeyword, $options: "i" } },
        { subject: { $regex: escapedKeyword, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    sortObj[sortField] = sortVal;

    // Execute query
    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email")
      .sort(sortObj)
      .limit(limitNum)
      .skip(skip);

    // Get total count
    const total = await Resource.countDocuments(query);

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: resources,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get resources error:", error.message);
    }
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
      if (process.env.NODE_ENV === "development") {
        console.log(`❌ Unauthorized update attempt`);
      }
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this resource.",
      });
    }

    // Only allow updating specific fields (prevent tampering with fileUrl, uploadedBy, etc.)
    const allowedUpdates = [
      "title",
      "description",
      "subject",
      "semester",
      "resourceType",
    ];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        // SECURITY: Coerce to string to block NoSQL operator injection
        updates[field] = String(req.body[field]);
      }
    }

    // If title changes, update fileName as well
    if (updates.title && updates.title !== resource.title) {
      const ext = resource.fileName.substring(
        resource.fileName.lastIndexOf("."),
      );
      updates.fileName = updates.title + ext;
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    ).populate("uploadedBy", "name email");

    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ Resource updated by ${isAdmin && userId !== uploadedBy ? "Admin" : "Owner"}: Fields=${Object.keys(updates).join(", ")}`,
      );
    }

    res.status(200).json({
      success: true,
      data: updatedResource,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Update error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Server error during update",
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

    // Log deletion attempt (dev only)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Delete attempt: IsAdmin=${isAdmin} File=${resource.fileName}`,
      );
    }

    // SECURITY: Explicit authorization check (defense in depth)
    if (!isAdmin && userId !== uploadedBy) {
      if (process.env.NODE_ENV === "development") {
        console.log(`❌ Unauthorized deletion attempt`);
      }
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this resource. Only the uploader or admin can delete files.",
      });
    }

    // Find all resources to delete (if imageGroupId exists, delete all grouped resources)
    let resourcesToDelete = [resource];

    if (resource.imageGroupId) {
      if (process.env.NODE_ENV === "development") {
        console.log(`📸 Found grouped images to delete`);
      }
      const groupedResources = await Resource.find({
        imageGroupId: resource.imageGroupId,
      });
      resourcesToDelete = groupedResources;
      if (process.env.NODE_ENV === "development") {
        console.log(`📸 Deleting ${resourcesToDelete.length} grouped images`);
      }
    }

    // Delete all resources from Cloudinary and database
    const deletedFileIds = [];
    const failedDeletions = [];

    for (const res of resourcesToDelete) {
      try {
        // Delete from storage (all files now on Cloudinary)
        // First try to use stored cloudinaryPublicId, then fall back to URL extraction
        let publicId = res.cloudinaryPublicId;

        if (!publicId && res.fileUrl && res.fileUrl.includes("cloudinary")) {
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
            if (process.env.NODE_ENV === "development") {
              console.log(`Failed to parse URL: ${e.message}`);
            }
          }
        }

        if (process.env.NODE_ENV === "development") {
          console.log("Attempting to delete from Cloudinary");
        }

        if (publicId) {
          try {
            await cloudinaryService.deleteImage(publicId);
            if (process.env.NODE_ENV === "development") {
              console.log("✅ Deleted file from Cloudinary");
            }
          } catch (cloudError) {
            if (process.env.NODE_ENV === "development") {
              console.log(
                `⚠️ Cloudinary deletion failed: ${cloudError.message}`,
              );
            }
            failedDeletions.push({
              fileId: res.fileId,
              fileName: res.fileName,
              reason: "Storage deletion failed",
            });
          }
        }

        // Delete from database
        await Resource.findByIdAndDelete(res._id);
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Deleted resource from database");
        }
        deletedFileIds.push(res.fileId);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Error deleting resource:", err.message);
        }
        failedDeletions.push({
          fileId: res.fileId,
          fileName: res.fileName,
          reason: "Deletion failed",
        });
      }
    }

    // Log summary
    const deletedBy = isAdmin && userId !== uploadedBy ? "Admin" : "Owner";
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ ${resourcesToDelete.length} resource(s) deleted by ${deletedBy}`,
      );
    }

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
        failedDeletions:
          failedDeletions.length > 0 ? failedDeletions : undefined,
        deletedBy: deletedBy,
        isGroupDelete: resourcesToDelete.length > 1,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Delete error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting resource",
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

// @desc    Track resource view (increment view count)
// @route   POST /api/resources/:id/view
// @access  Private
export const trackView = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Increment view count
    resource.views = (resource.views || 0) + 1;
    await resource.save();

    res.status(200).json({
      success: true,
      message: "View tracked successfully",
      data: {
        views: resource.views,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Track view error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Helper function to get file size from Cloudinary
const getFileSize = (fileUrl) => {
  return new Promise((resolve, reject) => {
    https
      .request(fileUrl, { method: "HEAD", timeout: 10000 }, (res) => {
        if (res.statusCode === 200 && res.headers["content-length"]) {
          resolve(parseInt(res.headers["content-length"], 10));
        } else {
          resolve(null); // Cannot determine size
        }
      })
      .on("error", () => {
        resolve(null); // Fail gracefully, still allow download
      })
      .on("timeout", function () {
        this.destroy();
        resolve(null);
      })
      .end();
  });
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

    // Try to get file size for Content-Length header (improves UX)
    let contentLength = null;
    try {
      contentLength = await getFileSize(fileUrl);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Could not retrieve file size:", err.message);
      }
    }

    // Set proper headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Add Content-Length if available
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Fetch file from Cloudinary and pipe to response
    try {
      const request = https.get(fileUrl, { timeout: 30000 }, (cloudRes) => {
        // Check for successful response
        if (cloudRes.statusCode !== 200) {
          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              message: "Error downloading file from storage",
            });
          }
          return;
        }

        // Forward Content-Type from Cloudinary if available
        if (cloudRes.headers["content-type"]) {
          res.setHeader("Content-Type", cloudRes.headers["content-type"]);
        }

        // Pipe the response with error handling
        cloudRes.pipe(res);
      });

      request.on("error", (err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Storage request error:", err.message);
        }
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error downloading file from storage",
          });
        } else {
          res.destroy();
        }
      });

      request.on("timeout", () => {
        if (process.env.NODE_ENV === "development") {
          console.error("Storage request timeout");
        }
        request.destroy();
        if (!res.headersSent) {
          res.status(504).json({
            success: false,
            message: "Download timeout - file server not responding",
          });
        } else {
          res.destroy();
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error downloading file:", err.message);
      }
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error downloading file",
        });
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Download error:", error.message);
    }
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
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
        message:
          "This resource is not part of a grouped upload. Use the regular download endpoint.",
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

    if (process.env.NODE_ENV === "development") {
      console.log(`📦 Downloading group of ${groupedResources.length} images`);
    }

    // Increment download count for all images in the group
    for (const dbResource of groupedResources) {
      dbResource.downloads = (dbResource.downloads || 0) + 1;
      await dbResource.save();
    }

    // Create zip file with optimized compression
    const archive = archiver("zip", {
      zlib: { level: 6 }, // Balanced compression (faster than level 9 but still good)
    });

    // Set response headers for zip download
    const zipFileName = `${resource.title || "images"}_group.zip`;
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(zipFileName)}"`,
    );
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Handle archive errors
    archive.on("error", (err) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Archive error:", err.message);
      }
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error creating zip file",
        });
      } else {
        res.destroy();
      }
    });

    // Pipe archive to response with error handling
    archive.pipe(res);
    res.on("error", (err) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Response stream error:", err.message);
      }
      archive.destroy();
    });

    // Add files to archive in parallel for better performance
    // Limit concurrent downloads to 3 to avoid overwhelming the server
    let activeCount = 0;
    let fileIndex = 1;
    const maxConcurrent = 3;
    const queue = [...groupedResources];

    const processNext = async () => {
      if (queue.length === 0) {
        if (activeCount === 0) {
          // All files processed, finalize archive
          await archive.finalize();
          if (process.env.NODE_ENV === "development") {
            console.log(
              `✅ Group download completed for ${groupedResources.length} images`,
            );
          }
        }
        return;
      }

      if (activeCount >= maxConcurrent) {
        // Wait before processing more
        setTimeout(processNext, 100);
        return;
      }

      activeCount++;
      const groupResource = queue.shift();
      const currentIndex = groupedResources.indexOf(groupResource) + 1;

      try {
        const fileUrl = groupResource.fileUrl;
        if (!fileUrl) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `⚠️ File URL not available for: ${groupResource.fileName}`,
            );
          }
          activeCount--;
          processNext();
          return;
        }

        // Download file with timeout
        await new Promise((resolve, reject) => {
          const request = https.get(fileUrl, { timeout: 20000 }, (cloudRes) => {
            if (cloudRes.statusCode !== 200) {
              reject(new Error(`HTTP ${cloudRes.statusCode}`));
              return;
            }

            // Add file to archive with sequential naming
            const fileExtension = path.extname(groupResource.fileName);
            const fileName = `${currentIndex}_${groupResource.title}${fileExtension}`;
            archive.append(cloudRes, { name: fileName });

            resolve();
          });

          request.on("error", reject);
          request.on("timeout", () => {
            request.destroy();
            reject(new Error("Request timeout"));
          });
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`⚠️ Failed to add file to archive: ${err.message}`);
        }
        // Continue with other files
      } finally {
        activeCount--;
        processNext();
      }
    };

    // Start processing files
    processNext();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Group download error:", error.message);
    }
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error during group download",
      });
    }
  }
};
