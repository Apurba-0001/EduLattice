import { v2 as cloudinary } from "cloudinary";

class CloudinaryService {
  constructor() {
    // Delay initialization until first use
    this.initialized = false;
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.initializeCloudinary();
      this.initialized = true;
    }
  }

  initializeCloudinary() {
    try {
      const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      };

      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("[CLOUDINARY] Configuration check:", {
          cloud_name: config.cloud_name ? "✓ Set" : "✗ Missing",
          api_key: config.api_key ? "✓ Set" : "✗ Missing",
          api_secret: config.api_secret ? "✓ Set" : "✗ Missing",
        });
      }

      cloudinary.config(config);
      if (process.env.NODE_ENV === "development") {
        console.log("[CLOUDINARY] Initialized successfully");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[CLOUDINARY] Initialization error:",
          error.code || error.message,
        );
      }
    }
  }

  async uploadImage(fileBuffer, fileName) {
    try {
      // Ensure Cloudinary is initialized with loaded env variables
      this.ensureInitialized();
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "edulattice",
            resource_type: "image",
            public_id: `${Date.now()}_${fileName.split(".")[0]}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              if (process.env.NODE_ENV === "development") {
                console.error(
                  "[CLOUDINARY] Stream error:",
                  error.code || error.message,
                );
              }
              reject(new Error("File upload failed. Please try again."));
            } else {
              resolve({
                publicId: result.public_id,
                fileUrl: result.secure_url,
                fileName: fileName,
              });
            }
          },
        );

        uploadStream.on("error", (error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Upload stream error:", error.message);
          }
          reject(new Error("File upload failed. Please try again."));
        });

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[CLOUDINARY] Upload error:",
          error.code || error.message,
        );
      }
      throw new Error("File upload failed. Please try again.");
    }
  }

  async uploadDocument(fileBuffer, fileName, mimeType) {
    try {
      // Ensure Cloudinary is initialized with loaded env variables
      this.ensureInitialized();
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "edulattice",
            resource_type: "raw", // For non-image files (PDFs, DOCs, PPTs)
            public_id: `${Date.now()}_${fileName.split(".")[0]}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              if (process.env.NODE_ENV === "development") {
                console.error(
                  "Cloudinary document upload error:",
                  error.message,
                );
              }
              reject(new Error("Document upload failed. Please try again."));
            } else {
              resolve({
                publicId: result.public_id,
                fileUrl: result.secure_url,
                fileName: fileName,
              });
            }
          },
        );

        uploadStream.on("error", (error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Upload stream error:", error.message);
          }
          reject(new Error("Document upload failed. Please try again."));
        });

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error uploading document to Cloudinary:", error.message);
      }
      throw new Error("Document upload failed. Please try again.");
    }
  }

  async deleteImage(publicId) {
    try {
      // Ensure Cloudinary is initialized with loaded env variables
      this.ensureInitialized();

      if (process.env.NODE_ENV === "development") {
        console.log("Cloudinary delete attempt");
      }

      // Try deleting as image first
      let result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });
      if (process.env.NODE_ENV === "development") {
        console.log(`Image delete result: ${result.result}`);
      }

      // If image deletion didn't work (not found), try as raw (document)
      if (result.result !== "ok") {
        if (process.env.NODE_ENV === "development") {
          console.log(`Trying to delete as raw resource...`);
        }
        result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
          invalidate: true,
        });
        if (process.env.NODE_ENV === "development") {
          console.log(`Raw delete result: ${result.result}`);
        }
      }

      // "not found" means file doesn't exist (maybe already deleted) - that's acceptable
      if (result.result === "ok" || result.result === "not found") {
        return { success: true, message: "File deleted from Cloudinary" };
      } else {
        throw new Error("File deletion failed. Please try again.");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting from Cloudinary:", error.message);
      }
      throw new Error("File deletion failed. Please try again.");
    }
  }
}

export default new CloudinaryService();
