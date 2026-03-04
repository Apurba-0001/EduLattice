import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import ResourceTable from "../components/ResourceTable";
import {
  SEMESTERS,
  getSubjectsBySemester,
  ALL_SUBJECTS,
} from "../constants/curriculum";

const RESOURCE_TYPES = [
  "Class Notes",
  "Module",
  "Assignment",
  "Presentation",
  "Exam Suggestion",
  "Book",
  "Lab Experiment",
  "Other",
];

const AllResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    subject: "",
    semester: "",
    resourceType: "",
  });
  const [sorting, setSorting] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [subjectOptions, setSubjectOptions] = useState(ALL_SUBJECTS);

  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.semester) queryParams.append("semester", filters.semester);
      if (filters.resourceType)
        queryParams.append("resourceType", filters.resourceType);

      // Add sorting parameters
      queryParams.append("sortBy", sorting.sortBy);
      queryParams.append("sortOrder", sorting.sortOrder);

      const response = await api.get(`/resources?${queryParams.toString()}`);
      setResources(response.data.data || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch resources",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filter grouped files to show only one row per group
  const getUniqueResources = (resourceList) => {
    const seenGroups = new Set();
    return resourceList.filter((resource) => {
      // If it's a grouped file (has imageGroupId)
      if (resource.imageGroupId) {
        // If we've already seen this group, skip it
        if (seenGroups.has(resource.imageGroupId)) {
          return false;
        }
        // Mark this group as seen
        seenGroups.add(resource.imageGroupId);
        return true;
      }
      // Non-grouped files always show
      return true;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // If semester changes, update subject options and reset subject
    if (name === "semester") {
      const newSubjects = value ? getSubjectsBySemester(value) : ALL_SUBJECTS;
      setSubjectOptions(newSubjects);
      setFilters({
        ...filters,
        semester: value,
        subject: "", // Reset subject when semester changes
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
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
      resourceType: "",
    });
    setSorting({
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSubjectOptions(ALL_SUBJECTS);
    setTimeout(() => fetchResources(), 100);
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    const newSorting = {
      ...sorting,
      [name]: value,
    };
    setSorting(newSorting);

    // Fetch with new sorting
    setTimeout(() => {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.semester) queryParams.append("semester", filters.semester);
      if (filters.resourceType)
        queryParams.append("resourceType", filters.resourceType);

      queryParams.append("sortBy", newSorting.sortBy);
      queryParams.append("sortOrder", newSorting.sortOrder);

      api
        .get(`/resources?${queryParams.toString()}`)
        .then((response) => {
          setResources(response.data.data || []);
          setError("");
        })
        .catch((err) => {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to fetch resources",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);
  };

  return (
    <div className="min-h-screen neu-bg py-6 sm:py-8 md:py-12 px-4 sm:px-6 animate-fadeIn">
      <div className="container max-w-7xl mx-auto">
        {/* Page Header with Sorting */}
        <div className="mb-8 sm:mb-10 md:mb-12 animate-slideDown">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-700 mb-2 sm:mb-3 leading-tight">
                All Resources
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed">
                Browse and search through all available study materials
              </p>
            </div>

            {/* Sorting Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Sort By */}
              <div className="flex-1 sm:flex-initial">
                <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={sorting.sortBy}
                  onChange={handleSortChange}
                  className="neu-input w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="title">Resource Name</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>

              {/* Sort Order Buttons */}
              <div className="flex-1 sm:flex-initial">
                <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  Order
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSortChange({
                        target: { name: "sortOrder", value: "desc" },
                      })
                    }
                    className={`flex-1 w-10 h-10 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-200 ${
                      sorting.sortOrder === "desc"
                        ? "neu-btn-primary"
                        : "neu-btn text-slate-600"
                    }`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSortChange({
                        target: { name: "sortOrder", value: "asc" },
                      })
                    }
                    className={`flex-1 w-10 h-10 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-200 ${
                      sorting.sortOrder === "asc"
                        ? "neu-btn-primary"
                        : "neu-btn text-slate-600"
                    }`}
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                Loading resources...
              </p>
            </div>
          </div>
        ) : resources.length > 0 ? (
          <div className="animate-fadeIn">
            <div className="mb-4 sm:mb-6 text-slate-500 text-sm sm:text-base font-medium">
              Found {getUniqueResources(resources).length} resource
              {getUniqueResources(resources).length !== 1 ? "s" : ""}
            </div>
            <ResourceTable
              resources={getUniqueResources(resources)}
              showActions={true}
            />
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24 animate-slideUp">
            <div className="text-6xl sm:text-7xl mb-4 sm:mb-5">📚</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-3 sm:mb-4">
              No resources found
            </h3>
            <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-4">
              Try adjusting your filters or be the first to upload a resource
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="neu-btn-primary px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base"
            >
              ➕ Upload First Resource
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllResources;
