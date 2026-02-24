import React, { useState } from "react";
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
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [mobileActionPopup, setMobileActionPopup] = useState(null);

  const handleViewDetails = async (resource) => {
    try {
      // Track view count
      await api.post(`/resources/${resource._id}/view`);
    } catch (error) {
      console.error("Failed to track view:", error);
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
        console.log(
          `📦 Downloading grouped images with groupId: ${resource.imageGroupId}`,
        );
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
      console.error("Download error:", error);
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
      <div className="w-full overflow-hidden">
        {/* Mobile scroll indicator */}
        <div className="sm:hidden text-xs text-slate-500 text-center mb-3 py-2 neu-inset rounded-xl font-medium">
          ← Swipe to scroll table →
        </div>

        {/* Table container — shadow wrapper + clip wrapper */}
        <div style={{ boxShadow: "var(--neu-raised)" }}>
          <div
            className="rounded-2xl overflow-hidden -mx-4 sm:mx-0"
            style={{
              border: "1px solid rgba(184, 192, 204, 0.5)",
            }}
          >
            <div className="overflow-x-auto">
              <table
                className="w-full"
                style={{
                  minWidth: "800px",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }}
              >
                {/* Table Header */}
                <thead>
                  <tr
                    style={{
                      boxShadow: "inset 0 -1px 0 rgba(184, 192, 204, 0.6)",
                    }}
                  >
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap min-w-[200px]">
                      Title
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap min-w-[150px]">
                      Subject
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap min-w-[130px]">
                      Semester
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap min-w-[160px]">
                      Resource Type
                    </th>
                    {showActions && (
                      <th
                        className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap min-w-[200px]"
                        style={{
                          borderLeft: "1px solid rgba(184, 192, 204, 0.5)",
                          boxShadow: "inset 0 -1px 0 rgba(184, 192, 204, 0.6)",
                        }}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {resources.map((resource, index) => (
                    <React.Fragment key={resource._id}>
                      <tr
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setMobileActionPopup(resource);
                          }
                        }}
                        className="transition-colors sm:cursor-default cursor-pointer"
                        style={{
                          boxShadow: "inset 0 -1px 0 rgba(184, 192, 204, 0.5)",
                        }}
                        onMouseEnter={(e) => {
                          if (window.innerWidth >= 640)
                            e.currentTarget.style.backgroundColor =
                              "var(--neu-bg-dark)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
                        {/* Title */}
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-700 min-w-[200px]">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-wrap">
                            <span className="line-clamp-2 overflow-hidden">
                              {resource.title}
                            </span>
                            {resource.imageGroupId && (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0">
                                x{resource.imageGroupCount || 1} files
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 min-w-[150px]">
                          <span className="line-clamp-1">
                            {resource.subject}
                          </span>
                        </td>

                        {/* Semester */}
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 min-w-[130px]">
                          <span className="inline-block px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium text-xs">
                            {resource.semester}
                          </span>
                        </td>

                        {/* Resource Type */}
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 min-w-[160px]">
                          <span className="inline-block px-2 sm:px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-medium text-xs">
                            {resource.resourceType}
                          </span>
                        </td>

                        {/* Actions */}
                        {showActions && (
                          <td
                            className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 min-w-[220px]"
                            style={{
                              borderLeft: "1px solid rgba(184, 192, 204, 0.5)",
                              boxShadow:
                                "inset 0 -1px 0 rgba(184, 192, 204, 0.5)",
                            }}
                          >
                            <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                              <button
                                onClick={() => handleDownload(resource)}
                                className="neu-btn-primary px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap"
                                title="Download resource"
                              >
                                <span className="hidden sm:inline">
                                  Download
                                </span>
                                <span className="sm:hidden">↓</span>
                              </button>
                              <button
                                onClick={() => handleViewDetails(resource)}
                                className="neu-btn px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap text-indigo-600"
                                title="View details"
                              >
                                <span className="hidden sm:inline">Info</span>
                                <span className="sm:hidden">i</span>
                              </button>
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(resource._id)}
                                  disabled={isDeleting}
                                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                                    isDeleting
                                      ? "opacity-50 cursor-not-allowed neu-btn text-slate-400"
                                      : "neu-btn-danger"
                                  }`}
                                  title="Delete resource"
                                >
                                  <span className="hidden sm:inline">
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </span>
                                  <span className="sm:hidden">✕</span>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
