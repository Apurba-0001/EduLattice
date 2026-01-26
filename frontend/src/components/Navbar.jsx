import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          📚 EduLattice
        </Link>

        <ul className="navbar-nav">
          {user ? (
            <>
              <li>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/upload" className="nav-link">
                  Upload Resource
                </Link>
              </li>
              <li>
                <Link to="/my-uploads" className="nav-link">
                  My Uploads
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" className="nav-link">
                    Admin Panel
                  </Link>
                </li>
              )}
              <li>
                <span style={{ color: "#4f46e5", fontWeight: "600" }}>
                  {user.name}
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
