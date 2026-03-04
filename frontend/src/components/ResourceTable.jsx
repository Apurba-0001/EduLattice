import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const ResourceTable = ({
  resources,
  onDelete,
  showActions = true,
  isDeleting = false,
}) => {
  const { isAdmin } = useAuth();
  const [selectedResource, setSelectedResource] = useState(null);
  const [mobileActionPopup, setMobileActionPopup] = useState(null);

  const handleViewDetails = async (resource) => {
    try {
      // Track view count
      await api.post(`/resources/${resource._id}/view`);
    } catch (error) {
      // Don't block viewing if tracking fails
    }
    setSelectedResource(resource);
  };

  const handleDownload = async (resource) => {
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
        link.download = `${resource.title || "images"}.zip`;
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

  // Calculate total size for grouped resources
  const getGroupTotalSize = (resource) => {
    if (!resource.imageGroupId) return resource.fileSize || 0;
    // Use backend calculated size if available
    if (resource.imageGroupSize) return resource.imageGroupSize;
    // Fallback to frontend calculation
    return resources
      .filter((r) => r.imageGroupId === resource.imageGroupId)
      .reduce((total, r) => total + (r.fileSize || 0), 0);
  };

  const getGroupFileCount = (resource) => {
    if (!resource.imageGroupId) return 1;
    // Use backend calculated count if available
    if (resource.imageGroupCount) return resource.imageGroupCount;
    // Fallback to frontend calculation
    return resources.filter((r) => r.imageGroupId === resource.imageGroupId)
      .length;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full">
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tl-xl">
                Title
              </th>
              <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                Subject
              </th>
              <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                Type
              </th>
              <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                Uploaded
              </th>
              {showActions && (
                <th className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tr-xl">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {resources.map((resource) => (
              <tr
                key={resource._id}
                className="hover:bg-slate-100 transition-colors duration-150 cursor-pointer sm:cursor-default"
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setMobileActionPopup(resource);
                  }
                }}
              >
                <td className="px-3 sm:px-6 py-4">
                  <div className="text-sm font-medium text-slate-700">
                    {resource.title}
                    {resource.imageGroupId && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                        x{resource.imageGroupCount || 1}
                      </span>
                    )}
                  </div>
                  <div className="sm:hidden text-xs text-slate-500 mt-0.5 truncate max-w-[160px]">
                    {resource.subject}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">
                  {resource.subject}
                </td>
                <td className="px-3 sm:px-6 py-4">
                  <span
                    className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                    style={{
                      background:
                        resource.fileType === "pdf"
                          ? "linear-gradient(135deg, #ef4444, #dc2626)"
                          : resource.fileType === "ppt"
                            ? "linear-gradient(135deg, #f97316, #ea580c)"
                            : resource.fileType === "doc"
                              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                              : resource.fileType === "image"
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    }}
                  >
                    {resource.fileType}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">
                  {formatDate(resource.createdAt)}
                </td>
                {showActions && (
                  <td className="px-3 sm:px-6 py-4 text-center">
                    <div className="hidden sm:flex gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(resource);
                        }}
                        className="px-2 sm:px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-bold transition-colors"
                        title="Download resource"
                      >
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(resource);
                        }}
                        className="px-2 sm:px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs font-bold transition-colors"
                        title="View details"
                      >
                        Info
                      </button>
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(resource._id);
                          }}
                          disabled={isDeleting}
                          className={`px-2 sm:px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                            isDeleting
                              ? "opacity-50 cursor-not-allowed bg-slate-300 text-slate-400"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                          title="Delete resource"
                        >
                          {isDeleting ? "..." : "Delete"}
                        </button>
                      )}
                    </div>
                    <div className="sm:hidden">
                      <span className="text-xs text-slate-400">Tap row</span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-hidden">
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-none animate-slideUp"
            style={{
              backgroundColor: "var(--neu-bg)",
            }}
          >
            {/* Modal Header — keep indigo accent for contrast */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 sm:p-4 md:p-6 flex justify-between items-start gap-2 sm:gap-3 rounded-t-2xl">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold break-words line-clamp-3">
                      {selectedResource.title}
                    </h2>
                    {selectedResource.imageGroupId && (
                      <span className="inline-block px-2 py-1 bg-white/30 text-white rounded-full text-xs font-bold whitespace-nowrap">
                        {selectedResource.imageGroupCount || 1} images
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-xl sm:text-2xl hover:bg-white/20 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="min-w-0">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Subject
                  </label>
                  <p className="text-slate-700 font-medium text-sm sm:text-base md:text-lg mt-1 break-words">
                    {selectedResource.subject}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Semester
                  </label>
                  <p className="text-slate-700 font-medium text-sm sm:text-base md:text-lg mt-1 break-words">
                    {selectedResource.semester}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Resource Type
                  </label>
                  <p className="text-slate-700 font-medium text-sm sm:text-base md:text-lg mt-1 break-words">
                    {selectedResource.resourceType}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    File Type
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full font-bold text-xs ${getFileTypeBadgeColor(selectedResource.fileType)}`}
                    >
                      {selectedResource.fileType.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-slate-300/50" />

              {/* Description */}
              <div className="min-w-0">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                  Description
                </label>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed neu-inset rounded-xl p-3 sm:p-4 break-words">
                  {selectedResource.description}
                </p>
              </div>

              {/* Upload Details */}
              <div className="min-w-0">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2 sm:mb-3">
                  Upload Details
                </label>
                <div className="space-y-2 sm:space-y-3 neu-inset rounded-xl p-3 sm:p-4">
                  {isAdmin && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 min-w-0">
                      <span className="text-xs sm:text-sm text-slate-500 font-medium flex-shrink-0">
                        Uploaded By:
                      </span>
                      <div className="sm:text-right min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-slate-700 break-words">
                          {selectedResource.uploadedBy?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500 break-words">
                          {selectedResource.uploadedBy?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div
                    className={`${isAdmin ? "border-t border-slate-300/50 pt-2 sm:pt-3" : ""} flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 min-w-0`}
                  >
                    <span className="text-xs sm:text-sm text-slate-500 font-medium flex-shrink-0">
                      Upload Date:
                    </span>
                    <p className="font-semibold text-xs sm:text-sm text-slate-700 sm:text-right break-words">
                      {formatFullDate(selectedResource.createdAt)}
                    </p>
                  </div>
                  <div className="border-t border-slate-300/50 pt-2 sm:pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <span className="text-xs sm:text-sm text-slate-500 font-medium flex-shrink-0">
                      File Size:
                    </span>
                    <div className="text-right">
                      {selectedResource.imageGroupId ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-xs sm:text-sm text-slate-700">
                            {(
                              getGroupTotalSize(selectedResource) /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                          <p className="text-xs text-slate-500">
                            {getGroupFileCount(selectedResource)} file
                            {getGroupFileCount(selectedResource) !== 1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      ) : (
                        <p className="font-semibold text-xs sm:text-sm text-slate-700">
                          {(selectedResource.fileSize / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Group Information */}
                  {selectedResource.imageGroupId && (
                    <div className="border-t border-slate-300/50 pt-2 sm:pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <span className="text-xs sm:text-sm text-slate-500 font-medium flex-shrink-0">
                        Image Group:
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-xs sm:text-sm text-slate-700">
                          {getGroupFileCount(selectedResource)} image
                          {getGroupFileCount(selectedResource) !== 1
                            ? "s"
                            : ""}{" "}
                          grouped
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-slate-300/50 pt-2 sm:pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <span className="text-xs sm:text-sm text-slate-500 font-medium flex-shrink-0">
                      Views:
                    </span>
                    <p className="font-semibold text-xs sm:text-sm text-slate-700">
                      {selectedResource.views || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="border-t border-slate-300/50 p-3 sm:p-4 md:p-6"
              style={{ backgroundColor: "var(--neu-bg)" }}
            >
              <button
                onClick={() => handleDownload(selectedResource)}
                className="neu-btn-primary w-full py-4 sm:py-5 rounded-xl font-bold text-xs sm:text-base"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Action Popup */}
      {mobileActionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 sm:hidden">
          <div
            className="rounded-t-3xl w-full animate-slideUp"
            style={{
              backgroundColor: "var(--neu-bg)",
            }}
          >
            {/* Popup Header */}
            <div className="px-4 py-4 border-b border-slate-300/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-lg line-clamp-2 flex-1">
                {mobileActionPopup.title}
              </h3>
              <button
                onClick={() => setMobileActionPopup(null)}
                className="text-2xl text-slate-500 hover:text-slate-700 font-bold"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Popup Actions */}
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  handleDownload(mobileActionPopup);
                  setMobileActionPopup(null);
                }}
                className="neu-btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                title="Download resource"
              >
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  handleViewDetails(mobileActionPopup);
                  setMobileActionPopup(null);
                }}
                className="neu-btn text-indigo-600 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                title="View details"
              >
                <span>View Details</span>
              </button>
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(mobileActionPopup._id);
                    setMobileActionPopup(null);
                  }}
                  disabled={isDeleting}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                    isDeleting
                      ? "opacity-50 cursor-not-allowed neu-btn text-slate-400"
                      : "neu-btn-danger"
                  }`}
                  title="Delete resource"
                >
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceTable;
