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
      console.error("Fetch error:", err);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg animate-slideDown">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Manage platform resources and users
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 sm:p-5 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-md animate-slideDown">
            <p className="text-red-700 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === "stats"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("stats")}
            >
              📊 Statistics
            </button>
            <button
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === "resources"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("resources")}
            >
              📚 All Resources
            </button>
            <button
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === "users"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("users")}
            >
              👥 All Users
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 sm:p-16 text-center shadow-lg">
            <div className="inline-block w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === "stats" && stats && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Total Resources
                    </div>
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.total || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      PDF Files
                    </div>
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                      {stats.byType?.pdf || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      PPT Files
                    </div>
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                      {stats.byType?.ppt || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Documents
                    </div>
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                      {stats.byType?.doc || 0}
                    </div>
                  </div>
                </div>

                {/* Resources by Subject */}
                {stats.bySubject && stats.bySubject.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      Resources by Subject
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stats.bySubject.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors duration-200"
                        >
                          <span className="font-medium text-gray-700">
                            {item._id}
                          </span>
                          <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-full text-sm">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources by Semester */}
                {stats.bySemester && stats.bySemester.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      Resources by Semester
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {stats.bySemester.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors duration-200"
                        >
                          <span className="font-medium text-gray-700">
                            {item._id}
                          </span>
                          <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-full text-sm">
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
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  All Resources ({resources.length})
                </h2>
                {resources.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-gray-500 text-lg">No resources found</p>
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
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  All Users ({users.length})
                </h2>
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-500 text-lg">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-tl-xl">
                            Name
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-tr-xl">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user, index) => (
                          <tr
                            key={user._id}
                            className="hover:bg-indigo-50 transition-colors duration-200"
                          >
                            <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase ${
                                  user.isAdmin
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                }`}
                              >
                                {user.isAdmin ? "Admin" : "Student"}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
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
    </div>
  );
};

export default AdminPanel;
