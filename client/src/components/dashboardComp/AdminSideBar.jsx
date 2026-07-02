import { useLocation, NavLink } from "react-router-dom";
import { adminMenuLinks } from "../../assets/assets";
import { useTranslation } from "react-i18next";
import "./AdminSideBar.css";

const AdminSideBar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="sidebar">
      {adminMenuLinks.map((link, i) => (
        <NavLink
          key={i}
          to={link.path}
          className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
        >
          <img src={link.icon} alt="icon" className="sidebar-icon" />
          <span className="link-text">{t('dashboard.sidebar.' + link.name)}</span>
          {location.pathname === link.path && (
            <div className="active-indicator"></div>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default AdminSideBar;