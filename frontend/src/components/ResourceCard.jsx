const ResourceCard = ({ resource, onDelete, showActions = true }) => {
  const handleDownload = () => {
    try {
      let downloadUrl = "";
      // Use fileName from backend which is already title + extension
      let fileName = resource.fileName || resource.title || "download";

      // For images: use Cloudinary URL with attachment flag to force download
      if (resource.fileType === "image" && resource.fileUrl) {
        // Add fl_attachment flag to Cloudinary URL to force download
        const cloudinaryUrl = new URL(resource.fileUrl);
        const pathParts = cloudinaryUrl.pathname.split("/");
        const uploadIndex = pathParts.indexOf("upload");

        if (uploadIndex !== -1) {
          // Insert transformation before the file path
          pathParts.splice(uploadIndex + 1, 0, "fl_attachment");
          downloadUrl = cloudinaryUrl.origin + pathParts.join("/");
        } else {
          downloadUrl = resource.fileUrl;
        }
      }
      // For documents: use Cloudinary URL directly
      else if (resource.fileUrl) {
        downloadUrl = resource.fileUrl;
      }

      if (!downloadUrl) {
        alert(
          "Download URL not available for this file. Please contact support.",
        );
        return;
      }

      // Use window.open with correct approach for forcing downloads
      window.open(downloadUrl, "_blank", "noopener=yes");
    } catch (error) {
      alert("Failed to download file");
    }
  };

  const getFileTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "ppt":
        return "🎥";
      case "doc":
        return "📝";
      case "excel":
        return "📊";
      case "image":
        return "🖼️";
      default:
        return "📦";
    }
  };

  const getFileTypeBadgeColor = (type) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-700";
      case "ppt":
        return "bg-orange-100 text-orange-700";
      case "doc":
        return "bg-blue-100 text-blue-700";
      case "excel":
        return "bg-green-100 text-green-700";
      case "image":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 transform animate-slideUp group">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <span className="text-3xl sm:text-4xl flex-shrink-0">
              {getFileTypeIcon(resource.fileType)}
            </span>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {resource.title}
            </h3>
          </div>
          <span
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${getFileTypeBadgeColor(resource.fileType)}`}
          >
            {resource.fileType.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Description */}
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-3">
          {resource.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-5 py-3 sm:py-5 border-t border-b border-gray-200">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1 sm:mb-2">
              Subject
            </span>
            <p className="text-gray-900 font-medium text-sm">
              {resource.subject}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1 sm:mb-2">
              Semester
            </span>
            <p className="text-gray-900 font-medium text-sm">
              {resource.semester}
            </p>
          </div>
        </div>

        {/* Resource Type */}
        {resource.resourceType && (
          <div className="mb-4 sm:mb-5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1 sm:mb-2">
              Resource Type
            </span>
            <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold">
              {resource.resourceType}
            </span>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 sm:pt-4 border-t border-gray-200 gap-2 text-xs sm:text-sm text-gray-600">
          <div className="min-w-0">
            <span className="font-medium block truncate">
              📤 {resource.uploadedBy?.name || "Unknown"}
            </span>
          </div>
          <div className="text-gray-500 flex-shrink-0">
            <span>{formatDate(resource.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex gap-3 sm:gap-4 flex-col sm:flex-row">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 active:scale-95 text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
          >
            📥 Download
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-all duration-300 active:scale-95 text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
