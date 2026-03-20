import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
const envPath = path.join(__dirname, ".env");
if (process.env.NODE_ENV === "development") {
  console.log("[DEV] Loading environment configuration...");
}
const dotenvResult = dotenv.config({ path: envPath });
if (dotenvResult.error && process.env.NODE_ENV === "development") {
  console.log("[DEV] No .env file found, using environment variables.");
}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import xssClean from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

// Initialize Express app
const app = express();

// Connect to MongoDB

connectDB();

// Lightweight ping route for uptime monitoring

// ========== SECURITY MIDDLEWARE ==========

// 1. Helmet for security headers
app.use(helmet());

// Enhanced Content Security Policy (CSP) - Strict restrictions
const cspDirectives = {
  // Restrict all content to same origin by default
  defaultSrc: ["'self'"],

  // Only allow scripts from same origin
  scriptSrc: ["'self'"],

  // Allow styles from same origin and unsafe-inline (for Tailwind CSS)
  styleSrc: ["'self'", "'unsafe-inline'"],

  // Allow images from self, data URLs, and HTTPS
  imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],

  // Allow fonts from self
  fontSrc: ["'self'"],

  // Only allow connections to same origin and Cloudinary API
  connectSrc: ["'self'", "https://api.cloudinary.com"],

  // Allow media from self and Cloudinary
  mediaSrc: ["'self'", "https://res.cloudinary.com"],

  // Disable plugins
  objectSrc: ["'none'"],

  // Disable frames (no embedded content)
  frameSrc: ["'none'"],

  // Restrict base URL
  baseUri: ["'self'"],

  // Restrict form submissions to same origin
  formAction: ["'self'"],

  // Prevent framing of this site
  frameAncestors: ["'none'"],

  // Strict yet flexible configuration
  childSrc: ["'self'"],
  prefetchSrc: ["'self'"],
  workerSrc: ["'self'"],
};

// Only add reportUri in production
if (process.env.NODE_ENV === "production") {
  cspDirectives.reportUri = "/api/csp-report";
}

app.use(
  helmet.contentSecurityPolicy({
    directives: cspDirectives,
    // Report violations but don't block (for testing)
    reportOnly: process.env.NODE_ENV === "development",
  }),
);

// 2. CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : process.env.DEV_ORIGINS
      ? process.env.DEV_ORIGINS.split(",")
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
        ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: [
      "Content-Length",
      "Content-Type",
      "Content-Disposition",
      "X-Content-Type-Options",
    ], // Allow frontend to read download response headers
  }),
);

// 3. Data sanitization against NoSQL injection
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SECURITY] Potentially dangerous key detected: ${key}`);
      }
    },
  }),
);

// 3a. XSS Clean - Remove malicious HTML scripts
app.use(xssClean());

// 3b. HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// 3c. Additional Security Headers Middleware
app.use((req, res, next) => {
  // Strict-Transport-Security - Force HTTPS (only in production, 1 year)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  // Referrer-Policy - Control what referrer info is sent
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy - Restrict browser features
  res.setHeader(
    "Permissions-Policy",
    [
      "geolocation=()",
      "microphone=()",
      "camera=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
  );

  // Remove server header to avoid disclosing technology
  res.removeHeader("X-Powered-By");

  // Additional XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  next();
});

// 4. Cookie parser for secure token handling
app.use(cookieParser());

// 5. Request size limits
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 6. Compression middleware for faster downloads
// Compresses responses larger than 1KB
app.use(
  compression({
    level: 6, // Balanced compression level (0-9, default 6)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Skip compression for streaming/download endpoints (they handle their own compression)
      if (req.path.includes("/download")) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// ========== RATE LIMITING ==========
// Global rate limiter - applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health" || req.path === "/";
  },
});

// Apply global rate limiter to all requests (except excluded)
app.use(globalLimiter);

// Stricter rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?._id?.toString() || req.ip;
  },
  message: {
    success: false,
    message: "Too many uploads. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Store limiters for use in routes
app.locals.uploadLimiter = uploadLimiter;

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);

// Public config endpoint — intentionally unauthenticated.
// Only exposes non-sensitive, client-visible settings (e.g. sessionTimeoutMs).
// Do NOT add any sensitive server config here.
app.get("/api/config", (req, res) => {
  const sessionTimeoutMinutes =
    parseInt(process.env.SESSION_TIMEOUT_MINUTES, 10) || 20;
  res.json({
    success: true,
    data: {
      sessionTimeoutMs: sessionTimeoutMinutes * 60 * 1000,
    },
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduLattice API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "EduLattice API",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Only log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", err.stack);
  } else {
    // Production: Log only high-level info (timestamp, message, code)
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${err.code || "UNKNOWN"}`,
    );
  }

  // Validation errors (from express-validator)
  if (err.name === "ValidationError" || err.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid input provided",
    });
  }

  // JWT authentication errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }

  // Token expired
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token expired",
    });
  }

  // Multer file size errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 25MB",
    });
  }

  // Multer file type errors
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only documents and images are allowed.",
    });
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Too many files uploaded",
    });
  }

  // CSRF Token error
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      success: false,
      message: "Security verification failed",
    });
  }

  // Database errors
  if (err.name === "MongooseError" || err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Database error. Please try again.",
    });
  }

  // Default error - never expose internal error messages
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment
    ? err.message
    : "An error occurred. Please try again.";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `[SERVER] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

export default app;
