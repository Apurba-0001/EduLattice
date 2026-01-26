import { useState, useEffect } from "react";
import api from "../utils/api";
import ResourceCard from "../components/ResourceCard";

const MyUploads = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyUploads = async () => {
    try {
      setLoading(true);
      const response = await api.get("/resources/my/uploads");
      setResources(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete resource");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Uploads</h1>
          <p className="page-subtitle">Manage your uploaded resources</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-2">
            {resources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onDelete={handleDelete}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📤</div>
            <h3 className="empty-state-title">No uploads yet</h3>
            <p>You haven't uploaded any resources yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUploads;
