import multer from "multer";
import path from "path";

// File type validation with security checks
const fileFilter = (req, file, cb) => {
  const extname = path
    .extname(file.originalname)
    .toLowerCase()
    .replace(".", "");
  const mimetype = file.mimetype.toLowerCase();
  const filename = file.originalname.toLowerCase();

  // ========== DANGEROUS FILE BLOCKLIST ==========
  // Explicitly block all executable, script, and potentially harmful file types
  const blockedExtensions =
    /exe|com|bat|cmd|scr|vbs|js|py|rb|pl|php|asp|aspx|jsp|sh|bash|zsh|csh|swift|jar|class|pyc|pyo|app|msi|sys|dll|ini|inf|lnk|pif|reg|mdb|db|sqlite|iso|dmg|img|bin|tmp|bak|old|zip|rar|7z|tar|gz|bz2|xz|arj|cab|ace|lzh|ace|uc2|uue|gzip|compress|shar|rpm|deb|apk|pkg|dmg|run|install|mac|exe|scr|ani|cur|ico|drv|fon|fot|ime|lcn|lnk|msi|msp|mst|ocx|scf|shb|shs|sys|tlb|tsp|vbx|ws|wsc|wsf|wsz|xnl|hta|htm|html|xml|xsl|xslt|mpeg|mpg|avi|mov|asf|asx|wmv|wma|mid|midi|wav|au|aiff|flac|m4a|m4v|mp3|mp4|mkv|webm|ogv|3gp|3g2|f4v|f4a|f4b|flv|ts|m2ts|mts|vob|webp|eot|ttf|otf|woff|woff2|fon/i;

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
    "application/x-ole-storage",
    "application/x-msexcel",
    "application/x-ole-storage",
    "application/vnd.ms-cab-compressed",
    "application/x-apple-diskimage",
    "application/x-iso9660-image",
    "application/x-msdownload",
    "application/x-dvi",
    "application/x-tex",
    "application/x-latex",
    "text/x-shellscript",
    "text/x-python",
    "text/javascript",
    "text/x-script.python",
  ];

  // ========== SECURITY CHECKS ==========

  // 1. Block dangerous file extensions
  if (blockedExtensions.test(extname)) {
    return cb(
      new Error(
        `File type '.${extname}' is blocked for security reasons. Executable, script, archive, and system files are not allowed.`,
      ),
      false,
    );
  }

  // 2. Block dangerous MIME types
  if (blockedMimeTypes.includes(mimetype)) {
    return cb(
      new Error(
        `File MIME type '${mimetype}' is blocked for security reasons.`,
      ),
      false,
    );
  }

  // 3. Block video files explicitly
  if (mimetype.startsWith("video/")) {
    return cb(new Error("Video files are not allowed"), false);
  }

  // 4. Block audio files
  if (mimetype.startsWith("audio/")) {
    return cb(new Error("Audio files are not allowed"), false);
  }

  // 5. Additional protection: filename checks for dangerous patterns
  if (
    filename.includes("..") ||
    filename.includes("\\") ||
    filename.includes("/")
  ) {
    return cb(new Error("Invalid filename: path traversal detected"), false);
  }

  // 6. Double extension detection (e.g., image.jpg.exe)
  const filenameParts = file.originalname.split(".");
  if (filenameParts.length > 2) {
    // Check if any part before the last is a dangerous extension
    for (let i = 0; i < filenameParts.length - 1; i++) {
      const suspiciousExt = filenameParts[i + 1];
      if (blockedExtensions.test(suspiciousExt)) {
        return cb(
          new Error(
            `File with suspicious double extension (.${suspiciousExt}) detected - possible malware disguised as legitimate file`,
          ),
          false,
        );
      }
    }
  }

  // 7. Block Office files with macros (potential security risk)
  if (/docm|xlsm|pptm/i.test(extname)) {
    return cb(
      new Error(
        "Office files with macros (.docm, .xlsm, .pptm) are blocked for security reasons",
      ),
      false,
    );
  }

  // ========== ALLOWED FILE WHITELIST ==========
  const allowedDocExtensions =
    /pdf|ppt|pptx|odp|doc|docx|odt|xls|xlsx|ods|csv|txt|rtf|key|pages|numbers/i;
  const allowedImageExtensions =
    /jpg|jpeg|png|gif|webp|bmp|tiff|tif|svg|heic|heif/i;

  // Check if it's a whitelisted document
  if (allowedDocExtensions.test(extname)) {
    const allowedDocMimeTypes = [
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
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.apple.numbers",
      "text/csv",
      "text/plain",
      "application/rtf",
      "text/rtf",
    ];

    if (allowedDocMimeTypes.includes(mimetype)) {
      return cb(null, true);
    }
  }

  // Check if it's a whitelisted image
  if (allowedImageExtensions.test(extname)) {
    if (mimetype.startsWith("image/")) {
      return cb(null, true);
    }
  }

  // If file passes extension/MIME checks but isn't in whitelist, reject
  cb(
    new Error(
      "Invalid file type. Allowed: PDF, PPT, PPTX, ODP, DOC, DOCX, ODT, XLS, XLSX, ODS, CSV, TXT, RTF, Keynote, Pages, Numbers, JPG, JPEG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, HEIF",
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
