import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "./models/Resource.js";

dotenv.config();

const backfillCloudinaryPublicId = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all Cloudinary resources without cloudinaryPublicId
    const resources = await Resource.find({
      cloudinaryPublicId: { $in: [null, ""] },
      fileUrl: { $regex: "cloudinary" },
    });

    console.log(`\nFound ${resources.length} resources to backfill`);

    let updated = 0;
    let failed = 0;

    for (const resource of resources) {
      try {
        // Extract publicId from Cloudinary URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/edulattice/filename.ext
        const url = new URL(resource.fileUrl);
        const pathParts = url.pathname.split("/");
        const edulatticeIndex = pathParts.indexOf("edulattice");
        
        if (edulatticeIndex !== -1) {
          const fileNameWithExt = pathParts[edulatticeIndex + 1];
          const fileName = fileNameWithExt.split(".")[0];
          const publicId = `edulattice/${fileName}`;

          // Update the resource
          await Resource.findByIdAndUpdate(
            resource._id,
            { cloudinaryPublicId: publicId },
            { new: true }
          );

          console.log(`✅ Updated: ${resource.fileName}`);
          console.log(`   PublicId: ${publicId}`);
          updated++;
        } else {
          console.log(`❌ Failed to extract publicId from: ${resource.fileUrl}`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ Error processing ${resource.fileName}: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Backfill Summary:`);
    console.log(`   Total: ${resources.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

backfillCloudinaryPublicId();
