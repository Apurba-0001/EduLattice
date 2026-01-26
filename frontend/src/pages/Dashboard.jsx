import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import ResourceCard from "../components/ResourceCard";

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    subject: "",
    semester: "",
    tags: "",
  });

  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.semester) queryParams.append("semester", filters.semester);
      if (filters.tags) queryParams.append("tags", filters.tags);

      const response = await api.get(`/resources?${queryParams.toString()}`);
      setResources(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: "",
      subject: "",
      semester: "",
      tags: "",
    });
    setTimeout(() => fetchResources(), 100);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Learning Resources</h1>
          <p className="page-subtitle">Browse and search for study materials</p>
        </div>

        <div className="card">
          <form onSubmit={handleSearch}>
            <div className="search-bar">
              <input
                type="text"
                name="keyword"
                placeholder="Search by title, description, or subject..."
                className="form-input search-input"
                value={filters.keyword}
                onChange={handleFilterChange}
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                className="form-input"
                value={filters.subject}
                onChange={handleFilterChange}
              />

              <input
                type="text"
                name="semester"
                placeholder="Semester"
                className="form-input"
                value={filters.semester}
                onChange={handleFilterChange}
              />

              <input
                type="text"
                name="tags"
                placeholder="Tags (comma separated)"
                className="form-input"
                value={filters.tags}
                onChange={handleFilterChange}
              />

              <button type="submit" className="btn btn-primary">
                Search
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-secondary"
              >
                Clear
              </button>
            </div>
          </form>
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
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3 className="empty-state-title">No resources found</h3>
            <p>Try adjusting your search filters or upload a new resource</p>
            <button
              onClick={() => navigate("/upload")}
              className="btn btn-primary"
              style={{ marginTop: "20px" }}
            >
              Upload Resource
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
