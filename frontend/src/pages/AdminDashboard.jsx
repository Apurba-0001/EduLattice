import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ResourceCard from "../components/ResourceCard";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (activeTab === "stats") {
        const response = await api.get("/resources/stats/overview");
        setStats(response.data.data);
      } else if (activeTab === "resources") {
        const response = await api.get("/resources");
        setResources(response.data.data);
      } else if (activeTab === "users") {
        const response = await api.get("/auth/users");
        setUsers(response.data.data);
      }

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id) => {
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Welcome, <strong>{user?.name}</strong>
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="btn btn-secondary"
          >
            Logout
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            📊 Statistics
          </button>
          <button
            className={`tab-button ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            📚 Resources
          </button>
          <button
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Users
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === "stats" && stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Resources</h3>
                  <p className="stat-number">{stats.totalResources || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Size</h3>
                  <p className="stat-number">{stats.totalSize || "N/A"}</p>
                </div>
                <div className="stat-card">
                  <h3>Subjects</h3>
                  <p className="stat-number">{stats.subjects?.length || 0}</p>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div className="admin-section">
                <h2>All Resources ({resources.length})</h2>
                {resources.length === 0 ? (
                  <p className="no-data">No resources found</p>
                ) : (
                  <div className="resources-grid">
                    {resources.map((resource) => (
                      <div key={resource._id} className="admin-resource-card">
                        <ResourceCard resource={resource} />
                        <div className="admin-actions">
                          <button
                            onClick={() => handleDeleteResource(resource._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="admin-section">
                <h2>All Users ({users.length})</h2>
                {users.length === 0 ? (
                  <p className="no-data">No users found</p>
                ) : (
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Admin Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              <span
                                className={
                                  u.isAdmin ? "badge-admin" : "badge-student"
                                }
                              >
                                {u.isAdmin ? "Admin" : "Student"}
                              </span>
                            </td>
                            <td>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="btn btn-danger btn-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .admin-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .tab-button {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          color: #0066cc;
        }

        .tab-button.active {
          color: #0066cc;
          border-bottom-color: #0066cc;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .stat-card h3 {
          margin: 0;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 1rem 0 0 0;
        }

        .admin-section {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .admin-section h2 {
          margin-top: 0;
          color: #333;
          margin-bottom: 1.5rem;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 2rem;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .admin-resource-card {
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }

        .admin-actions {
          padding: 1rem;
          background: #f5f5f5;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 0.5rem;
        }

        .users-table {
          overflow-x: auto;
        }

        .users-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: #f5f5f5;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e0e0e0;
          color: #333;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .users-table tr:hover {
          background: #f9f9f9;
        }

        .badge-admin {
          display: inline-block;
          background: #0066cc;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge-student {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #c33;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #666;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top-color: #0066cc;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
