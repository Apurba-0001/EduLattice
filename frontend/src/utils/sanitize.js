/**
 * XSS Prevention Utilities for Frontend
 * Provides helpers to sanitize and escape user-generated content
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts: < > " ' &
 * @param {string} unsafe - Raw HTML string from user input
 * @returns {string} Safely escaped HTML string
 */
export const escapeHtml = (unsafe) => {
  if (!unsafe || typeof unsafe !== "string") {
    return "";
  }

  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Sanitize user input by removing potentially dangerous HTML/JS
 * Uses the browser's built-in text escaping
 * @param {string} text - User input to sanitize
 * @returns {string} Sanitized text safe for display
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Create a temporary div and set text content (not HTML)
  // This automatically escapes any HTML
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitize URL to prevent javascript: and data: attacks
 * @param {string} url - URL to sanitize
 * @returns {string} Safe URL or empty string
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
    "about:",
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return "";
    }
  }

  return url;
};

/**
 * Create a safe DOM element from user input
 * Useful for rendering user content safely
 * @param {string} tag - HTML tag name (e.g., 'div', 'p')
 * @param {string} content - Text content (will be escaped)
 * @param {object} attributes - Optional attributes object
 * @returns {HTMLElement} Safe element
 */
export const createSafeElement = (tag, content, attributes = {}) => {
  const element = document.createElement(tag);

  // Set text content (not innerHTML) to prevent XSS
  if (content) {
    element.textContent = content;
  }

  // Set safe attributes
  for (const [key, value] of Object.entries(attributes)) {
    // Only allow safe attributes
    const safeAttributes = ["class", "id", "title", "data-*", "aria-*", "role"];
    const isSafeAttribute = safeAttributes.some(
      (safe) =>
        safe === key ||
        (safe.includes("*") && key.startsWith(safe.replace("*", ""))),
    );

    if (isSafeAttribute && typeof value === "string") {
      element.setAttribute(key, escapeHtml(value));
    }
  }

  return element;
};

/**
 * Validate and sanitize email address
 * @param {string} email - Email to validate
 * @returns {string} Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    return "";
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "";
  }

  // Trim and lowercase
  return email.trim().toLowerCase();
};

/**
 * Remove any HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Plain text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Create div to leverage browser's HTML parsing
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

/**
 * Validate input length to prevent buffer overflow attacks
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if valid length
 */
export const validateLength = (input, maxLength) => {
  if (!input || typeof input !== "string") {
    return true; // Empty is allowed
  }

  return input.length <= maxLength;
};

/**
 * Sanitize filename to prevent directory traversal attacks
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== "string") {
    return "file";
  }

  // Remove path separators and null bytes
  let safe = filename
    .replace(/\0/g, "") // Null bytes
    .replace(/\.\./g, "") // Parent directory
    .replace(/\//g, "") // Forward slash
    .replace(/\\/g, "") // Backslash
    .trim();

  // Ensure not empty
  if (!safe) {
    safe = "file";
  }

  // Max 255 characters (typical filename limit)
  return safe.substring(0, 255);
};

/**
 * HTML encode string for safe display in HTML context
 * @param {string} str - String to encode
 * @returns {string} HTML encoded string
 */
export const htmlEncode = (str) => {
  if (!str || typeof str !== "string") {
    return "";
  }

  const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return str.replace(/[&<>"']/g, (char) => htmlEntities[char]);
};
