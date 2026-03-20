import fs from "fs";
import path from "path";

const logsDir = "./logs";

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log authentication attempts
export const logAuthAttempt = (email, success, ipAddress) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: "AUTH_ATTEMPT",
    email,
    success,
    ipAddress,
  };

  fs.appendFileSync(
    path.join(logsDir, "security.log"),
    JSON.stringify(logEntry) + "\n",
  );
};

// Log file uploads
export const logFileUpload = (
  userId,
  fileName,
  fileSize,
  success,
  error = null,
) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: "FILE_UPLOAD",
    userId: userId?.toString() || "unknown",
    fileName,
    fileSize,
    success,
    error,
  };

  fs.appendFileSync(
    path.join(logsDir, "files.log"),
    JSON.stringify(logEntry) + "\n",
  );
};

// Log unauthorized access attempts
export const logUnauthorizedAccess = (userId, endpoint, reason) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: "UNAUTHORIZED_ACCESS",
    userId: userId?.toString() || "unknown",
    endpoint,
    reason,
  };

  fs.appendFileSync(
    path.join(logsDir, "security.log"),
    JSON.stringify(logEntry) + "\n",
  );
};

// Log CSRF token failures
export const logCSRFFailure = (userId, endpoint, reason) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: "CSRF_FAILURE",
    userId: userId?.toString() || "unknown",
    endpoint,
    reason,
  };

  fs.appendFileSync(
    path.join(logsDir, "security.log"),
    JSON.stringify(logEntry) + "\n",
  );
};
