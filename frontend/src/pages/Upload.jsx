import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { SEMESTERS, getSubjectsBySemester } from "../constants/curriculum";
import { validateFiles } from "../utils/fileValidation";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import ErrorModal from "../components/ErrorModal";

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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const fileInputRef = useRef(null);

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

    // Validate files
    const validation = validateFiles(filesArray);
    if (!validation.isValid) {
      setIsErrorModalOpen(true);
      setError(validation.error);
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

    // Validate files
    const validation = validateFiles(filesArray);
    if (!validation.isValid) {
      setError(validation.error);
      setIsErrorModalOpen(true);
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
      setError(ERROR_MESSAGES.NO_FILES);
      setIsErrorModalOpen(true);
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
      const errorMessage =
        err.response?.data?.message || ERROR_MESSAGES.UPLOAD_FAILED;
      setError(errorMessage);
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen neu-bg py-6 sm:py-8 md:py-12 px-4 sm:px-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 animate-slideDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-700 mb-2 sm:mb-3 leading-tight">
            Share Your Resources
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed">
            Help your classmates learn by uploading study materials
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="neu-surface-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 animate-slideUp">
          {/* Success Alert */}
          {success && (
            <div className="mb-6 sm:mb-7 p-4 sm:p-5 neu-inset border-l-4 border-green-400 rounded-xl animate-slideDown">
              <p className="text-green-700 font-medium text-sm sm:text-base leading-relaxed">
                ✅ {success} Redirecting...
              </p>
            </div>
          )}

          {/* Error Modal */}
          <ErrorModal
            isOpen={isErrorModalOpen}
            message={error}
            onClose={() => setIsErrorModalOpen(false)}
          />

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {/* Title Field */}
            <div className="animate-slideIn">
              <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">
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
                className="neu-input w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
              />
              <p className="text-xs text-slate-400 mt-2">
                Maximum 200 characters
              </p>
            </div>

            {/* Description Field */}
            <div
              className="animate-slideIn"
              style={{ animationDelay: "0.05s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">
                📄 Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this resource contains, topics covered, difficulty level, etc."
                maxLength={1000}
                rows="5"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSubmit(e);
                  }
                }}
                className="neu-input w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200"
              />
              <p className="text-xs text-slate-400 mt-2">
                Maximum 1000 characters
              </p>
            </div>

            {/* Subject and Semester Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div
                className="animate-slideIn"
                style={{ animationDelay: "0.1s" }}
              >
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="neu-input w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
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
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">
                  📚 Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={!formData.semester}
                  className="neu-input w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">
                📚 Resource Type *
              </label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleChange}
                required
                className="neu-input w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
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
              <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-3 sm:mb-4 uppercase tracking-wide">
                📁 Files *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  boxShadow: dragActive
                    ? "inset 4px 4px 10px var(--neu-shadow-dark), inset -4px -4px 10px var(--neu-shadow-light)"
                    : "var(--neu-raised)",
                  backgroundColor: "var(--neu-bg)",
                }}
                className={`relative p-6 sm:p-8 lg:p-10 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-indigo-400"
                    : "border-slate-300 hover:border-indigo-400"
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
                  <p className="text-base sm:text-lg text-slate-700 font-bold mb-2 sm:mb-3">
                    Drag and drop files or click to browse
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Documents (PDF, PPTX, DOCX) up to 25MB | Images (JPG, PNG,
                    etc) up to 10MB
                  </p>
                </div>
              </div>

              {/* Files Preview */}
              {files.length > 0 && (
                <div className="mt-4 sm:mt-5 space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="neu-surface rounded-xl px-4 py-3 animate-slideDown"
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">
                            {file.type.startsWith("image/") ? "🖼️" : "📄"}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-700 text-sm sm:text-base truncate">
                              {file.name}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFiles = files.filter(
                              (_, i) => i !== index,
                            );
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
                          className="neu-btn-danger flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div
              className="pt-2 sm:pt-4 animate-slideIn"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                type="submit"
                disabled={loading}
                className="neu-btn-primary w-full py-3 sm:py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Upload{" "}
                      {files.length > 0 &&
                        `(${files.length} file${files.length !== 1 ? "s" : ""})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 sm:mt-10 p-4 sm:p-5 neu-inset border-l-4 border-indigo-400 rounded-xl">
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold block mb-1 sm:mb-2">💡 Tips:</span>
              <span className="block mb-1">
                • Images: Upload up to 5 at once (JPG, PNG , etc. 10MB each,
                50MB total)
              </span>
              <span className="block mb-1">
                • Documents: Upload 1 at a time (PDF, DOCX, PPTX, etc. max 25MB)
              </span>
              <span>
                • Make sure to provide clear descriptions so others can easily
                find your resource
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
