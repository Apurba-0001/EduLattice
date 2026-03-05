import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
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
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center neu-bg px-4 sm:px-6 py-10 animate-fadeIn">
      {/* Brand mark above card */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <img
          src="/logo.png"
          alt="EduLattice Logo"
          className="h-16 w-auto flex-shrink-0"
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-700 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sign in to your learning hub
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="animate-slideIn">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors duration-200"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <hr className="neu-divider flex-1" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <hr className="neu-divider flex-1" />
          </div>

          {/* Register Link */}
          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors duration-200 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6 px-4">
          By logging in, you agree to our terms and conditions
        </p>
      </div>
    </div>
  );
};

export default Login;
