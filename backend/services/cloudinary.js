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

      console.log("Cloudinary Config:", {
        cloud_name: config.cloud_name ? "✓ Set" : "✗ Missing",
        api_key: config.api_key ? "✓ Set" : "✗ Missing",
        api_secret: config.api_secret ? "✓ Set" : "✗ Missing",
      });

      cloudinary.config(config);
      console.log("Cloudinary initialized successfully");
    } catch (error) {
      console.error("Error initializing Cloudinary:", error.message);
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
              console.error("Cloudinary stream error:", error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
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
          console.error("Upload stream error:", error);
          reject(new Error(`Upload stream failed: ${error.message}`));
        });

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error.message);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async deleteImage(publicId) {
    try {
      // Ensure Cloudinary is initialized with loaded env variables
      this.ensureInitialized();
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        return { success: true, message: "Image deleted from Cloudinary" };
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error.message);
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }
}

export default new CloudinaryService();
