import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Upload = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    tags: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      uploadData.append("tags", formData.tags);

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
        tags: "",
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
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Upload Resource</h1>
          <p className="page-subtitle">
            Share study materials with your classmates
          </p>
        </div>

        <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                name="subject"
                className="form-input"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Physics, Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Semester *</label>
              <input
                type="text"
                name="semester"
                className="form-input"
                value={formData.semester}
                onChange={handleChange}
                placeholder="e.g., 1st, 2nd, 3rd"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                className="form-input"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., algebra, calculus, exam-prep"
              />
            </div>

            <div className="form-group">
              <label className="form-label">File *</label>
              <input
                type="file"
                className="form-file"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                required
              />
              <small
                style={{ color: "#6b7280", display: "block", marginTop: "8px" }}
              >
                Allowed: PDF, PPT, DOCX (max 20MB) | JPG, PNG (max 5MB)
              </small>
              {file && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#f0fdf4",
                    borderRadius: "5px",
                  }}
                >
                  <strong>Selected:</strong> {file.name} (
                  {(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Resource"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
