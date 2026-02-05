import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { SEMESTERS, getSubjectsBySemester } from "../constants/curriculum";

const Upload = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    resourceType: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const fileInputRef = useRef(null);

  // Helper function to determine if file is image
  const isImageFile = (file) => {
    return file.type.startsWith("image/");
  };

  // Helper function to validate file type
  const validateFileType = (file) => {
    const allowedTypes = [
      // PDF
      "application/pdf",
      // PowerPoint
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.presentation",
      "application/vnd.apple.keynote",
      // Word
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
      "application/vnd.apple.pages",
      "text/plain",
      "application/rtf",
      // Excel
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/x-excel",
      "application/x-msexcel",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.apple.numbers",
      "text/csv",
      // Images - Common formats
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/x-tiff",
      "image/svg+xml",
      // Images - Modern formats
      "image/heic",
      "image/heif",
      "image/avif",
    ];
    return allowedTypes.includes(file.type);
  };

  // Helper function to check for dangerous file types (security)
  const isDangerousFile = (filename) => {
    const dangerousExtensions = [
      // Windows executables
      ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".pif", ".vbs", ".vbe",
      // Linux/Unix executables
      ".sh", ".bash", ".ksh", ".csh", ".run", ".elf",
      // Mac executables
      ".app", ".dmg", ".pkg",
      // Java
      ".jar", ".jnlp", ".class",
      // Archives (can contain executables)
      ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".iso", ".cab", ".arj", ".ace",
      // Libraries (can be dangerous)
      ".dll", ".so", ".dylib", ".o", ".a", ".lib",
      // Scripts (can be dangerous)
      ".js", ".vbs", ".ps1", ".psm1", ".psd1", ".wsh",
      // System files
      ".sys", ".drv", ".ko", ".dbg",
      // Office macros
      ".docm", ".xlsm", ".pptm",
    ];

    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    if (dangerousExtensions.includes(ext)) {
      return true;
    }

    // Check for double extensions (e.g., image.jpg.exe)
    const parts = filename.split(".");
    if (parts.length > 2) {
      for (let dangerous of dangerousExtensions) {
        if (filename.toLowerCase().includes(dangerous)) {
          return true;
        }
      }
    }

    return false;
  };

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If semester changes, update subject options and reset subject
    if (name === "semester") {
      setSubjectOptions(getSubjectsBySemester(value));
      setFormData({
        ...formData,
        semester: value,
        subject: "", // Reset subject when semester changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      setFiles([]);
      return;
    }

    // Convert FileList to Array
    const filesArray = Array.from(selectedFiles);

    // SECURITY: Check for dangerous files
    for (let file of filesArray) {
      if (isDangerousFile(file.name)) {
        setError(`File type not supported: "${file.name}"`);
        setFiles([]);
        e.target.value = "";
        return;
      }
    }

    // Validate all files
    for (let file of filesArray) {
      if (!validateFileType(file)) {
        setError(
          "Invalid file type. Allowed: PDF, PPT, PPTX, ODP, Keynote, DOC, DOCX, ODT, TXT, RTF, Pages, XLS, XLSX, ODS, CSV, Numbers, JPG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, AVIF"
        );
        setFiles([]);
        e.target.value = "";
        return;
      }
    }

    // Determine if all files are images or all are documents
    const allImages = filesArray.every(isImageFile);
    const allDocuments = filesArray.every((file) => !isImageFile(file));

    // Check for mixed file types
    if (!allImages && !allDocuments) {
      setError(
        "Cannot upload images and documents together. Please upload them separately."
      );
      setFiles([]);
      e.target.value = "";
      return;
    }

    // Check file count limits
    if (allImages && filesArray.length > 5) {
      setError("Maximum 5 images can be uploaded at once");
      setFiles([]);
      e.target.value = "";
      return;
    }

    if (allDocuments && filesArray.length > 1) {
      setError("Only 1 document can be uploaded at a time");
      setFiles([]);
      e.target.value = "";
      return;
    }

    // Check file sizes (individual and collective)
    let totalSize = 0;
    const maxIndividualImageSize = 10 * 1024 * 1024; // 10MB per image
    const maxTotalImageSize = 5 * 10 * 1024 * 1024; // 50MB total for 5 images
    const maxDocumentSize = 25 * 1024 * 1024; // 25MB per document

    for (let file of filesArray) {
      totalSize += file.size;

      // Check individual file size
      if (isImageFile(file) && file.size > maxIndividualImageSize) {
        setError(
          `Image "${file.name}" exceeds size limit. Max per image: 10MB`
        );
        setFiles([]);
        e.target.value = "";
        return;
      } else if (!isImageFile(file) && file.size > maxDocumentSize) {
        setError(
          `Document "${file.name}" exceeds size limit. Max per document: 25MB`
        );
        setFiles([]);
        e.target.value = "";
        return;
      }
    }

    // Check collective size limit
    if (allImages && totalSize > maxTotalImageSize) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      setError(
        `Total size of all images (${totalMB}MB) exceeds limit. Max: 50MB for 5 images`
      );
      setFiles([]);
      e.target.value = "";
      return;
    }

    if (allDocuments && totalSize > maxDocumentSize) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      setError(
        `Document size (${totalMB}MB) exceeds limit. Max: 25MB`
      );
      setFiles([]);
      e.target.value = "";
      return;
    }

    // All validations passed
    setFiles(filesArray);
    setError("");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    // Convert FileList to Array
    const filesArray = Array.from(droppedFiles);

    // SECURITY: Check for dangerous files
    for (let file of filesArray) {
      if (isDangerousFile(file.name)) {
        setError(`File type not supported: "${file.name}"`);
        setFiles([]);
        return;
      }
    }

    // Validate all files
    for (let file of filesArray) {
      if (!validateFileType(file)) {
        setError(
          "Invalid file type. Allowed: PDF, PPT, DOCX, XLS, XLSX, JPG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, AVIF"
        );
        setFiles([]);
        return;
      }
    }

    // Determine if all files are images or all are documents
    const allImages = filesArray.every(isImageFile);
    const allDocuments = filesArray.every((file) => !isImageFile(file));

    // Check for mixed file types
    if (!allImages && !allDocuments) {
      setError(
        "Cannot upload images and documents together. Please upload them separately."
      );
      setFiles([]);
      return;
    }

    // Check file count limits
    if (allImages && filesArray.length > 5) {
      setError("Maximum 5 images can be uploaded at once");
      setFiles([]);
      return;
    }

    if (allDocuments && filesArray.length > 1) {
      setError("Only 1 document can be uploaded at a time");
      setFiles([]);
      return;
    }

    // Check file sizes (individual and collective)
    let totalSize = 0;
    const maxIndividualImageSize = 10 * 1024 * 1024; // 10MB per image
    const maxTotalImageSize = 5 * 10 * 1024 * 1024; // 50MB total for 5 images
    const maxDocumentSize = 25 * 1024 * 1024; // 25MB per document

    for (let file of filesArray) {
      totalSize += file.size;

      // Check individual file size
      if (isImageFile(file) && file.size > maxIndividualImageSize) {
        setError(
          `Image "${file.name}" exceeds size limit. Max per image: 10MB`
        );
        setFiles([]);
        return;
      } else if (!isImageFile(file) && file.size > maxDocumentSize) {
        setError(
          `Document "${file.name}" exceeds size limit. Max per document: 25MB`
        );
        setFiles([]);
        return;
      }
    }

    // Check collective size limit
    if (allImages && totalSize > maxTotalImageSize) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      setError(
        `Total size of all images (${totalMB}MB) exceeds limit. Max: 50MB for 5 images`
      );
      setFiles([]);
      return;
    }

    if (allDocuments && totalSize > maxDocumentSize) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      setError(
        `Document size (${totalMB}MB) exceeds limit. Max: 25MB`
      );
      setFiles([]);
      return;
    }

    // All validations passed
    setFiles(filesArray);
    setError("");

    // Also update the file input using DataTransfer API
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      filesArray.forEach((file) => {
        dataTransfer.items.add(file);
      });
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uploadData = new FormData();
      
      // Append all files
      files.forEach((file) => {
        uploadData.append("file", file);
      });
      
      // Append form fields
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("subject", formData.subject);
      uploadData.append("semester", formData.semester);
      uploadData.append("resourceType", formData.resourceType);

      await api.post("/resources", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(`Successfully uploaded ${files.length} file(s)!`);

      // Reset form
      setFormData({
        title: "",
        description: "",
        subject: "",
        semester: "",
        resourceType: "",
      });
      setFiles([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/my-uploads");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resource(s)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-8 md:py-12 px-4 sm:px-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 animate-slideDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
            Share Your Resources
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            Help your classmates learn by uploading study materials
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-10 animate-slideUp">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 sm:mb-7 p-4 sm:p-5 bg-red-50 border-l-4 border-red-500 rounded-xl animate-slideDown">
              <p className="text-red-700 font-medium text-sm sm:text-base leading-relaxed">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 sm:mb-7 p-4 sm:p-5 bg-green-50 border-l-4 border-green-500 rounded-xl animate-slideDown">
              <p className="text-green-700 font-medium text-sm sm:text-base leading-relaxed">
                ✅ {success} Redirecting...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {/* Title Field */}
            <div className="animate-slideIn">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                📝 Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced Calculus Notes - Chapter 5"
                required
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum 200 characters
              </p>
            </div>

            {/* Description Field */}
            <div
              className="animate-slideIn"
              style={{ animationDelay: "0.05s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                📄 Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this resource contains, topics covered, difficulty level, etc."
                required
                maxLength={1000}
                rows="5"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSubmit(e);
                  }
                }}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 resize-none text-sm placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum 1000 characters
              </p>
            </div>

            {/* Subject and Semester Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div
                className="animate-slideIn"
                style={{ animationDelay: "0.1s" }}
              >
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                  � Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm bg-white"
                >
                  <option value="">Select Semester</option>
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="animate-slideIn"
                style={{ animationDelay: "0.15s" }}
              >
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                  📚 Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={!formData.semester}
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Subject</option>
                  {subjectOptions.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resource Type Field */}
            <div className="animate-slideIn" style={{ animationDelay: "0.2s" }}>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                📚 Resource Type *
              </label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleChange}
                required
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm bg-white"
              >
                <option value="">Select</option>
                <option value="Class Notes">Class Notes</option>
                <option value="Module">Module</option>
                <option value="Assignment">Assignment</option>
                <option value="Presentation">Presentation</option>
                <option value="Exam Suggestion">Exam Suggestion</option>
                <option value="Book">Book</option>
                <option value="Lab Experiment">Lab Experiment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* File Upload Area */}
            <div
              className="animate-slideIn"
              style={{ animationDelay: "0.25s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 sm:mb-4 uppercase tracking-wide">
                📁 Files *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-6 sm:p-8 lg:p-10 border-3 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50 shadow-lg"
                    : "border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.odp,.keynote,.doc,.docx,.odt,.txt,.rtf,.pages,.xls,.xlsx,.ods,.csv,.numbers,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg,.heic,.heif,.avif"
                  multiple
                  className="hidden"
                />
                <div className="text-center">
                  <span className="text-5xl sm:text-6xl mb-4 sm:mb-5 block">
                    📁
                  </span>
                  <p className="text-base sm:text-lg text-gray-800 font-bold mb-2 sm:mb-3">
                    Drag and drop your files
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                    Docs: PDF, Office (PPT, DOC, XLS), OpenOffice (ODP, ODT, ODS), Apple (Keynote, Pages, Numbers), TXT, RTF, CSV (max 25MB) | Images: JPG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, AVIF (max 10MB)
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    Images: max 5 per upload (50MB total) | Documents: 1 per upload
                  </p>
                </div>
              </div>

              {/* Files Preview */}
              {files.length > 0 && (
                <div className="mt-4 sm:mt-5 space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-5 bg-green-50 border-2 border-green-200 rounded-xl animate-slideDown"
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">
                            {file.type.startsWith("image/") ? "🖼️" : "📄"}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                              {file.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFiles = files.filter((_, i) => i !== index);
                            setFiles(newFiles);
                            
                            // Update file input
                            if (fileInputRef.current) {
                              const dataTransfer = new DataTransfer();
                              newFiles.forEach((f) => {
                                dataTransfer.items.add(f);
                              });
                              fileInputRef.current.files = dataTransfer.files;
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-bold text-xl sm:text-2xl flex-shrink-0 hover:bg-red-100 p-2 rounded-lg transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2 sm:pt-4 animate-slideIn"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base min-h-[48px] sm:min-h-[52px]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>
                      Upload {files.length > 0 && `(${files.length} file${files.length !== 1 ? "s" : ""})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 sm:mt-10 p-4 sm:p-5 bg-blue-50 border-l-4 border-blue-500 rounded-xl">
            <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold block mb-1 sm:mb-2">💡 Tips:</span>
              <span className="block mb-1">• Images: Upload up to 5 at once (JPG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, AVIF - max 10MB each, 50MB total)</span>
              <span className="block mb-1">• Documents: Upload 1 at a time (PDF, Word/DOC/DOCX/Pages, PowerPoint/PPT/PPTX/Keynote, Excel/XLS/XLSX/Numbers, OpenDocument ODF formats, CSV, TXT, RTF - max 25MB)</span>
              <span>• Make sure to provide clear descriptions so others can easily find your resource</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
