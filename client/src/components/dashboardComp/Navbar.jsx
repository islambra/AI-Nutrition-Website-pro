import React from "react";
import { NavLink } from "react-router-dom";
import { Apple } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

const Navbar = () => {
  const { t } = useTranslation();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.navbar.goodMorning');
    if (hour < 18) return t('dashboard.navbar.goodAfternoon');
    return t('dashboard.navbar.goodEvening');
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="logo-btn">
        <Apple className="nutrition-logo-icon" size={28} />
      </NavLink>

      <div className="navbar-greeting">
        <span className="greeting-text">{getGreeting()}</span>
        <span className="welcome-text">{t('dashboard.navbar.welcomeBack')}</span>
      </div>

      <div className="navbar-spacer"></div>
    </header>
  );
};

export default Navbar;