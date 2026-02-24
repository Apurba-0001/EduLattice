import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
      isActive(path)
        ? "shadow-neu-inset text-indigo-600"
        : "text-slate-600 hover:text-indigo-600"
    }`;

  const mobileNavLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? "shadow-neu-inset text-indigo-600"
        : "text-slate-600 hover:text-indigo-600"
    }`;

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backgroundColor: "var(--neu-bg)",
          boxShadow:
            "0 4px 12px var(--neu-shadow-dark), 0 -1px 4px var(--neu-shadow-light)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src="/logo.png"
                alt="EduLattice Logo"
                className="h-[52px] w-auto"
              />
              <span className="hidden sm:block text-lg font-extrabold text-slate-700 tracking-tight">
                EduLattice
              </span>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <div className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                    <span>📊</span> Dashboard
                  </Link>
                  <Link to="/upload" className={navLinkClass("/upload")}>
                    <span>📤</span> Upload
                  </Link>
                  <Link
                    to="/my-uploads"
                    className={navLinkClass("/my-uploads")}
                  >
                    <span>📁</span> My Uploads
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={navLinkClass("/admin")}>
                      <span>🔑</span> Admin
                    </Link>
                  )}
                  {/* Profile pill */}
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 ml-2 pl-3 pr-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 transition-all duration-200"
                    style={{ boxShadow: "var(--neu-raised-sm)" }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold uppercase text-white"
                      style={{
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      }}
                    >
                      {user.name?.[0] || "U"}
                    </span>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-lg hover:text-indigo-600 transition-all duration-200"
                    style={{ boxShadow: "var(--neu-raised-sm)" }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="ml-2 px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      boxShadow:
                        "4px 4px 10px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)",
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* ── MOBILE: right side ── */}
            <div className="flex md:hidden items-center gap-2">
              {user && (
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    closeMobileMenu();
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: "var(--neu-raised-sm)",
                  }}
                >
                  {user.name?.[0] || "U"}
                </button>
              )}
              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors duration-200"
                style={{
                  boxShadow: mobileMenuOpen
                    ? "var(--neu-inset-sm)"
                    : "var(--neu-raised-sm)",
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE FLOATING MENU ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={closeMobileMenu}
          />
          <div
            className="fixed top-14 right-3 z-50 md:hidden w-72 rounded-2xl overflow-hidden animate-slideDown"
            style={{
              backgroundColor: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-lg)",
            }}
          >
            {user ? (
              <>
                {/* User info strip */}
                <div
                  className="flex items-center gap-3 px-4 py-4"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold uppercase text-sm flex-shrink-0">
                    {user.name?.[0] || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-indigo-200 truncate">
                      {user.email}
                    </p>
                    {isAdmin && (
                      <span className="inline-block mt-0.5 text-xs font-bold text-amber-300">
                        🔑 Admin
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className={mobileNavLinkClass("/dashboard")}
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <Link
                    to="/upload"
                    onClick={closeMobileMenu}
                    className={mobileNavLinkClass("/upload")}
                  >
                    <span>📤</span> Upload
                  </Link>
                  <Link
                    to="/my-uploads"
                    onClick={closeMobileMenu}
                    className={mobileNavLinkClass("/my-uploads")}
                  >
                    <span>📁</span> My Uploads
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className={mobileNavLinkClass("/admin")}
                    >
                      <span>🔑</span> Admin Panel
                    </Link>
                  )}
                </div>

                <div
                  className="px-2 pb-2 pt-1"
                  style={{ borderTop: "1px solid var(--neu-shadow-dark)" }}
                >
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 transition-all duration-200 hover:text-red-600"
                    style={{ boxShadow: "var(--neu-raised-sm)" }}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="p-2 space-y-1">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all duration-200"
                  style={{ boxShadow: "var(--neu-raised-sm)" }}
                >
                  🔐 Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: "4px 4px 10px var(--neu-shadow-dark)",
                  }}
                >
                  ✍️ Register
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && user && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl animate-slideUp"
            style={{
              backgroundColor: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--neu-shadow-dark)" }}
            >
              <h2 className="text-lg font-bold text-slate-700">My Profile</h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 transition-colors duration-200 text-lg"
                style={{ boxShadow: "var(--neu-raised-sm)" }}
              >
                ✕
              </button>
            </div>

            {/* Avatar section */}
            <div
              className="px-6 py-6 flex items-center gap-4"
              style={{ boxShadow: "var(--neu-inset-sm)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
              >
                {user.name?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-700 truncate">
                  {user.name}
                </p>
                <p className="text-sm text-slate-500 break-all">{user.email}</p>
                <span
                  className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isAdmin ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}
                >
                  {isAdmin ? "🔑 Admin" : "👤 Student"}
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div className="px-6 py-4 space-y-3">
              {[
                { label: "Full Name", value: user.name },
                { label: "Email", value: user.email },
                {
                  label: "Joined",
                  value: user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid var(--neu-shadow-dark)" }}
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-slate-700 break-all text-right max-w-[200px]">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  boxShadow:
                    "4px 4px 10px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)",
                }}
              >
                🚪 Logout
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  boxShadow:
                    "4px 4px 10px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)",
                }}
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
