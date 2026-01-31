import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ResourceTable = ({ resources, onDelete, showActions = true }) => {
  const { isAdmin } = useAuth();
  const [selectedResource, setSelectedResource] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [mobileActionPopup, setMobileActionPopup] = useState(null);

  const handleDownload = (resource) => {
    try {
      let downloadUrl = "";
      let fileName = resource.fileName || resource.title || "download";

      if (resource.fileType === "image" && resource.fileUrl) {
        const cloudinaryUrl = new URL(resource.fileUrl);
        const pathParts = cloudinaryUrl.pathname.split("/");
        const uploadIndex = pathParts.indexOf("upload");

        if (uploadIndex !== -1) {
          pathParts.splice(uploadIndex + 1, 0, "fl_attachment");
          downloadUrl = cloudinaryUrl.origin + pathParts.join("/");
        } else {
          downloadUrl = resource.fileUrl;
        }
      } else if (resource.driveFileId) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${resource.driveFileId}`;
      } else if (resource.fileUrl) {
        downloadUrl = resource.fileUrl;
      }

      if (!downloadUrl) {
        alert(
          "Download URL not available for this file. Please contact support.",
        );
        return;
      }

      window.open(downloadUrl, "_blank", "noopener=yes");
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
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
        <div className="sm:hidden text-xs text-gray-500 text-center mb-3 py-2 bg-blue-50 rounded font-medium">
          ← Swipe to scroll table →
        </div>

        {/* Table container with horizontal scroll - improved for mobile */}
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full" style={{ minWidth: "800px" }}>
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap min-w-[200px]">
                  📌 Title
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap min-w-[150px]">
                  📚 Subject
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap min-w-[130px]">
                  📅 Semester
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap min-w-[160px]">
                  📖 Resource Type
                </th>
                {showActions && (
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap sticky right-0 bg-gradient-to-r from-indigo-50 to-purple-50 z-10 min-w-[200px]">
                    ⚙️ Actions
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
                      // Show popup on mobile only
                      if (window.innerWidth < 768) {
                        setMobileActionPopup(resource);
                      }
                    }}
                    className={`border-b border-gray-200 transition-colors sm:hover:bg-indigo-50 sm:cursor-default cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* Title */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 min-w-[200px]">
                      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                        <span className="line-clamp-2 overflow-hidden">
                          {resource.title}
                        </span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 min-w-[150px]">
                      <span className="line-clamp-1">{resource.subject}</span>
                    </td>

                    {/* Semester */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 min-w-[130px]">
                      <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-xs">
                        {resource.semester}
                      </span>
                    </td>

                    {/* Resource Type */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 min-w-[160px]">
                      <span className="inline-block px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium text-xs">
                        {resource.resourceType}
                      </span>
                    </td>

                    {/* Actions */}
                    {showActions && (
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 sticky right-0 bg-white z-10 min-w-[220px] border-l-2 border-gray-100">
                        <div className="flex gap-1 sm:gap-2 justify-center flex-nowrap flex-wrap">
                          <button
                            onClick={() => handleDownload(resource)}
                            className="px-2 sm:px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 active:scale-95 text-xs sm:text-sm whitespace-nowrap min-h-10 sm:min-h-10 shadow-md"
                            title="Download resource"
                          >
                            <span className="hidden sm:inline">
                              📥 Download
                            </span>
                            <span className="sm:hidden">📥</span>
                          </button>
                          <button
                            onClick={() => setSelectedResource(resource)}
                            className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-all duration-300 active:scale-95 text-xs sm:text-sm whitespace-nowrap min-h-10 sm:min-h-10 shadow-md"
                            title="View details"
                          >
                            <span className="hidden sm:inline">ℹ️ Info</span>
                            <span className="sm:hidden">ℹ️</span>
                          </button>
                          {onDelete && (
                            <button
                              onClick={() => onDelete(resource._id)}
                              className="px-2 sm:px-3 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-all duration-300 active:scale-95 text-xs sm:text-sm whitespace-nowrap min-h-10 sm:min-h-10 shadow-md"
                              title="Delete resource"
                            >
                              <span className="hidden sm:inline">
                                🗑️ Delete
                              </span>
                              <span className="sm:hidden">🗑️</span>
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

      {/* Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 sm:p-4 md:p-6 flex justify-between items-start gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg md:text-2xl font-bold break-words line-clamp-3">
                    {selectedResource.title}
                  </h2>
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
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
                    📚 Subject
                  </label>
                  <p className="text-gray-900 font-medium text-sm sm:text-base md:text-lg mt-1 break-words">
                    {selectedResource.subject}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
                    📅 Semester
                  </label>
                  <p className="text-gray-900 font-medium text-sm sm:text-base md:text-lg mt-1 break-words">
                    {selectedResource.semester}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
                    📖 Resource Type
                  </label>
                  <p className="text-gray-900 font-medium text-sm sm:text-base md:text-lg mt-1 break-words">
                    {selectedResource.resourceType}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
                    📄 File Type
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
              <hr className="border-gray-200" />

              {/* Description */}
              <div className="min-w-0">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                  📝 Description
                </label>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-lg break-words">
                  {selectedResource.description}
                </p>
              </div>

              {/* Upload Details */}
              <div className="min-w-0">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2 sm:mb-3">
                  ℹ️ Upload Details
                </label>
                <div className="space-y-2 sm:space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                  {isAdmin && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 min-w-0">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">
                        👤 Uploaded By:
                      </span>
                      <div className="sm:text-right min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-gray-900 break-words">
                          {selectedResource.uploadedBy?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-600 break-words">
                          {selectedResource.uploadedBy?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div
                    className={`${isAdmin ? "border-t border-gray-200 pt-2 sm:pt-3" : ""} flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 min-w-0`}
                  >
                    <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">
                      📆 Upload Date:
                    </span>
                    <p className="font-semibold text-xs sm:text-sm text-gray-900 sm:text-right break-words">
                      {formatFullDate(selectedResource.createdAt)}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-2 sm:pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">
                      📦 File Size:
                    </span>
                    <p className="font-semibold text-xs sm:text-sm text-gray-900">
                      {(selectedResource.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-2 sm:pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">
                      👁️ Views:
                    </span>
                    <p className="font-semibold text-xs sm:text-sm text-gray-900">
                      {selectedResource.views || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 md:p-6">
              <button
                onClick={() => handleDownload(selectedResource)}
                className="w-full px-3 sm:px-6 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 active:scale-95 text-xs sm:text-base"
              >
                <span className="hidden sm:inline">📥 Download</span>
                <span className="sm:hidden">📥 Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Action Popup */}
      {mobileActionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 sm:hidden">
          <div className="bg-white rounded-t-3xl w-full animate-slideUp shadow-2xl">
            {/* Popup Header */}
            <div className="px-4 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg line-clamp-2 flex-1">
                {mobileActionPopup.title}
              </h3>
              <button
                onClick={() => setMobileActionPopup(null)}
                className="text-2xl text-gray-500 hover:text-gray-700 font-bold"
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
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-md"
                title="Download resource"
              >
                <span className="text-xl">📥</span>
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  setSelectedResource(mobileActionPopup);
                  setMobileActionPopup(null);
                }}
                className="w-full px-4 py-3 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-md"
                title="View details"
              >
                <span className="text-xl">ℹ️</span>
                <span>View Details</span>
              </button>
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(mobileActionPopup._id);
                    setMobileActionPopup(null);
                  }}
                  className="w-full px-4 py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-md"
                  title="Delete resource"
                >
                  <span className="text-xl">🗑️</span>
                  <span>Delete</span>
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
