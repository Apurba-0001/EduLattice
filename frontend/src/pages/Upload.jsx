import { useState } from "react";
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
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);

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
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Invalid file type. Only PDF, PPT, DOCX, JPG, and PNG are allowed",
      );
      setFile(null);
      e.target.value = "";
      return;
    }

    // Check file size
    const maxSize = selectedFile.type.startsWith("image/")
      ? 5 * 1024 * 1024
      : 20 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(
        `File too large. Maximum size: ${selectedFile.type.startsWith("image/") ? "5MB" : "20MB"}`,
      );
      setFile(null);
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
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

    const droppedFile = e.dataTransfer.files[0];
    const event = { target: { files: [droppedFile] } };
    handleFileChange(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
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

      setSuccess("Resource uploaded successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        subject: "",
        semester: "",
        resourceType: "",
      });
      setFile(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/my-uploads");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resource");
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
                📁 File *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative p-6 sm:p-8 lg:p-10 border-3 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50 shadow-lg"
                    : "border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50"
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <span className="text-5xl sm:text-6xl mb-4 sm:mb-5 block">
                    📁
                  </span>
                  <p className="text-base sm:text-lg text-gray-800 font-bold mb-2 sm:mb-3">
                    Drag and drop your file
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Supported: PDF, PPT (max 20MB) | JPG, PNG (max 5MB)
                  </p>
                </div>
              </div>

              {/* File Preview */}
              {file && (
                <div className="mt-4 sm:mt-5 p-4 sm:p-5 bg-green-50 border-2 border-green-200 rounded-xl animate-slideDown">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">
                        ✅
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
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700 font-bold text-xl sm:text-2xl flex-shrink-0 hover:bg-red-100 p-2 rounded-lg transition-all"
                    >
                      ✕
                    </button>
                  </div>
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
                    <span>Upload Resource</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 sm:mt-10 p-4 sm:p-5 bg-blue-50 border-l-4 border-blue-500 rounded-xl">
            <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold block mb-1 sm:mb-2">💡 Tip:</span>
              Make sure to provide clear descriptions and relevant tags so
              others can easily find your resource.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
