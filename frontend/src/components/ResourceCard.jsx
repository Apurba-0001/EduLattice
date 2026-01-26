const ResourceCard = ({ resource, onDelete, showActions = true }) => {
  const getFileTypeColor = (type) => {
    switch (type) {
      case "pdf":
        return "badge-pdf";
      case "ppt":
        return "badge-ppt";
      case "doc":
        return "badge-doc";
      case "image":
        return "badge-image";
      default:
        return "";
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
    <div className="card resource-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <h3
          style={{ marginBottom: "10px", fontSize: "20px", color: "#1f2937" }}
        >
          {resource.title}
        </h3>
        <span className={`badge ${getFileTypeColor(resource.fileType)}`}>
          {resource.fileType.toUpperCase()}
        </span>
      </div>

      <p style={{ color: "#6b7280", marginBottom: "15px", lineHeight: "1.6" }}>
        {resource.description}
      </p>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "10px",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        <span>
          <strong>Subject:</strong> {resource.subject}
        </span>
        <span>
          <strong>Semester:</strong> {resource.semester}
        </span>
      </div>

      {resource.tags && resource.tags.length > 0 && (
        <div className="tags">
          {resource.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "15px",
          paddingTop: "15px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ fontSize: "13px", color: "#6b7280" }}>
          <div>
            <strong>Uploaded by:</strong> {resource.uploadedBy?.name}
          </div>
          <div>
            <strong>Date:</strong> {formatDate(resource.createdAt)}
          </div>
          <div>
            <strong>Size:</strong> {formatFileSize(resource.fileSize)}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            View
          </a>
          {showActions && onDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              className="btn btn-danger"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
