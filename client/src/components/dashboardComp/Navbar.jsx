import React from "react";
import { NavLink } from "react-router-dom";
import { Apple } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  // Get current time for dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="logo-btn">
        <Apple className="nutrition-logo-icon" size={28} />
      </NavLink>

      <div className="navbar-greeting">
        <span className="greeting-text">{getGreeting()}</span>
        <span className="welcome-text">Welcome back</span>
      </div>

      <div className="navbar-spacer"></div>
    </header>
  );
};

export default Navbar;