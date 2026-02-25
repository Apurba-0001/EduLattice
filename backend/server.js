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
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ========== SECURITY MIDDLEWARE ==========

// 1. Helmet for security headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }),
);

// 2. CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
          ],
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

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);

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
    message: "Welcome to EduLattice API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      resources: "/api/resources",
      health: "/api/health",
    },
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

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 25MB",
    });
  }

  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // CSRF Token error
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      success: false,
      message: "Invalid security token. Please try again.",
    });
  }

  // In production, don't expose error messages
  const message =
    process.env.NODE_ENV === "production"
      ? "An error occurred. Please try again."
      : err.message || "Internal server error";

  res.status(err.status || 500).json({
    success: false,
    message: message,
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
