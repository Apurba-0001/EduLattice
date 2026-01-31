import { useState, useEffect } from "react";
import api from "../utils/api";
import ResourceTable from "../components/ResourceTable";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-8 md:py-12 px-4 sm:px-6 animate-fadeIn">
      <div className="container max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 animate-slideDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
            My Uploads
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            Manage and track all your shared resources
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 sm:mb-10 p-4 sm:p-5 bg-red-50 border-l-4 border-red-500 rounded-xl animate-slideDown">
            <p className="text-red-700 font-medium text-sm sm:text-base leading-relaxed">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16 sm:py-24">
            <div className="flex flex-col items-center gap-4 sm:gap-5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-white rounded-full"></div>
              </div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">
                Loading your uploads...
              </p>
            </div>
          </div>
        ) : resources.length > 0 ? (
          <div className="animate-fadeIn">
            <ResourceTable
              resources={resources}
              onDelete={handleDelete}
              showActions={true}
            />
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24 animate-slideUp">
            <div className="text-6xl sm:text-7xl mb-4 sm:mb-5">📤</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              No uploads yet
            </h3>
            <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-4 max-w-md mx-auto">
              Start sharing your knowledge by uploading resources to help your
              classmates
            </p>
            <a
              href="/upload"
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:shadow-lg active:scale-95 shadow-lg text-sm sm:text-base min-h-[48px] flex items-center justify-center"
            >
              ➕ Upload Your First Resource
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUploads;
