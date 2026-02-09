import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ResourceTable from "../components/ResourceTable";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'resource' or 'user'
    id: null,
    name: "",
    isAdmin: false,
    isDeleting: false,
  });

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
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    const resource = resources.find((r) => r._id === id);
    if (resource) {
      setDeleteModal({
        isOpen: true,
        type: "resource",
        id,
        name: resource.title,
        isAdmin: false,
        isDeleting: false,
      });
    }
  };

  const handleDeleteResourceConfirm = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await api.delete(`/resources/${deleteModal.id}`);
      setResources(resources.filter((r) => r._id !== deleteModal.id));
      setDeleteModal({
        isOpen: false,
        type: null,
        id: null,
        name: "",
        isAdmin: false,
        isDeleting: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resource");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteUser = async (userId, isAdmin) => {
    // Prevent deleting admin users
    if (isAdmin) {
      setError("Cannot delete admin users");
      return;
    }

    const user = users.find((u) => u._id === userId);
    if (user) {
      setDeleteModal({
        isOpen: true,
        type: "user",
        id: userId,
        name: user.name,
        isAdmin: false,
        isDeleting: false,
      });
    }
  };

  const handleDeleteUserConfirm = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await api.delete(`/auth/users/${deleteModal.id}`);
      setUsers(users.filter((u) => u._id !== deleteModal.id));
      setDeleteModal({
        isOpen: false,
        type: null,
        id: null,
        name: "",
        isAdmin: false,
        isDeleting: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.type === "resource") {
      handleDeleteResourceConfirm();
    } else if (deleteModal.type === "user") {
      handleDeleteUserConfirm();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      type: null,
      id: null,
      name: "",
      isAdmin: false,
      isDeleting: false,
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-wrapper">
        {/* Header Section */}
        <div className="admin-header">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">
                Welcome back, <span className="admin-name">{user?.name}</span>
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="logout-btn"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="admin-nav">
          <button
            className={`nav-button ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <span>📊</span>
            <span>Statistics</span>
          </button>
          <button
            className={`nav-button ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            <span>📚</span>
            <span>Resources</span>
          </button>
          <button
            className={`nav-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <span>👥</span>
            <span>Users</span>
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <div className="admin-content">
            {/* Statistics Tab */}
            {activeTab === "stats" && stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Resources</h3>
                  <p className="stat-number">{stats.total || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>PDF Files</h3>
                  <p className="stat-number">{stats.byType?.pdf || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>PowerPoint Files</h3>
                  <p className="stat-number">{stats.byType?.ppt || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Word Documents</h3>
                  <p className="stat-number">{stats.byType?.doc || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Image Files</h3>
                  <p className="stat-number">{stats.byType?.image || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Subjects</h3>
                  <p className="stat-number">{stats.bySubject?.length || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Semesters</h3>
                  <p className="stat-number">{stats.bySemester?.length || 0}</p>
                </div>

                {/* Resources by Subject */}
                {stats.bySubject && stats.bySubject.length > 0 && (
                  <div className="stat-card full-width">
                    <h3>Resources by Subject</h3>
                    <div className="stat-list">
                      {stats.bySubject.map((item) => (
                        <div key={item._id} className="stat-list-item">
                          <span>{item._id}</span>
                          <span className="stat-count">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources by Semester */}
                {stats.bySemester && stats.bySemester.length > 0 && (
                  <div className="stat-card full-width">
                    <h3>Resources by Semester</h3>
                    <div className="stat-list">
                      {stats.bySemester.map((item) => (
                        <div key={item._id} className="stat-list-item">
                          <span>{item._id}</span>
                          <span className="stat-count">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div className="admin-section">
                <h2>All Resources ({resources.length})</h2>
                {resources.length === 0 ? (
                  <p className="no-data">No resources found</p>
                ) : (
                  <ResourceTable
                    resources={resources}
                    onDelete={handleDeleteResource}
                    showActions={true}
                  />
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
                              {u.isAdmin ? (
                                <span className="text-gray-400 text-sm italic">
                                  Protected
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleDeleteUser(u._id, u.isAdmin)
                                  }
                                  className="btn btn-danger btn-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-h-screen;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          py: 6;
          sm:py-10;
          px: 4;
          sm:px-6;
          lg:px-8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .admin-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header */
        .admin-header {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.5s ease;
        }

        .admin-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .admin-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -1px;
        }

        .admin-subtitle {
          font-size: 1rem;
          color: #666;
          margin: 0.5rem 0 0 0;
          font-weight: 500;
        }

        .admin-name {
          color: #667eea;
          font-weight: 700;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        /* Error Alert */
        .error-alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: #fee;
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
          animation: slideDown 0.4s ease;
        }

        .error-alert span {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .error-alert p {
          margin: 0;
          color: #991b1b;
          font-weight: 500;
        }

        /* Navigation */
        .admin-nav {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: white;
          padding: 1rem;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow-x: auto;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: #666;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .nav-button:hover {
          border-color: #667eea;
          color: #667eea;
          background: #f3f4f6;
        }

        .nav-button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* Loading */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #667eea;
          border-right-color: #764ba2;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1.5rem;
        }

        .loading-state p {
          color: #666;
          font-weight: 500;
          margin: 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .stat-card h3 {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1rem 0 0 0;
        }

        .stat-card.full-width {
          grid-column: 1 / -1;
        }

        .stat-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .stat-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .stat-list-item:hover {
          background: #f3f4f6;
          padding-left: 1.25rem;
        }

        .stat-count {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.85rem;
        }

        /* Admin Section */
        .admin-section {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .admin-section h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 3rem 2rem;
          font-size: 1rem;
        }

        /* Users Table */
        .users-table {
          overflow-x: auto;
          border-radius: 12px;
        }

        .users-table table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 500px;
        }

        .users-table th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 1.25rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .users-table th:first-child {
          border-radius: 12px 0 0 0;
        }

        .users-table th:last-child {
          border-radius: 0 12px 0 0;
        }

        .users-table td {
          padding: 1.25rem;
          border-bottom: 1px solid #f0f0f0;
          color: #333;
          font-weight: 500;
        }

        .users-table tr:last-child td {
          border-bottom: none;
        }

        .users-table tr:last-child td:first-child {
          border-radius: 0 0 0 12px;
        }

        .users-table tr:last-child td:last-child {
          border-radius: 0 0 12px 0;
        }

        .users-table tr:hover {
          background: #f9fafb;
        }

        .badge-admin,
        .badge-student {
          display: inline-block;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-admin {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .badge-student {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .btn-danger:hover {
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }

        /* Animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .admin-content {
          animation: fadeIn 0.5s ease;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .admin-header {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .admin-header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .logout-btn {
            width: 100%;
            justify-content: center;
          }

          .admin-title {
            font-size: 1.75rem;
          }

          .admin-nav {
            gap: 0.5rem;
            padding: 0.75rem;
          }

          .nav-button {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .stat-number {
            font-size: 1.75rem;
          }
        }
      `}</style>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.type === "resource" ? "Delete Resource" : "Delete User"
        }
        message={
          deleteModal.type === "resource"
            ? "Are you sure you want to delete this resource? This action cannot be undone."
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        itemName={deleteModal.name}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default AdminDashboard;
