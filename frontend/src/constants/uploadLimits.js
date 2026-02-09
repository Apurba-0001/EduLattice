// File upload size limits and restrictions

export const FILE_SIZE_LIMITS = {
  // Individual file size limits (in bytes)
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB per image
  MAX_DOCUMENT_SIZE: 25 * 1024 * 1024, // 25MB per document

  // Collective size limit for grouped uploads
  MAX_TOTAL_IMAGE_SIZE: 5 * 10 * 1024 * 1024, // 50MB total for all images
};

export const FILE_COUNT_LIMITS = {
  MAX_IMAGES_PER_UPLOAD: 5, // Maximum 5 images at once
  MAX_DOCUMENTS_PER_UPLOAD: 1, // Only 1 document at a time
};

// Helper to format bytes to MB
export const formatBytes = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

// Human-readable size strings
export const FILE_SIZE_LIMITS_READABLE = {
  IMAGE_SIZE: "10MB",
  DOCUMENT_SIZE: "25MB",
  TOTAL_IMAGE_SIZE: "50MB",
};
