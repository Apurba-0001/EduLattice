import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    fileType: {
      type: String,
      required: true,
      enum: ["pdf", "ppt", "doc", "image"],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    driveFileId: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  },
);

// Index for faster search queries
resourceSchema.index({
  title: "text",
  description: "text",
  subject: "text",
  tags: "text",
});
resourceSchema.index({ subject: 1, semester: 1 });
resourceSchema.index({ uploadedBy: 1 });

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
