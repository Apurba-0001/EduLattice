import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNameClick = () => {
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50 animate-slideDown">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 xl:px-6">
          <div className="flex justify-between items-center h-auto py-1 sm:py-1.5 md:py-2 xl:py-1.5 flex-wrap gap-2 sm:gap-2 md:gap-3 xl:gap-3">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-2 md:gap-2.5 xl:gap-2 hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
            >
              <img
                src="/logo.png"
                alt="EduLattice Logo"
                className="h-24 sm:h-26 md:h-28 lg:h-30 xl:h-28 w-auto"
              />
              <span
                className="hidden sm:inline text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                style={{
                  fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
                }}
              >
                EduLattice
              </span>
            </Link>

            {/* Navigation Links - Visible on all screen sizes */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-4 flex-wrap justify-center">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex flex-col items-center justify-center gap-1 md:gap-1.5 xl:gap-1 p-2 md:p-2.5 xl:p-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 rounded-lg hover:bg-indigo-50"
                  >
                    <span className="text-2xl md:text-3xl xl:text-2xl">📊</span>
                    <span className="text-xs sm:text-sm md:text-sm xl:text-sm whitespace-nowrap">
                      Dashboard
                    </span>
                  </Link>
                  <Link
                    to="/upload"
                    className="flex flex-col items-center justify-center gap-1 md:gap-1.5 xl:gap-1 p-2 md:p-2.5 xl:p-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 rounded-lg hover:bg-indigo-50"
                  >
                    <span className="text-2xl md:text-3xl xl:text-2xl">📤</span>
                    <span className="text-xs sm:text-sm md:text-sm xl:text-sm whitespace-nowrap">
                      Upload
                    </span>
                  </Link>
                  <Link
                    to="/my-uploads"
                    className="flex flex-col items-center justify-center gap-1 md:gap-1.5 xl:gap-1 p-2 md:p-2.5 xl:p-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 rounded-lg hover:bg-indigo-50"
                  >
                    <span className="text-2xl md:text-3xl xl:text-2xl">📁</span>
                    <span className="text-xs sm:text-sm md:text-sm xl:text-sm whitespace-nowrap">
                      My Uploads
                    </span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex flex-col items-center justify-center gap-1 md:gap-1.5 xl:gap-1 p-2 md:p-2.5 xl:p-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 rounded-lg hover:bg-indigo-50"
                    >
                      <span className="text-2xl md:text-3xl xl:text-2xl">
                        🔑
                      </span>
                      <span className="text-xs sm:text-sm md:text-sm xl:text-sm whitespace-nowrap">
                        Admin
                      </span>
                    </Link>
                  )}

                  {/* User Profile Button */}
                  <button
                    onClick={handleNameClick}
                    className="flex flex-col items-center justify-center gap-1 md:gap-1.5 xl:gap-1 px-2 md:px-2.5 xl:px-2 py-2 md:py-2.5 xl:py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 rounded-lg hover:bg-indigo-50"
                  >
                    <span className="text-2xl md:text-3xl xl:text-2xl">👤</span>
                    <span className="text-xs md:text-sm xl:text-sm whitespace-nowrap">
                      Profile
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex flex-col items-center justify-center gap-1 md:gap-1.5 xl:gap-1 px-3 md:px-4 xl:px-4 py-2 md:py-2.5 xl:py-2 text-indigo-600 font-semibold border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <span className="text-2xl md:text-3xl xl:text-2xl">🔐</span>
                    <span className="text-xs md:text-sm xl:text-sm whitespace-nowrap">
                      Login
                    </span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex flex-col items-center justify-center gap-1 md:gap-1.5 xl:gap-1 px-3 md:px-4 xl:px-4 py-2 md:py-2.5 xl:py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <span className="text-2xl md:text-3xl xl:text-2xl">✍️</span>
                    <span className="text-xs md:text-sm xl:text-sm whitespace-nowrap">
                      Register
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && user && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-2 sm:p-4 md:p-6 xl:p-8 animate-fadeIn"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 xl:p-12 w-full max-w-md lg:max-w-4xl xl:max-w-5xl max-h-[90vh] lg:max-h-none lg:h-auto overflow-y-auto lg:overflow-y-visible animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900">
                My Profile
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl xl:text-4xl transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Profile Content - Landscape layout on desktop */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-7 lg:gap-8 xl:gap-10 mb-6">
              {/* Left side - Avatar Card */}
              <div className="lg:flex-shrink-0">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 md:p-7 xl:p-8">
                  <div className="flex lg:flex-col items-center gap-4 md:gap-5 xl:gap-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl shadow-lg flex-shrink-0">
                      👤
                    </div>
                    <div className="lg:text-center">
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base xl:text-lg text-gray-600 break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Profile Info Grid */}
              <div className="flex-1">
                <div className="space-y-4 md:space-y-5 xl:space-y-6">
                  <div className="border-b border-gray-200 pb-4 md:pb-5 xl:pb-6">
                    <label className="text-xs md:text-sm xl:text-base font-bold text-gray-500 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base md:text-lg xl:text-xl break-all">
                      {user.email}
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4 md:pb-5 xl:pb-6">
                    <label className="text-xs md:text-sm xl:text-base font-bold text-gray-500 uppercase tracking-wide">
                      Full Name
                    </label>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base md:text-lg xl:text-xl">
                      {user.name}
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4 md:pb-5 xl:pb-6">
                    <label className="text-xs md:text-sm xl:text-base font-bold text-gray-500 uppercase tracking-wide">
                      Date Joined
                    </label>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base md:text-lg xl:text-xl">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm xl:text-base font-bold text-gray-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-1">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-2 md:gap-2.5 xl:gap-3 px-3 md:px-4 xl:px-5 py-1 md:py-1.5 xl:py-2 bg-green-100 text-green-700 rounded-full font-semibold text-xs sm:text-sm md:text-base xl:text-lg">
                          <span>🔑</span> Admin User
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 md:gap-2.5 xl:gap-3 px-3 md:px-4 xl:px-5 py-1 md:py-1.5 xl:py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs sm:text-sm md:text-base xl:text-lg">
                          <span>👤</span> Regular User
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4 xl:gap-5 w-full">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 sm:py-3 md:py-3.5 xl:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base md:text-lg xl:text-xl"
              >
                🚪 Logout
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 sm:py-3 md:py-3.5 xl:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base md:text-lg xl:text-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
