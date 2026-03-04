import api from "../utils/api";

const ResourceListItem = ({ resource, onDelete, showActions = true }) => {
  const handleDownload = async () => {
    try {
      if (!resource._id) {
        alert("Resource ID not found");
        return;
      }

      const fileName = resource.fileName || resource.title || "download";

      // Check if this is a grouped image - if so, download the entire group as zip
      if (resource.imageGroupId) {
        // Grouped image download
        const response = await api.get(
          `/resources/${resource._id}/download-group`,
          {
            responseType: "blob",
          },
        );

        // Create blob URL and download zip
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resource.title || "images"}_group.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Single file download
        const response = await api.get(`/resources/${resource._id}/download`, {
          responseType: "blob",
        });

        // Create blob URL and download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert("Failed to download file. Please try again.");
    }
  };

  const getFileTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "ppt":
        return "📊";
      case "doc":
        return "📝";
      case "excel":
        return "📊";
      case "image":
        return "🖼️";
      default:
        return "📁";
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
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* List Item Container */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
        {/* File Icon and Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-2xl sm:text-3xl flex-shrink-0">
            {getFileTypeIcon(resource.fileType)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate hover:text-indigo-600 transition-colors">
              {resource.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {resource.description?.substring(0, 60)}
              {resource.description?.length > 60 ? "..." : ""}
            </p>
          </div>
        </div>

        {/* Metadata - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">SUBJECT</p>
            <p className="text-sm font-semibold text-gray-900">
              {resource.subject?.substring(0, 15)}
              {resource.subject?.length > 15 ? "..." : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">SEMESTER</p>
            <p className="text-sm font-semibold text-gray-900">
              {resource.semester}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">TYPE</p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getFileTypeBadgeColor(resource.fileType)}`}
            >
              {resource.fileType.toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">RESOURCE</p>
            <p className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
              {resource.resourceType?.substring(0, 12)}
              {resource.resourceType?.length > 12 ? "..." : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">UPLOADED</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(resource.createdAt)}
            </p>
          </div>
        </div>

        {/* Mobile Metadata */}
        <div className="md:hidden flex flex-wrap gap-2">
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${getFileTypeBadgeColor(resource.fileType)}`}
          >
            {resource.fileType.toUpperCase()}
          </span>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {resource.resourceType}
          </span>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 active:scale-95 text-xs sm:text-sm whitespace-nowrap"
              title="Download resource"
            >
              📥 <span className="hidden sm:inline">Download</span>
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(resource._id)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-all duration-300 active:scale-95 text-xs sm:text-sm whitespace-nowrap"
                title="Delete resource"
              >
                🗑️ <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceListItem;
