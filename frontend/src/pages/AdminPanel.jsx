import { useState, useEffect } from "react";
import api from "../utils/api";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const AdminPanel = () => {
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileUserActionPopup, setMobileUserActionPopup] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    resourceId: null,
    resourceName: "",
    isDeleting: false,
    type: "resource", // "resource" or "user"
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
        type: "resource",
      });
    }
  };

  const handleDeleteUser = (id) => {
    const user = users.find((u) => u._id === id);
    if (user) {
      setDeleteModal({
        isOpen: true,
        resourceId: id,
        resourceName: user.name,
        isDeleting: false,
        type: "user",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

      if (deleteModal.type === "resource") {
        await api.delete(`/resources/${deleteModal.resourceId}`);
        setResources(resources.filter((r) => r._id !== deleteModal.resourceId));
      } else if (deleteModal.type === "user") {
        await api.delete(`/auth/users/${deleteModal.resourceId}`);
        setUsers(users.filter((u) => u._id !== deleteModal.resourceId));
      }

      setDeleteModal({
        isOpen: false,
        resourceId: null,
        resourceName: "",
        isDeleting: false,
        type: "resource",
      });
      setMobileUserActionPopup(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      resourceId: null,
      resourceName: "",
      isDeleting: false,
      type: "resource",
    });
    setMobileUserActionPopup(null);
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
                  <>
                    <div className="overflow-x-auto rounded-xl">
                      <table className="w-full">
                        <thead>
                          <tr
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            }}
                          >
                            <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tl-xl">
                              Title
                            </th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                              Type
                            </th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                              Uploaded
                            </th>
                            <th className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tr-xl">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {resources.map((resource) => (
                            <tr
                              key={resource._id}
                              className="hover:bg-slate-100 transition-colors duration-150"
                            >
                              <td className="px-3 sm:px-6 py-4">
                                <div className="text-sm font-medium text-slate-700">
                                  {resource.title}
                                </div>
                                <div className="sm:hidden text-xs text-slate-500 mt-0.5 truncate max-w-[160px]">
                                  {resource.subject}
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">
                                {resource.subject}
                              </td>
                              <td className="px-3 sm:px-6 py-4">
                                <span
                                  className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                                  style={{
                                    background:
                                      resource.fileType === "pdf"
                                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                        : resource.fileType === "ppt"
                                          ? "linear-gradient(135deg, #f97316, #ea580c)"
                                          : resource.fileType === "doc"
                                            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                                            : resource.fileType === "image"
                                              ? "linear-gradient(135deg, #10b981, #059669)"
                                              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                  }}
                                >
                                  {resource.fileType}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">
                                {new Date(
                                  resource.createdAt,
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-3 sm:px-6 py-4 text-center">
                                <button
                                  onClick={() =>
                                    handleDeleteResource(resource._id)
                                  }
                                  className="px-2 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors"
                                  title="Delete resource"
                                >
                                  <span className="hidden sm:inline">
                                    Delete
                                  </span>
                                  <span className="sm:hidden">🗑️</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
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
                  <>
                    <div className="rounded-xl">
                      <table className="w-full">
                        <thead>
                          <tr
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            }}
                          >
                            <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tl-xl">
                              Name
                            </th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider sm:rounded-none rounded-tr-xl">
                              Role
                            </th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="hidden sm:table-cell px-6 py-4 text-center text-xs sm:text-sm font-semibold text-white uppercase tracking-wider rounded-tr-xl">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {users.map((user) => (
                            <tr
                              key={user._id}
                              className="hover:bg-slate-100 transition-colors duration-150 cursor-pointer sm:cursor-default"
                              onClick={() => {
                                if (window.innerWidth < 640) {
                                  setMobileUserActionPopup(user);
                                }
                              }}
                            >
                              <td className="px-3 sm:px-6 py-4">
                                <div className="text-sm font-medium text-slate-700 truncate">
                                  {user.name}
                                </div>
                                <div className="sm:hidden text-xs text-slate-500 mt-0.5 truncate">
                                  {user.email}
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">
                                {user.email}
                              </td>
                              <td className="px-3 sm:px-6 py-4">
                                <span
                                  className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                                  style={{
                                    background: user.isAdmin
                                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                      : "linear-gradient(135deg, #10b981, #059669)",
                                  }}
                                >
                                  {user.isAdmin ? "Admin" : "Student"}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user._id);
                                  }}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
                                  title="Delete user"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile User Action Popup */}
            {mobileUserActionPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 sm:hidden">
                <div
                  className="rounded-t-3xl w-full animate-slideUp"
                  style={{ backgroundColor: "var(--neu-bg)" }}
                >
                  <div className="px-4 py-4 border-b border-slate-300/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 text-lg line-clamp-2 flex-1">
                      {mobileUserActionPopup.name}
                    </h3>
                    <button
                      onClick={() => setMobileUserActionPopup(null)}
                      className="text-2xl text-slate-500 hover:text-slate-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div className="neu-inset rounded-xl p-4 space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-medium">
                          Email
                        </span>
                        <span className="text-sm text-slate-700 font-medium break-all">
                          {mobileUserActionPopup.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          Role
                        </span>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{
                            background: mobileUserActionPopup.isAdmin
                              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                              : "linear-gradient(135deg, #10b981, #059669)",
                          }}
                        >
                          {mobileUserActionPopup.isAdmin ? "Admin" : "Student"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          Joined
                        </span>
                        <span className="text-sm text-slate-700 font-medium">
                          {new Date(
                            mobileUserActionPopup.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleDeleteUser(mobileUserActionPopup._id);
                        setMobileUserActionPopup(null);
                      }}
                      className="neu-btn-danger w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.type === "user" ? "User" : "Resource"}`}
        message={`Are you sure you want to delete this ${deleteModal.type === "user" ? "user" : "resource"}? This action cannot be undone.`}
        itemName={deleteModal.resourceName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default AdminPanel;
