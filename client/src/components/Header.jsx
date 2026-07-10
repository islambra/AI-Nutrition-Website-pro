// src/components/Header.jsx
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation, Trans } from "react-i18next";
import { UserCircle, Menu, LogOut, Apple, LayoutDashboard, User, Zap, X, Globe, Search } from "lucide-react";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLangMenu(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    setShowLogout(true);
  };

  const closeLogout = () => setShowLogout(false);

  const confirmLogout = () => {
    logout();
    setShowLogout(false);
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
    setShowLogout(false);
    setShowLangMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showLogout) return;
    const onKey = (e) => { if (e.key === "Escape") setShowLogout(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLogout]);

  return (
    <>
      <div className="header-container">
        <NavLink to="/" className="logo-btn">
          <Apple className="nutrition-logo-icon" size={28} />
          <span className="logo-text"><Trans i18nKey="nav.brandNameHtml" components={{1: <span className="logo-text-accent" />}} /></span>
        </NavLink>

        <nav className="desktop-nav-links">
          <NavLink to="/" className="nav-item">{t('nav.home')}</NavLink>
          <NavLink to="/find-dietitians" className="nav-item nav-item-accent">
            <Search size={14} style={{ marginRight: 4 }} />
            {t('nav.findDietitians')}
          </NavLink>
          {user?.role !== "admin" && user?.role !== "dieteticien" && (
            <NavLink to="/services" className="nav-item">{t('nav.services')}</NavLink>
          )}
          <NavLink to="/blogs" className="nav-item">{t('nav.blogs')}</NavLink>
          <NavLink to="/about" className="nav-item">{t('nav.about')}</NavLink>
          <NavLink to="/contact" className="nav-item">{t('nav.contact')}</NavLink>
        </nav>

        <div className="management-box">
          {!user ? (
            <NavLink to="/login" className="sign-in-btn">
              {t('nav.signIn')}
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
                {(user?.role === "admin" || user?.role === "dieteticien") && (
                  <NavLink to={getDashboardPath()} className="dropdown-item">
                    <LayoutDashboard size={16} />
                    {t('nav.dashboard')}
                  </NavLink>
                )}
                {isClientRole() && (
                  <>
                    <NavLink to="/client/dashboard" className="dropdown-item">
                      <LayoutDashboard size={16} />
                      {t('nav.dashboard')}
                    </NavLink>
                    <NavLink to="/profile" className="dropdown-item">
                      <User size={16} />
                      {t('nav.profile')}
                    </NavLink>
                    <NavLink to="/ai-tool" className="dropdown-item">
                      <Zap size={16} />
                      {t('nav.aiScanner')}
                    </NavLink>
                  </>
                )}
                {isStudent() && (
                  <>
                    <NavLink to="/student/my-courses" className="dropdown-item">
                      <LayoutDashboard size={16} />
                      {t('nav.dashboard')}
                    </NavLink>
                    <NavLink to="/profile" className="dropdown-item">
                      <User size={16} />
                      {t('nav.profile')}
                    </NavLink>
                  </>
                )}
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          )}

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="lang-switcher-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              aria-label={t('nav.switchLanguage')}
              style={{ background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
            >
              <Globe size={16} />
              {i18n.language === 'fr' ? 'FR' : 'EN'}
            </button>
            {showLangMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '120px' }}>
                <button onClick={() => changeLanguage('en')} style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: i18n.language === 'en' ? '#E8F5E9' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: '14px', borderRadius: '8px 8px 0 0' }}>
                  🇬🇧 {t('nav.langEn')}
                </button>
                <button onClick={() => changeLanguage('fr')} style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: i18n.language === 'fr' ? '#E8F5E9' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: '14px', borderRadius: '0 0 8px 8px' }}>
                  🇫🇷 {t('nav.langFr')}
                </button>
              </div>
            )}
          </div>

          <button className="menu-icon-btn" onClick={toggleMenu} aria-label={t('nav.toggleMenu')}>
            <Menu size={28} />
          </button>
        </div>
      </div>

      <nav className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}>
        <button className="mobile-close-btn" onClick={toggleMenu} aria-label={t('nav.closeMenu')}>
          <X size={28} />
        </button>
        <NavLink to="/" className="mobile-nav-item">{t('nav.home')}</NavLink>
        <NavLink to="/find-dietitians" className="mobile-nav-item mobile-nav-accent">
          <Search size={18} />
          {t('nav.findDietitians')}
        </NavLink>
        {user?.role !== "admin" && user?.role !== "dieteticien" && (
          <NavLink to="/services" className="mobile-nav-item">{t('nav.services')}</NavLink>
        )}
        <NavLink to="/blogs" className="mobile-nav-item">{t('nav.blogs')}</NavLink>
        <NavLink to="/about" className="mobile-nav-item">{t('nav.about')}</NavLink>
        <NavLink to="/contact" className="mobile-nav-item">{t('nav.contact')}</NavLink>
        
        {!user ? (
          <NavLink to="/login" className="mobile-nav-item mobile-login-btn">{t('nav.signIn')}</NavLink>
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
              <span>{user?.fullName || user?.name || user?.email || t('common.unknown')}</span>
            </div>
            {(user?.role === "admin" || user?.role === "dieteticien") && (
              <NavLink to={getDashboardPath()} className="mobile-nav-item">
                <LayoutDashboard size={16} />
                {t('nav.dashboard')}
              </NavLink>
            )}
            {isClientRole() && (
              <>
                <NavLink to="/client/dashboard" className="mobile-nav-item">
                  <LayoutDashboard size={16} />
                  {t('nav.dashboard')}
                </NavLink>
                <NavLink to="/profile" className="mobile-nav-item">
                  <User size={16} />
                  {t('nav.profile')}
                </NavLink>
                <NavLink to="/ai-tool" className="mobile-nav-item">
                  <Zap size={16} />
                  {t('nav.aiScanner')}
                </NavLink>
              </>
            )}
            {isStudent() && (
              <>
                <NavLink to="/student/my-courses" className="mobile-nav-item">
                  <LayoutDashboard size={16} />
                  {t('nav.dashboard')}
                </NavLink>
                <NavLink to="/profile" className="mobile-nav-item">
                  <User size={16} />
                  {t('nav.profile')}
                </NavLink>
              </>
            )}
            <button className="mobile-nav-item mobile-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              {t('nav.logout')}
            </button>
          </div>
        )}
      </nav>

      {showLogout && (
        <div className="logout-modal" onClick={closeLogout}>
          <div className="logout-modal-card" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <LogOut size={22} />
            </div>
            <h3 className="logout-modal-title">{t('nav.logoutTitle')}</h3>
            <p className="logout-modal-desc">
              {t('nav.logoutDesc')}
            </p>
            <div className="logout-modal-actions">
              <button className="logout-modal-secondary" onClick={closeLogout}>
                {t('nav.cancel')}
              </button>
              <button className="logout-modal-primary" onClick={confirmLogout}>
                <LogOut size={16} />
                {t('nav.logoutTitle')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;