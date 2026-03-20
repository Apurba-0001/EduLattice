import crypto from "crypto";

const csrfTokens = new Map();

// Generate CSRF token for user
export const generateCSRFToken = (userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  csrfTokens.set(token, {
    userId,
    createdAt: Date.now(),
    expirationTime,
    used: false,
  });

  return token;
};

// Verify CSRF token
export const verifyCSRFToken = (token, userId) => {
  if (!csrfTokens.has(token)) {
    return { valid: false, reason: "Invalid token" };
  }

  const tokenData = csrfTokens.get(token);

  if (tokenData.userId !== userId) {
    return { valid: false, reason: "Token mismatch" };
  }

  if (tokenData.used) {
    return { valid: false, reason: "Token already used" };
  }

  if (Date.now() > tokenData.expirationTime) {
    csrfTokens.delete(token);
    return { valid: false, reason: "Token expired" };
  }

  // Mark as used (single-use token)
  tokenData.used = true;

  return { valid: true };
};

// CSRF validation middleware (for file uploads and state-changing requests)
export const csrfProtection = (req, res, next) => {
  // Skip GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const token = req.headers["x-csrf-token"];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "CSRF token required",
    });
  }

  const userId = req.user?._id?.toString();
  const verification = verifyCSRFToken(token, userId);

  if (!verification.valid) {
    return res.status(403).json({
      success: false,
      message: `CSRF verification failed: ${verification.reason}`,
    });
  }

  next();
};

// Attach CSRF token to response
export const attachCSRFToken = (req, res, next) => {
  if (req.user?._id) {
    const token = generateCSRFToken(req.user._id.toString());
    res.set("X-CSRF-Token", token);
  }
  next();
};
