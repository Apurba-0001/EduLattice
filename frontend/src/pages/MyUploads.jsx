import { useState, useEffect } from "react";
import api from "../utils/api";
import ResourceTable from "../components/ResourceTable";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const MyUploads = () => {
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    resourceId: null,
    resourceName: "",
    groupCount: 0,
    isGroupDeletion: false,
    isDeleting: false,
  });

  const fetchMyUploads = async () => {
    try {
      setLoading(true);
      const response = await api.get("/resources/my/uploads");
      const allRes = response.data.data;
      setAllResources(allRes);

      // Group resources by imageGroupId
      const deduplicated = deduplicateGroupedResources(allRes);
      setResources(deduplicated);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your uploads");
    } finally {
      setLoading(false);
    }
  };

  // Deduplicate grouped photos - show only one row per group
  const deduplicateGroupedResources = (resourcesList) => {
    const seen = new Set();
    return resourcesList.filter((resource) => {
      // If it has an imageGroupId and we've already seen this group, skip it
      if (resource.imageGroupId) {
        if (seen.has(resource.imageGroupId)) {
          return false;
        }
        seen.add(resource.imageGroupId);
      }
      return true;
    });
  };

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const handleDelete = async (id) => {
    const resource = allResources.find((r) => r._id === id);

    if (!resource) {
      setError("Resource not found");
      return;
    }

    // If it's a grouped image, confirm deletion of entire group
    let groupCount = 1;
    let isGroupDeletion = false;

    if (resource.imageGroupId) {
      groupCount = allResources.filter(
        (r) => r.imageGroupId === resource.imageGroupId,
      ).length;
      isGroupDeletion = true;
    }

    setDeleteModal({
      isOpen: true,
      resourceId: id,
      resourceName: resource.title,
      groupCount,
      isGroupDeletion,
      isDeleting: false,
    });
  };

  const handleDeleteConfirm = async () => {
    const resource = allResources.find((r) => r._id === deleteModal.resourceId);

    if (!resource) {
      setError("Resource not found");
      return;
    }

    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      setError("");

      // If it's a grouped image, delete the entire group
      if (resource.imageGroupId) {
        const groupResources = allResources.filter(
          (r) => r.imageGroupId === resource.imageGroupId,
        );

        // Delete all resources in the group concurrently
        await Promise.all(
          groupResources.map((res) => api.delete(`/resources/${res._id}`)),
        );

        // Update local state immediately after successful deletion
        const newAllResources = allResources.filter(
          (r) => r.imageGroupId !== resource.imageGroupId,
        );
        setAllResources(newAllResources);
        setResources(deduplicateGroupedResources(newAllResources));
      } else {
        // Single resource delete
        await api.delete(`/resources/${deleteModal.resourceId}`);
        const newAllResources = allResources.filter(
          (r) => r._id !== deleteModal.resourceId,
        );
        setAllResources(newAllResources);
        setResources(deduplicateGroupedResources(newAllResources));
      }

      setDeleteModal({
        isOpen: false,
        resourceId: null,
        resourceName: "",
        groupCount: 0,
        isGroupDeletion: false,
        isDeleting: false,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete resource";
      setError(errorMsg);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      resourceId: null,
      resourceName: "",
      groupCount: 0,
      isGroupDeletion: false,
      isDeleting: false,
    });
  };

  return (
    <div className="min-h-screen neu-bg py-6 sm:py-8 md:py-12 px-4 sm:px-6 animate-fadeIn">
      <div className="container max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 animate-slideDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-700 mb-2 sm:mb-3 leading-tight">
            My Uploads
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed">
            Manage and track all your shared resources
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 sm:mb-10 p-4 sm:p-5 neu-inset border-l-4 border-red-400 rounded-xl animate-slideDown">
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
                <div className="absolute inset-0 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
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
              isDeleting={deleting}
            />
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24 animate-slideUp">
            <div className="text-6xl sm:text-7xl mb-4 sm:mb-5">📤</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-3 sm:mb-4">
              No uploads yet
            </h3>
            <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-4 max-w-md mx-auto">
              Start sharing your knowledge by uploading resources to help your
              classmates
            </p>
            <a
              href="/upload"
              className="inline-flex neu-btn-primary px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base items-center justify-center"
            >
              ➕ Upload Your First Resource
            </a>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Resource"
        message={
          deleteModal.isGroupDeletion
            ? `This will delete ${deleteModal.groupCount} image${
                deleteModal.groupCount !== 1 ? "s" : ""
              } in this group. Continue?`
            : "Are you sure you want to delete this resource? This action cannot be undone."
        }
        itemName={deleteModal.resourceName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default MyUploads;
