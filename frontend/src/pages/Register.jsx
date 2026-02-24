import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role,
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center neu-bg px-4 sm:px-6 py-10 animate-fadeIn">
      {/* Brand mark */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <img
          src="/logo.png"
          alt="EduLattice Logo"
          className="h-16 w-auto flex-shrink-0"
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-700 tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Join our learning community
          </p>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="neu-surface-lg rounded-3xl p-7 sm:p-10 animate-slideUp">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl neu-inset border-l-4 border-red-400 animate-slideDown">
              <p className="text-red-600 text-sm font-semibold">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="animate-slideIn">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="neu-input w-full px-4 py-3 rounded-xl text-sm sm:text-base transition-all duration-200 focus:ring-0"
              />
            </div>

            {/* Email Field */}
            <div
              className="animate-slideIn"
              style={{ animationDelay: "0.05s" }}
            >
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className="neu-input w-full px-4 py-3 rounded-xl text-sm sm:text-base transition-all duration-200 focus:ring-0"
              />
            </div>

            {/* Password Field */}
            <div className="animate-slideIn" style={{ animationDelay: "0.1s" }}>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="neu-input w-full px-4 py-3 pr-12 rounded-xl text-sm sm:text-base transition-all duration-200 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors duration-200 text-lg"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div
              className="animate-slideIn"
              style={{ animationDelay: "0.15s" }}
            >
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="neu-input w-full px-4 py-3 pr-12 rounded-xl text-sm sm:text-base transition-all duration-200 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors duration-200 text-lg"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="neu-btn-primary w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-slideIn"
              style={{ animationDelay: "0.2s" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <hr className="neu-divider flex-1" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <hr className="neu-divider flex-1" />
          </div>

          {/* Login Link */}
          <p className="text-center text-slate-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors duration-200 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6 px-4">
          By registering, you agree to our terms and conditions
        </p>
      </div>
    </div>
  );
};

export default Register;
