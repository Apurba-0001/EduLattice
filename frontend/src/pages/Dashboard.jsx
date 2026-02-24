import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import ResourceTable from "../components/ResourceTable";
import {
  SEMESTERS,
  getSubjectsBySemester,
  ALL_SUBJECTS,
} from "../constants/curriculum";

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    subject: "",
    semester: "",
    resourceType: "",
  });
  const [subjectOptions, setSubjectOptions] = useState(ALL_SUBJECTS);
  const resultsRef = useRef(null);

  const navigate = useNavigate();

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

  const fetchResources = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.semester) queryParams.append("semester", filters.semester);
      if (filters.resourceType)
        queryParams.append("resourceType", filters.resourceType);

      const response = await api.get(`/resources?${queryParams.toString()}`);
      setResources(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to results when they're loaded
  useEffect(() => {
    if (hasSearched && !loading && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [hasSearched, loading]);

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
    // Allow search even with empty keyword - filters alone can work
    setHasSearched(true);
    fetchResources();
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: "",
      subject: "",
      semester: "",
      resourceType: "",
    });
    setSubjectOptions(ALL_SUBJECTS);
    setHasSearched(false);
    setResources([]);
  };

  return (
    <div className="min-h-screen neu-bg py-6 sm:py-8 md:py-12 px-4 sm:px-6 animate-fadeIn">
      <div className="container max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 animate-slideDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-700 mb-2 sm:mb-3 leading-tight">
            Learning Resources
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed">
            Discover and explore study materials from our community
          </p>
        </div>

        {/* Search & Filter Card */}
        <div className="neu-surface-lg rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 mb-8 md:mb-12 animate-slideUp">
          <form onSubmit={handleSearch} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Keyword Search */}
              <div className="animate-slideIn">
                <label className="block text-xs sm:text-sm font-bold text-slate-500 mb-2 sm:mb-3 uppercase tracking-widest">
                  🔍 Search by Title
                </label>
                <input
                  type="text"
                  name="keyword"
                  placeholder="Enter resource name..."
                  className="neu-input w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                />
              </div>

              {/* Semester Filter */}
              <div
                className="animate-slideIn"
                style={{ animationDelay: "0.05s" }}
              >
                <label className="block text-xs sm:text-sm font-bold text-slate-500 mb-2 sm:mb-3 uppercase tracking-widest">
                  Semester
                </label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  className="neu-input w-full px-4 py-3 rounded-xl text-sm bg-transparent transition-all duration-200"
                >
                  <option value="">All Semesters</option>
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div
                className="animate-slideIn"
                style={{ animationDelay: "0.1s" }}
              >
                <label className="block text-xs sm:text-sm font-bold text-slate-500 mb-2 sm:mb-3 uppercase tracking-widest">
                  📚 Subject
                </label>
                <select
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="neu-input w-full px-4 py-3 rounded-xl text-sm bg-transparent transition-all duration-200"
                >
                  <option value="">All Subjects</option>
                  {subjectOptions.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resource Type Filter */}
              <div
                className="animate-slideIn"
                style={{ animationDelay: "0.15s" }}
              >
                <label className="block text-xs sm:text-sm font-bold text-slate-500 mb-2 sm:mb-3 uppercase tracking-widest">
                  📖 Type
                </label>
                <select
                  name="resourceType"
                  value={filters.resourceType}
                  onChange={handleFilterChange}
                  className="neu-input w-full px-4 py-3 rounded-xl text-sm bg-transparent transition-all duration-200"
                >
                  <option value="">All Types</option>
                  <option value="Class Notes">Class Notes</option>
                  <option value="Module">Module</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Exam Suggestion">Exam Suggestion</option>
                  <option value="Book">Book</option>
                  <option value="Lab Experiment">Lab Experiment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="flex flex-row gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-4 animate-slideIn"
              style={{ animationDelay: "0.2s" }}
            >
              <button
                type="submit"
                className="neu-btn-primary flex-1 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm"
              >
                🔍 Search Resources
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="neu-btn flex-1 px-5 py-3 rounded-xl font-semibold text-slate-600 text-xs sm:text-sm"
              >
                ✕ Clear Filters
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-5 sm:my-6">
            <hr className="neu-divider" />
          </div>

          {/* All Resources Button */}
          <button
            onClick={() => navigate("/all-resources")}
            className="w-full px-5 sm:px-6 py-3 sm:py-3.5 neu-btn font-semibold text-indigo-600 text-xs sm:text-sm min-h-[44px]"
          >
            📚 View All Resources
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 sm:mb-10 p-4 sm:p-5 neu-inset rounded-2xl border-l-4 border-red-400 animate-slideDown">
            <p className="text-red-600 font-medium text-sm sm:text-base leading-relaxed">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Content Area */}
        <div ref={resultsRef}>
          {!hasSearched ? (
            <div className="neu-surface rounded-2xl sm:rounded-3xl text-center py-16 sm:py-24 px-6 animate-slideUp">
              <div className="text-6xl sm:text-7xl mb-4 sm:mb-5">🔍</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-3 sm:mb-4">
                Start Searching
              </h3>
              <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                Use the filters above to search for resources that match your
                needs
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-16 sm:py-24">
              <div className="flex flex-col items-center gap-4 sm:gap-5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 rounded-full neu-bg"></div>
                </div>
                <p className="text-slate-500 font-medium text-sm sm:text-base">
                  Loading resources...
                </p>
              </div>
            </div>
          ) : resources.length > 0 ? (
            <div className="animate-fadeIn">
              <div className="mb-4 sm:mb-6 p-4 sm:p-5 neu-inset rounded-2xl border-l-4 border-green-400">
                <p className="text-green-600 font-semibold text-sm sm:text-base">
                  ✓ Found {getUniqueResources(resources).length} resource
                  {getUniqueResources(resources).length !== 1 ? "s" : ""}
                </p>
              </div>
              <ResourceTable
                resources={getUniqueResources(resources)}
                showActions={true}
              />
            </div>
          ) : (
            <div className="neu-surface rounded-2xl sm:rounded-3xl text-center py-16 sm:py-24 px-6 animate-slideUp">
              <div className="text-6xl sm:text-7xl mb-4 sm:mb-5">❌</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-3 sm:mb-4">
                No resources found
              </h3>
              <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                Try adjusting your filters or be the first to upload a resource
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="neu-btn-primary px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base min-h-[48px] rounded-3xl"
              >
                ➕ Upload First Resource
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
