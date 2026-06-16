// src/components/Header.jsx
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Menu, LogOut, Apple, LayoutDashboard, User, Zap, X } from "lucide-react";
import toast from "react-hot-toast";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    toast((t) => (
      <div style={{ fontFamily: "Arial, sans-serif", color: "#333" }}>
        <p style={{ margin: 0, fontWeight: "bold", marginBottom: "10px" }}>
          Are you sure you want to logout?
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={() => {
              logout();
              toast.dismiss(t.id);
              toast.success("Logged out successfully");
            }}
            style={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Yes
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      style: { padding: "15px", borderRadius: "10px", background: "#f0f0f0" }
    });
  };

  const getDashboardPath = () => {
    if (user?.role === "admin") {
      return "/admin/add-admin-nutritionist";
    } else if (user?.role === "dieteticien") {
      return "/dieteticien/create-blog";
    }
    return "/dashboard"; // fallback
  };

  // Get user profile picture URL
  const getUserPhoto = () => {
    return user?.photo || user?.profilePicture || null;
  };

  // Check if user is a client
  const isClientRole = () => {
    return user?.role === "client";
  };

  const isStudent = () => {
    return user?.role === "student";
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="header-container">
        <NavLink to="/" className="logo-btn">
          <Apple className="nutrition-logo-icon" size={28} />
          <span className="logo-text">Bite<span className="logo-text-accent">Wise</span></span>
        </NavLink>

        <nav className="desktop-nav-links">
          <NavLink to="/" className="nav-item">Home</NavLink>
          {user?.role !== "admin" && user?.role !== "dieteticien" && (
            <NavLink to="/services" className="nav-item">Services</NavLink>
          )}
          <NavLink to="/blogs" className="nav-item">Blogs</NavLink>
          <NavLink to="/about" className="nav-item">About Us</NavLink>
          <NavLink to="/contact" className="nav-item">Contact Us</NavLink>
        </nav>

        <div className="management-box">
          {!user ? (
            <NavLink to="/login" className="sign-in-btn">
              Sign in
            </NavLink>
          ) : (
            <div className="user-menu">
              <button className="user-icon">
                {getUserPhoto() ? (
                  <img 
                    src={getUserPhoto()} 
                    alt={user?.fullName || user?.name || "User"}
                    className="user-avatar-img"
                  />
                ) : (
                  <UserCircle size={32} className="default-avatar-icon" />
                )}
              </button>
              <div className="dropdown">
                {/* Dashboard link based on role */}
                {(user?.role === "admin" || user?.role === "dieteticien") && (
                  <NavLink to={getDashboardPath()} className="dropdown-item">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </NavLink>
                )}
                {/* Profile & Plans links for Clients */}
                {isClientRole() && (
                  <>
                    <NavLink to="/client/dashboard" className="dropdown-item">
                      <LayoutDashboard size={16} />
                      Dashboard
                    </NavLink>
                    <NavLink to="/profile" className="dropdown-item">
                      <User size={16} />
                      Profile
                    </NavLink>
                    <NavLink to="/ai-tool" className="dropdown-item">
                      <Zap size={16} />
                      AI Scanner
                    </NavLink>
                  </>
                )}
                {/* Student Dashboard links */}
                {isStudent() && (
                  <>
                    <NavLink to="/student/my-courses" className="dropdown-item">
                      <LayoutDashboard size={16} />
                      Dashboard
                    </NavLink>
                    <NavLink to="/profile" className="dropdown-item">
                      <User size={16} />
                      Profile
                    </NavLink>
                  </>
                )}
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}

          <button className="menu-icon-btn" onClick={toggleMenu} aria-label="Toggle navigation menu">
            <Menu size={28} />
          </button>
        </div>
      </div>

      <nav className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}>
        <button className="mobile-close-btn" onClick={toggleMenu} aria-label="Close menu">
          <X size={28} />
        </button>
        <NavLink to="/" className="mobile-nav-item">Home</NavLink>
        {user?.role !== "admin" && user?.role !== "dieteticien" && (
          <NavLink to="/services" className="mobile-nav-item">Services</NavLink>
        )}
        <NavLink to="/blogs" className="mobile-nav-item">Blogs</NavLink>
        <NavLink to="/about" className="mobile-nav-item">About Us</NavLink>
        <NavLink to="/contact" className="mobile-nav-item">Contact Us</NavLink>
        
        {!user ? (
          <NavLink to="/login" className="mobile-nav-item mobile-login-btn">Sign in</NavLink>
        ) : (
          <div className="mobile-auth-section">
            <div className="mobile-user-info">
              {getUserPhoto() ? (
                <img 
                  src={getUserPhoto()} 
                  alt={user?.fullName || user?.name || "User"}
                  className="mobile-user-avatar"
                />
              ) : (
                <UserCircle size={24} className="mobile-default-avatar" />
              )}
              <span>{user?.fullName || user?.name || user?.email || "User"}</span>
            </div>
            {/* Dashboard link based on role for mobile */}
            {(user?.role === "admin" || user?.role === "dieteticien") && (
              <NavLink to={getDashboardPath()} className="mobile-nav-item">
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
            )}
            {/* Profile & Plans links for Clients on mobile */}
            {isClientRole() && (
              <>
                <NavLink to="/client/dashboard" className="mobile-nav-item">
                  <LayoutDashboard size={16} />
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className="mobile-nav-item">
                  <User size={16} />
                  Profile
                </NavLink>
                <NavLink to="/ai-tool" className="mobile-nav-item">
                  <Zap size={16} />
                  AI Scanner
                </NavLink>
              </>
            )}
            {/* Student Dashboard links on mobile */}
            {isStudent() && (
              <>
                <NavLink to="/student/my-courses" className="mobile-nav-item">
                  <LayoutDashboard size={16} />
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className="mobile-nav-item">
                  <User size={16} />
                  Profile
                </NavLink>
              </>
            )}
            <button className="mobile-nav-item mobile-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;