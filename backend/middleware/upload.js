import multer from "multer";
import path from "path";

// Dangerous file extensions that could pose security risks
const dangerousExtensions = [
  "exe",
  "bat",
  "cmd",
  "com",
  "pif",
  "scr",
  "vbs",
  "js",
  "jar",
  "zip",
  "rar",
  "7z",
  "iso",
  "bin",
  "msi",
  "app",
  "deb",
  "rpm",
  "sh",
  "bash",
  "ps1",
  "msi",
  "dll",
  "so",
  "dmg",
  "pkg",
];

// Allowed MIME types with strict validation
const allowedMimeTypes = {
  documents: [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

// File size limits by type (in bytes)
const fileSizeLimits = {
  documents: 25 * 1024 * 1024, // 25 MB
  images: 10 * 1024 * 1024, // 10 MB
};

// File type validation
const fileFilter = (req, file, cb) => {
  // Get extension and MIME type
  const extname = path
    .extname(file.originalname)
    .toLowerCase()
    .replace(".", "");
  const mimetype = file.mimetype;

  // SECURITY: Block dangerous extensions immediately
  if (dangerousExtensions.includes(extname)) {
    return cb(
      new Error(`File type '.${extname}' is not allowed for security reasons`),
      false,
    );
  }

  // Block executable and script MIME types
  if (
    mimetype.includes("executable") ||
    mimetype.includes("x-sh") ||
    mimetype.includes("x-msdownload") ||
    mimetype.includes("x-msdos-program")
  ) {
    return cb(
      new Error("Executable files are not allowed for security reasons"),
      false,
    );
  }

  // Block video and audio (explicitly forbidden)
  if (mimetype.startsWith("video/") || mimetype.startsWith("audio/")) {
    return cb(new Error("Video and audio files are not allowed"), false);
  }

  // Check if it's a valid document
  const isValidDocument = allowedMimeTypes.documents.includes(mimetype);
  const isValidImage = allowedMimeTypes.images.includes(mimetype);

  if (!isValidDocument && !isValidImage) {
    return cb(
      new Error("Invalid file type. Only documents and images are allowed"),
      false,
    );
  }

  // SECURITY: Validate file size matches type
  if (isValidDocument && file.size > fileSizeLimits.documents) {
    return cb(new Error(`Document exceeds max size of 25MB`), false);
  }

  if (isValidImage && file.size > fileSizeLimits.images) {
    return cb(new Error(`Image exceeds max size of 10MB`), false);
  }

  // All validations passed
  cb(null, true);
};

// Configure multer storage (memory storage for cloud uploads)
const storage = multer.memoryStorage();

// Strict file size limits for the overall request
const limits = {
  fileSize: 25 * 1024 * 1024, // 25 MB max
  files: 5, // Max 5 files per upload
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
