import {
  FILE_SIZE_LIMITS,
  FILE_COUNT_LIMITS,
  formatBytes,
} from "../constants/uploadLimits";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const ALLOWED_DOC_EXTENSIONS = new Set([
  "pdf",
  "ppt",
  "pptx",
  "odp",
  "key",
  "keynote",
  "doc",
  "docx",
  "odt",
  "txt",
  "rtf",
  "pages",
  "xls",
  "xlsx",
  "ods",
  "csv",
  "numbers",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "tiff",
  "tif",
  "svg",
  "heic",
  "heif",
  "avif",
]);

const ALLOWED_DOC_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.apple.keynote",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.apple.pages",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/x-excel",
  "application/x-msexcel",
  "application/x-ole-storage",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.apple.numbers",
  "text/csv",
  "text/plain",
  "application/rtf",
  "text/rtf",
  "application/octet-stream",
]);

const getFileExtension = (filename = "") => {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return filename.substring(dotIndex + 1).toLowerCase();
};

// Helper function to determine if file is image
export const isImageFile = (file) => {
  return file.type.startsWith("image/");
};

// Helper function to validate file type
export const validateFileType = (file) => {
  const ext = getFileExtension(file.name);
  const mime = (file.type || "").toLowerCase();

  if (ALLOWED_DOC_EXTENSIONS.has(ext)) {
    return ALLOWED_DOC_MIME_TYPES.has(mime);
  }

  if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return mime.startsWith("image/") || mime === "application/octet-stream";
  }

  return false;
};

// Helper function to check for dangerous file types (security)
export const isDangerousFile = (filename, mimeType = "") => {
  // Comprehensive blocklist matching backend
  const blockedExtensions =
    /^(exe|com|bat|cmd|scr|vbs|js|py|rb|pl|php|asp|aspx|jsp|sh|bash|zsh|csh|swift|jar|class|pyc|pyo|app|msi|sys|dll|ini|inf|lnk|pif|reg|mdb|db|sqlite|iso|dmg|img|bin|tmp|bak|old|zip|rar|7z|tar|gz|bz2|xz|arj|cab|ace|lzh|uc2|uue|gzip|compress|shar|rpm|deb|apk|pkg|run|install|mac|ani|cur|ico|drv|fon|fot|ime|lcn|msp|mst|ocx|scf|shb|shs|tlb|tsp|vbx|ws|wsc|wsf|wsz|xnl|hta|htm|html|xml|xsl|xslt|mpeg|mpg|avi|mov|asf|asx|wmv|wma|mid|midi|wav|au|aiff|flac|m4a|m4v|mp3|mp4|mkv|webm|ogv|3gp|3g2|f4v|f4a|f4b|flv|ts|m2ts|mts|vob|docm|xlsm|pptm)$/i;

  const blockedMimeTypes = [
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-executable",
    "application/x-elf",
    "application/x-object",
    "application/x-sharedlib",
    "application/x-sh",
    "application/x-shellscript",
    "application/x-bash",
    "application/x-python",
    "application/x-perl",
    "application/x-ruby",
    "application/x-java-applet",
    "application/java-archive",
    "application/x-java-bean",
    "application/x-compressed",
    "application/x-gzip",
    "application/gzip",
    "application/x-tar",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-zip-compressed",
    "application/zip",
    "application/vnd.ms-cab-compressed",
    "application/x-apple-diskimage",
    "application/x-iso9660-image",
    "application/x-dvi",
    "application/x-tex",
    "application/x-latex",
    "text/x-shellscript",
    "text/x-python",
    "text/javascript",
    "text/x-script.python",
  ];

  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  const mimeTypeLower = mimeType.toLowerCase();

  // Check blocked MIME types
  if (blockedMimeTypes.includes(mimeTypeLower)) {
    return `File MIME type '${mimeType}' is blocked for security reasons`;
  }

  // Check blocked extensions
  if (blockedExtensions.test(ext.replace(".", ""))) {
    return `File type '${ext}' is blocked for security reasons. Executable, script, archive, and system files are not allowed`;
  }

  // Check video and audio MIME types
  if (mimeTypeLower.startsWith("video/")) {
    return "Video files are not allowed";
  }
  if (mimeTypeLower.startsWith("audio/")) {
    return "Audio files are not allowed";
  }

  // Check for double extensions (e.g., image.jpg.exe, ok.exe.pdf)
  const parts = filename
    .split(".")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);

  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      const checkExt = parts[i].replace(/^\.+/, "");
      if (blockedExtensions.test(checkExt)) {
        return `File with suspicious double extension (.${checkExt}) detected - possible malware disguised as legitimate file`;
      }
    }
  }

  // Additional legacy checks
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

  if (dangerousExtensions[ext]) {
    return dangerousExtensions[ext];
  }

  return null;
};

/**
 * Validates a list of files for upload
 * @param {Array<File>} filesArray - Array of File objects to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateFiles = (filesArray) => {
  // SECURITY: Check for dangerous files (including MIME type validation)
  for (let file of filesArray) {
    const dangerReason = isDangerousFile(file.name, file.type);
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
