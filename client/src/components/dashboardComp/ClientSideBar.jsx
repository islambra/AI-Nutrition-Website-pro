import { useLocation, NavLink } from "react-router-dom";
import { clientMenuLinks } from "../../assets/assets";
import { useTranslation } from "react-i18next";
import "./SideBar.css";
import "./ClientSideBar.css";

const ClientSideBar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="sidebar client-sidebar">
      {clientMenuLinks.map((link, i) => (
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

export default ClientSideBar;
