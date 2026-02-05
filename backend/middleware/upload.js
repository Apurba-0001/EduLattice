import multer from "multer";
import path from "path";

// File type validation
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedDocExtensions = /pdf|ppt|pptx|doc|docx/;
  const allowedImageExtensions = /jpg|jpeg|png/;

  const extname = path
    .extname(file.originalname)
    .toLowerCase()
    .replace(".", "");
  const mimetype = file.mimetype;

  // Block videos explicitly
  if (mimetype.startsWith("video/")) {
    return cb(new Error("Video files are not allowed"), false);
  }

  // Check if it's a document
  if (allowedDocExtensions.test(extname)) {
    if (
      mimetype === "application/pdf" ||
      mimetype === "application/vnd.ms-powerpoint" ||
      mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      mimetype === "application/msword" ||
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return cb(null, true);
    }
  }

  // Check if it's an image
  if (allowedImageExtensions.test(extname)) {
    if (mimetype.startsWith("image/")) {
      return cb(null, true);
    }
  }

  cb(
    new Error(
      "Invalid file type. Only PDF, PPT, DOCX, JPG, and PNG are allowed",
    ),
    false,
  );
};

// Configure multer storage (memory storage for cloud uploads)
const storage = multer.memoryStorage();

// File size limits
const limits = {
  fileSize: 25 * 1024 * 1024, // 25 MB max (will be checked again based on type)
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
