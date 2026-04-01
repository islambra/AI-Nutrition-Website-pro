// src/components/Header.jsx
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom"; // Import useLocation
import { useAuth } from "../context/AuthContext";
import { UserCircle, Menu, LogOut, Apple, LayoutDashboard, User } from "lucide-react";
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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="header-container">
        <NavLink to="/" className="logo-btn">
          <Apple className="nutrition-logo-icon" size={28} />
        </NavLink>

        <nav className="desktop-nav-links">
          <NavLink to="/" className="nav-item">Home</NavLink>
          <NavLink to="/services" className="nav-item">Services</NavLink>
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
                <UserCircle size={32} />
              </button>
              <div className="dropdown">
                {user?.role === "Admin" && (
                  <NavLink to="/nutritionist/create-blog" className="dropdown-item">
                    Dashboard
                  </NavLink>
                )}
                <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}

          <button className="menu-icon-btn" onClick={toggleMenu} aria-label="Toggle navigation menu">
            <Menu size={28} />
          </button>
        </div>
      </div>

      <nav className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}>
        <NavLink to="/" className="mobile-nav-item">Home</NavLink>
        <NavLink to="/services" className="mobile-nav-item">Services</NavLink>
        <NavLink to="/blogs" className="mobile-nav-item">Blogs</NavLink>
        <NavLink to="/about" className="mobile-nav-item">About Us</NavLink>
        <NavLink to="/contact" className="mobile-nav-item">Contact Us</NavLink>
        
        {!user ? (
          <NavLink to="/login" className="mobile-nav-item mobile-login-btn">Sign in</NavLink>
        ) : (
          <div className="mobile-auth-section">
            <div className="mobile-user-info">
              <UserCircle size={24} />
              <span>{user.email || "User"}</span>
            </div>
            {user?.role === "Admin" && (
              <NavLink to="/admin/dashboard" className="mobile-nav-item">Dashboard</NavLink>
            )}
            <NavLink to="/profile" className="mobile-nav-item">Profile</NavLink>
            <button className="mobile-nav-item mobile-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;
