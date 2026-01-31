import { useState, useEffect } from "react";
import api from "../utils/api";
import ResourceTable from "../components/ResourceTable";

const AdminPanel = () => {
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

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage platform resources and users</p>
        </div>

        <div className="card">
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              className={`btn ${activeTab === "stats" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("stats")}
            >
              Statistics
            </button>
            <button
              className={`btn ${activeTab === "resources" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("resources")}
            >
              All Resources
            </button>
            <button
              className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("users")}
            >
              All Users
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {activeTab === "stats" && stats && (
              <div>
                <div className="grid grid-2">
                  <div className="card">
                    <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
                      Overview
                    </h3>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: "#4f46e5",
                      }}
                    >
                      {stats.total}
                    </div>
                    <div style={{ color: "#6b7280" }}>Total Resources</div>
                  </div>

                  <div className="card">
                    <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
                      By Type
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>PDFs:</span>
                        <strong>{stats.byType.pdf}</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>PPTs:</span>
                        <strong>{stats.byType.ppt}</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Docs:</span>
                        <strong>{stats.byType.doc}</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Images:</span>
                        <strong>{stats.byType.image}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {stats.bySubject.length > 0 && (
                  <div className="card">
                    <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
                      Resources by Subject
                    </h3>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {stats.bySubject.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "5px",
                          }}
                        >
                          <span>{item._id}</span>
                          <strong>{item.count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "resources" && (
              <div className="card">
                <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
                  All Resources ({resources.length})
                </h3>
                {resources.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#6b7280" }}>
                    No resources found
                  </p>
                ) : (
                  <ResourceTable
                    resources={resources}
                    onDelete={handleDeleteResource}
                    showActions={true}
                  />
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div className="card">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #e5e7eb",
                        textAlign: "left",
                      }}
                    >
                      <th style={{ padding: "12px" }}>Name</th>
                      <th style={{ padding: "12px" }}>Email</th>
                      <th style={{ padding: "12px" }}>Role</th>
                      <th style={{ padding: "12px" }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        style={{ borderBottom: "1px solid #e5e7eb" }}
                      >
                        <td style={{ padding: "12px" }}>{user.name}</td>
                        <td style={{ padding: "12px" }}>{user.email}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            className={`badge ${user.role === "admin" ? "badge-pdf" : "badge-doc"}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
