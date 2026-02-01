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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 sm:px-6 py-6 sm:py-12 lg:py-16 animate-fadeIn">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-10 animate-slideUp">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Join our learning community
            </p>
          </div>
          {/* Error Alert */}
          {error && (
            <div className="mb-6 sm:mb-7 p-4 sm:p-5 bg-red-50 border-l-4 border-red-500 rounded-xl animate-slideDown">
              <p className="text-red-700 text-sm sm:text-base font-medium leading-relaxed">
                ⚠️ {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name Field */}
            <div className="animate-slideIn">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base placeholder-gray-400"
              />
            </div>

            {/* Email Field */}
            <div
              className="animate-slideIn"
              style={{ animationDelay: "0.05s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base placeholder-gray-400"
              />
            </div>

            {/* Password Field */}
            <div className="animate-slideIn" style={{ animationDelay: "0.1s" }}>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e);
                    }
                  }}
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 text-lg sm:text-xl active:scale-90"
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
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e);
                    }
                  }}
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 text-lg sm:text-xl active:scale-90"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg sm:shadow-xl animate-slideIn text-sm sm:text-base min-h-[48px] sm:min-h-[52px] flex items-center justify-center mt-2"
              style={{ animationDelay: "0.2s" }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 sm:my-7 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-700 text-sm sm:text-base leading-relaxed">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors duration-200 hover:underline inline-block"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs sm:text-sm mt-6 sm:mt-8 px-4 leading-relaxed">
          By registering, you agree to our terms and conditions
        </p>
      </div>
    </div>
  );
};

export default Register;
