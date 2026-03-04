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
  const [mobileUserPopup, setMobileUserPopup] = useState(null);
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
    } finally {
      setLoading(false);
    }
  };

  const groupResources = (resourceList) => {
    const grouped = [];
    const processedGroupIds = new Set();

    resourceList.forEach((resource) => {
      if (
        resource.imageGroupId &&
        !processedGroupIds.has(resource.imageGroupId)
      ) {
        // Add first resource of a group and mark group as processed
        grouped.push(resource);
        processedGroupIds.add(resource.imageGroupId);
      } else if (!resource.imageGroupId) {
        // Add ungrouped resources
        grouped.push(resource);
      }
    });

    return grouped;
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
      const resourceToDelete = resources.find((r) => r._id === deleteModal.id);

      // If grouped, delete all resources with same imageGroupId
      if (resourceToDelete?.imageGroupId) {
        const groupIds = resources
          .filter((r) => r.imageGroupId === resourceToDelete.imageGroupId)
          .map((r) => r._id);

        // Delete all resources in the group
        for (const groupId of groupIds) {
          await api.delete(`/resources/${groupId}`);
        }

        // Remove all grouped resources from state
        setResources(
          resources.filter(
            (r) => r.imageGroupId !== resourceToDelete.imageGroupId,
          ),
        );
      } else {
        // Single resource delete
        await api.delete(`/resources/${deleteModal.id}`);
        setResources(resources.filter((r) => r._id !== deleteModal.id));
      }

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
    <div className="min-h-screen neu-bg py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 animate-slideDown">
          <div className="flex justify-between items-center gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-700 leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 text-sm sm:text-base mt-2 font-medium">
                Welcome back,{" "}
                <span className="text-indigo-600 font-bold">{user?.name}</span>
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="neu-btn-danger px-5 py-3 rounded-xl font-semibold text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="neu-inset border-l-4 border-red-400 rounded-xl mb-6 p-4 animate-slideDown">
            <p className="text-red-700 font-medium text-sm sm:text-base">
              {error}
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="neu-surface rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 flex gap-3 overflow-x-auto">
          {[
            { id: "stats", label: "Statistics" },
            { id: "resources", label: "Resources" },
            { id: "users", label: "Users" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                activeTab === tab.id
                  ? "neu-btn-primary"
                  : "neu-btn text-slate-600"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="neu-surface-lg rounded-2xl p-12 sm:p-16 text-center">
            <div className="inline-block w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading data...</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Statistics Tab */}
            {activeTab === "stats" && stats && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  {[
                    { label: "Total Resources", value: stats.total || 0 },
                    { label: "PDF Files", value: stats.byType?.pdf || 0 },
                    {
                      label: "PowerPoint Files",
                      value: stats.byType?.ppt || 0,
                    },
                    { label: "Word Documents", value: stats.byType?.doc || 0 },
                    { label: "Image Files", value: stats.byType?.image || 0 },
                    {
                      label: "Total Subjects",
                      value: stats.bySubject?.length || 0,
                    },
                    {
                      label: "Total Semesters",
                      value: stats.bySemester?.length || 0,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="neu-surface rounded-2xl p-6"
                    >
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        {stat.label}
                      </div>
                      <div className="text-4xl font-extrabold text-indigo-600">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {stats.bySubject && stats.bySubject.length > 0 && (
                  <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-4">
                      Resources by Subject
                    </h3>
                    <div className="flex flex-col gap-3">
                      {stats.bySubject.map((item) => (
                        <div
                          key={item._id}
                          className="neu-inset flex justify-between items-center px-4 py-3 rounded-xl text-sm"
                        >
                          <span className="font-medium text-slate-600">
                            {item._id}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
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

                {stats.bySemester && stats.bySemester.length > 0 && (
                  <div className="neu-surface-lg rounded-2xl p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-4">
                      Resources by Semester
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {stats.bySemester.map((item) => (
                        <div
                          key={item._id}
                          className="neu-inset flex justify-between items-center px-4 py-3 rounded-xl text-sm"
                        >
                          <span className="font-medium text-slate-600">
                            {item._id}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
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
              <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6">
                  All Resources ({groupResources(resources).length})
                </h2>
                {resources.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">No resources found</p>
                  </div>
                ) : (
                  <ResourceTable
                    resources={groupResources(resources)}
                    onDelete={handleDeleteResource}
                    showActions={true}
                  />
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="neu-surface-lg rounded-2xl p-6 sm:p-8 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6">
                  All Users ({users.length})
                </h2>
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">No users found</p>
                  </div>
                ) : (
                  <div className="rounded-xl">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            background:
                              "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          }}
                        >
                          <th className="px-3 sm:px-5 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tl-xl">
                            Name
                          </th>
                          <th className="hidden sm:table-cell px-5 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-3 sm:px-5 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider sm:rounded-none rounded-tr-xl">
                            Role
                          </th>
                          <th className="hidden sm:table-cell px-5 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="hidden sm:table-cell px-5 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider rounded-tr-xl">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {users.map((u) => (
                          <tr
                            key={u._id}
                            className="hover:bg-slate-100 transition-colors duration-150 cursor-pointer sm:cursor-default"
                            onClick={() => {
                              if (window.innerWidth < 640) {
                                setMobileUserPopup(u);
                              }
                            }}
                          >
                            <td className="px-3 sm:px-5 py-4">
                              <div className="text-sm font-medium text-slate-700 truncate">
                                {u.name}
                              </div>
                              <div className="sm:hidden text-xs text-slate-500 mt-0.5 truncate">
                                {u.email}
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-500">
                              {u.email}
                            </td>
                            <td className="px-3 sm:px-5 py-4">
                              <span
                                className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                                style={{
                                  background: u.isAdmin
                                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                    : "linear-gradient(135deg, #10b981, #059669)",
                                }}
                              >
                                {u.isAdmin ? "Admin" : "Student"}
                              </span>
                            </td>
                            <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="hidden sm:table-cell px-5 py-4 text-center">
                              {u.isAdmin ? (
                                <span className="text-slate-400 text-sm italic">
                                  Protected
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(u._id, u.isAdmin);
                                  }}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
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

            {/* Mobile User Action Popup */}
            {mobileUserPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 sm:hidden">
                <div
                  className="rounded-t-3xl w-full animate-slideUp"
                  style={{ backgroundColor: "var(--neu-bg)" }}
                >
                  <div className="px-4 py-4 border-b border-slate-300/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 text-lg line-clamp-2 flex-1">
                      {mobileUserPopup.name}
                    </h3>
                    <button
                      onClick={() => setMobileUserPopup(null)}
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
                          {mobileUserPopup.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          Role
                        </span>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{
                            background: mobileUserPopup.isAdmin
                              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                              : "linear-gradient(135deg, #10b981, #059669)",
                          }}
                        >
                          {mobileUserPopup.isAdmin ? "Admin" : "Student"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          Joined
                        </span>
                        <span className="text-sm text-slate-700 font-medium">
                          {new Date(
                            mobileUserPopup.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {!mobileUserPopup.isAdmin && (
                      <button
                        onClick={() => {
                          handleDeleteUser(
                            mobileUserPopup._id,
                            mobileUserPopup.isAdmin,
                          );
                          setMobileUserPopup(null);
                        }}
                        className="neu-btn-danger w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        Delete User
                      </button>
                    )}
                    {mobileUserPopup.isAdmin && (
                      <div className="text-center text-slate-400 text-sm italic py-2">
                        Admin users are protected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
