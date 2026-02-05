import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "./models/Resource.js";

dotenv.config();

const handleLegacyDriveFiles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all Google Drive resources (legacy files)
    const driveResources = await Resource.find({
      driveFileId: { $exists: true, $ne: null },
    });

    console.log(
      `\nFound ${driveResources.length} Google Drive (legacy) resources\n`,
    );

    let archived = 0;
    let deleted = 0;

    console.log("Options:");
    console.log(
      "1. Archive these resources (mark as archived, keep in database)",
    );
    console.log("2. Delete these resources completely");
    console.log("\nGoogle Drive resources:");

    for (const resource of driveResources) {
      console.log(`  - ${resource.fileName} (${resource.title})`);
      console.log(`    Uploaded by: ${resource.uploadedBy}`);
      console.log(`    Drive ID: ${resource.driveFileId}`);
      console.log(
        `    Created: ${new Date(resource.createdAt).toLocaleDateString()}\n`,
      );
    }

    // Auto-archive for now (safer approach)
    const archiveResult = await Resource.updateMany(
      { driveFileId: { $exists: true, $ne: null } },
      { isArchived: true },
    );

    archived = archiveResult.modifiedCount;
    console.log(`\n✅ Archived ${archived} Google Drive resources`);
    console.log("\n📝 Note: These resources are now marked as archived.");
    console.log("   They won't appear in search results but won't be deleted.");
    console.log(
      "   If you want to delete them, run with LEGACY_DELETE=true environment variable.",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

handleLegacyDriveFiles();
