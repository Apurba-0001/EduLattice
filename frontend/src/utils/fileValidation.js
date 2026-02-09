import {
  FILE_SIZE_LIMITS,
  FILE_COUNT_LIMITS,
  formatBytes,
} from "../constants/uploadLimits";
import { ERROR_MESSAGES } from "../constants/errorMessages";

// Helper function to determine if file is image
export const isImageFile = (file) => {
  return file.type.startsWith("image/");
};

// Helper function to validate file type
export const validateFileType = (file) => {
  const allowedTypes = [
    // PDF
    "application/pdf",
    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.apple.keynote",
    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.apple.pages",
    "text/plain",
    "application/rtf",
    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/x-excel",
    "application/x-msexcel",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.apple.numbers",
    "text/csv",
    // Images - Common formats
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/x-tiff",
    "image/svg+xml",
    // Images - Modern formats
    "image/heic",
    "image/heif",
    "image/avif",
  ];
  return allowedTypes.includes(file.type);
};

// Helper function to check for dangerous file types (security)
export const isDangerousFile = (filename) => {
  const dangerousExtensions = {
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

  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  if (dangerousExtensions[ext]) {
    return dangerousExtensions[ext];
  }

  // Check for double extensions (e.g., image.jpg.exe)
  const parts = filename.split(".");
  if (parts.length > 2) {
    for (let i = 0; i < parts.length - 1; i++) {
      const checkExt = "." + parts[i + 1];
      if (dangerousExtensions[checkExt.toLowerCase()]) {
        return (
          "File with suspicious double extension (" +
          checkExt +
          ") - may be disguised malware"
        );
      }
    }
  }

  return null;
};

/**
 * Validates a list of files for upload
 * @param {Array<File>} filesArray - Array of File objects to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateFiles = (filesArray) => {
  // SECURITY: Check for dangerous files
  for (let file of filesArray) {
    const dangerReason = isDangerousFile(file.name);
    if (dangerReason) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.DANGEROUS_FILE(file.name, dangerReason),
      };
    }
  }

  // Validate all files
  for (let file of filesArray) {
    if (!validateFileType(file)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.INVALID_FILE_TYPE,
      };
    }
  }

  // Determine if all files are images or all are documents
  const allImages = filesArray.every(isImageFile);
  const allDocuments = filesArray.every((file) => !isImageFile(file));

  // Check for mixed file types
  if (!allImages && !allDocuments) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.MIXED_FILE_TYPES,
    };
  }

  // Check file count limits
  if (
    allImages &&
    filesArray.length > FILE_COUNT_LIMITS.MAX_IMAGES_PER_UPLOAD
  ) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.TOO_MANY_IMAGES,
    };
  }

  if (
    allDocuments &&
    filesArray.length > FILE_COUNT_LIMITS.MAX_DOCUMENTS_PER_UPLOAD
  ) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.TOO_MANY_DOCUMENTS,
    };
  }

  // Check file sizes (individual and collective)
  let totalSize = 0;

  for (let file of filesArray) {
    totalSize += file.size;

    // Check individual file size
    if (isImageFile(file) && file.size > FILE_SIZE_LIMITS.MAX_IMAGE_SIZE) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.IMAGE_SIZE_EXCEEDED(file.name),
      };
    } else if (
      !isImageFile(file) &&
      file.size > FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE
    ) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.DOCUMENT_SIZE_EXCEEDED(file.name),
      };
    }
  }

  // Check collective size limit
  if (allImages && totalSize > FILE_SIZE_LIMITS.MAX_TOTAL_IMAGE_SIZE) {
    const totalMB = formatBytes(totalSize);
    return {
      isValid: false,
      error: ERROR_MESSAGES.TOTAL_IMAGE_SIZE_EXCEEDED(totalMB),
    };
  }

  if (allDocuments && totalSize > FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE) {
    const totalMB = formatBytes(totalSize);
    return {
      isValid: false,
      error: ERROR_MESSAGES.DOCUMENT_COLLECTIVE_SIZE_EXCEEDED(totalMB),
    };
  }

  // All validations passed
  return {
    isValid: true,
    error: null,
  };
};
