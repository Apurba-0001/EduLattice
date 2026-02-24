import { useState, useEffect } from "react";
import api from "../utils/api";
import ResourceTable from "../components/ResourceTable";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const AdminPanel = () => {
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    resourceId: null,
    resourceName: "",
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
        resourceId: id,
        resourceName: resource.title,
        isDeleting: false,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await api.delete(`/resources/${deleteModal.resourceId}`);
      setResources(resources.filter((r) => r._id !== deleteModal.resourceId));
      setDeleteModal({
        isOpen: false,
        resourceId: null,
        resourceName: "",
        isDeleting: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resource");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      resourceId: null,
      resourceName: "",
      isDeleting: false,
    });
  };

  return (
    <div className="min-h-screen neu-bg py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 animate-slideDown">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-700 mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium">
            Manage platform resources and users
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 sm:p-5 neu-inset border-l-4 border-red-400 rounded-xl animate-slideDown">
            <p className="text-red-700 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="neu-surface rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 flex flex-wrap gap-3">
          {[
            { id: "stats", label: "📊 Statistics" },
            { id: "resources", label: "📚 All Resources" },
            { id: "users", label: "👥 All Users" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                activeTab === tab.id
                  ? "neu-btn-primary"
                  : "neu-btn text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="neu-surface-lg rounded-2xl p-12 sm:p-16 text-center">
            <div className="inline-block w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === "stats" && stats && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="neu-surface rounded-2xl p-6">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Total Resources
                    </div>
                    <div className="text-4xl font-extrabold text-indigo-600">
                      {stats.total || 0}
                    </div>
                  </div>
                  <div className="neu-surface rounded-2xl p-6">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      PDF Files
                    </div>
                    <div className="text-4xl font-extrabold text-red-500">
                      {stats.byType?.pdf || 0}
                    </div>
                  </div>
                  <div className="neu-surface rounded-2xl p-6">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      PPT Files
                    </div>
                    <div className="text-4xl font-extrabold text-orange-500">
                      {stats.byType?.ppt || 0}
                    </div>
                  </div>
                  <div className="neu-surface rounded-2xl p-6">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Documents
                    </div>
                    <div className="text-4xl font-extrabold text-blue-500">
                      {stats.byType?.doc || 0}
                    </div>
                  </div>
                </div>

                {/* Resources by Subject */}
                {stats.bySubject && stats.bySubject.length > 0 && (
                  <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-4">
                      Resources by Subject
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stats.bySubject.map((item) => (
                        <div
                          key={item._id}
                          className="neu-inset flex items-center justify-between p-4 rounded-xl"
                        >
                          <span className="font-medium text-slate-600">
                            {item._id}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-white font-bold text-sm"
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            }}
                          >
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources by Semester */}
                {stats.bySemester && stats.bySemester.length > 0 && (
                  <div className="neu-surface-lg rounded-2xl p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-4">
                      Resources by Semester
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {stats.bySemester.map((item) => (
                        <div
                          key={item._id}
                          className="neu-inset flex items-center justify-between p-4 rounded-xl"
                        >
                          <span className="font-medium text-slate-600">
                            {item._id}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-white font-bold text-sm"
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            }}
                          >
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6">
                  All Resources ({resources.length})
                </h2>
                {resources.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-slate-400 text-lg">No resources found</p>
                  </div>
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
              <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6">
                  All Users ({users.length})
                </h2>
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-slate-400 text-lg">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr
                          style={{
                            background:
                              "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          }}
                        >
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tl-xl">
                            Name
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tr-xl">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {users.map((user) => (
                          <tr
                            key={user._id}
                            className="hover:bg-slate-100 transition-colors duration-150"
                          >
                            <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-700">
                              {user.name}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-slate-500">
                              {user.email}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                                style={{
                                  background: user.isAdmin
                                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                    : "linear-gradient(135deg, #10b981, #059669)",
                                }}
                              >
                                {user.isAdmin ? "Admin" : "Student"}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-slate-500">
                              {new Date(user.createdAt).toLocaleDateString()}
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

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        itemName={deleteModal.resourceName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default AdminPanel;
