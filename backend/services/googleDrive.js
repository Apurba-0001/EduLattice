import { google } from "googleapis";
import { Readable } from "stream";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleDriveService {
  constructor() {
    this.driveClient = null;
    this.initializeDrive();
  }

  initializeDrive() {
    try {
      const keyPath = path.join(__dirname, "..", "service-account-key.json");

      const auth = new google.auth.GoogleAuth({
        keyFile: keyPath,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });

      this.driveClient = google.drive({ version: "v3", auth });
      console.log("Google Drive API initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Drive:", error.message);
    }
  }

  async uploadFile(fileBuffer, fileName, mimeType) {
    try {
      if (!this.driveClient) {
        throw new Error("Google Drive client not initialized");
      }

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);

      const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      const media = {
        mimeType: mimeType,
        body: bufferStream,
      };

      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, webViewLink, webContentLink",
      });

      // Make file publicly accessible
      await this.driveClient.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      // Get the file with webViewLink
      const file = await this.driveClient.files.get({
        fileId: response.data.id,
        fields: "id, name, webViewLink, webContentLink",
      });

      return {
        fileId: file.data.id,
        fileName: file.data.name,
        fileUrl:
          file.data.webViewLink ||
          `https://drive.google.com/file/d/${file.data.id}/view`,
      };
    } catch (error) {
      console.error("Error uploading to Google Drive:", error.message);
      throw new Error(`Google Drive upload failed: ${error.message}`);
    }
  }

  async deleteFile(fileId) {
    try {
      if (!this.driveClient) {
        throw new Error("Google Drive client not initialized");
      }

      await this.driveClient.files.delete({
        fileId: fileId,
      });

      return { success: true, message: "File deleted from Google Drive" };
    } catch (error) {
      console.error("Error deleting from Google Drive:", error.message);
      throw new Error(`Google Drive deletion failed: ${error.message}`);
    }
  }
}

export default new GoogleDriveService();
