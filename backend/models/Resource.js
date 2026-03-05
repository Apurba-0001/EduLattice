import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const resourceSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    resourceType: {
      type: String,
      enum: [
        "Class Notes",
        "Module",
        "Assignment",
        "Presentation",
        "Exam Suggestion",
        "Book",
        "Lab Experiment",
        "Other",
      ],
      required: [true, "Resource Type is required"],
    },
    fileType: {
      type: String,
      required: true,
      enum: ["pdf", "ppt", "doc", "excel", "image"],
    },
    imageGroupId: {
      type: String,
      default: null,
      index: true,
    },
    imageGroupCount: {
      type: Number,
      default: 1,
    },
    imageGroupSize: {
      type: Number,
      default: 0,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      required: true,
    },
    storageFileName: {
      type: String,
      required: true,
      unique: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        // Strip internal storage fields from API responses
        delete ret.cloudinaryPublicId;
        delete ret.storageFileName;
        return ret;
      },
    },
  },
);

// Indexes for faster search queries
// Text index for full-text search
resourceSchema.index({
  title: "text",
  description: "text",
  subject: "text",
  resourceType: "text",
});

// Indexes for filtered queries
resourceSchema.index({ subject: 1, semester: 1 });
resourceSchema.index({ resourceType: 1 });
resourceSchema.index({ semester: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ createdAt: -1 }); // For sorting by latest
resourceSchema.index({ title: 1 }); // For title searches
resourceSchema.index({ subject: 1, semester: 1, resourceType: 1 }); // Combined filter index
resourceSchema.index({ downloads: -1 }); // For popular resources
resourceSchema.index({ views: -1 }); // For most viewed resources
resourceSchema.index({ isArchived: 1 }); // For filtering archived resources

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
