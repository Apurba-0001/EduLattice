// Upload validation error messages

export const ERROR_MESSAGES = {
  NO_FILES: "Please select at least one file",

  INVALID_FILE_TYPE:
    "Invalid file type. Allowed: PDF, PPT, PPTX, ODP, Keynote, DOC, DOCX, ODT, TXT, RTF, Pages, XLS, XLSX, ODS, CSV, Numbers, JPG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, AVIF",

  MIXED_FILE_TYPES:
    "Cannot upload images and documents together. Please upload them separately.",

  TOO_MANY_IMAGES: "Maximum 5 images can be uploaded at once",

  TOO_MANY_DOCUMENTS: "Only 1 document can be uploaded at a time",

  IMAGE_SIZE_EXCEEDED: (fileName) =>
    `Image "${fileName}" exceeds size limit. Max per image: 10MB`,

  DOCUMENT_SIZE_EXCEEDED: (fileName) =>
    `Document "${fileName}" exceeds size limit. Max per document: 25MB`,

  TOTAL_IMAGE_SIZE_EXCEEDED: (totalMB) =>
    `Total size of all images (${totalMB}MB) exceeds limit. Max: 50MB for 5 images`,

  DOCUMENT_COLLECTIVE_SIZE_EXCEEDED: (totalMB) =>
    `Document size (${totalMB}MB) exceeds limit. Max: 25MB`,

  DANGEROUS_FILE: (fileName, reason) =>
    `⚠️ Security Warning: "${fileName}" is blocked. Reason: ${reason}. Please upload a safe file instead.`,

  UPLOAD_FAILED: "Failed to upload resource(s)",
};
