import { useLocation, NavLink } from "react-router-dom";
import { clientMenuLinks } from "../../assets/assets";
import "./StudentSideBar.css";

const ClientSideBar = () => {
  const location = useLocation();

  return (
    <div className="sidebar student-sidebar">
      {clientMenuLinks.map((link, i) => (
        <NavLink
          key={i}
          to={link.path}
          className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
        >
          <img src={link.icon} alt="icon" className="sidebar-icon" />
          <span className="link-text">{link.name}</span>
          {location.pathname === link.path && (
            <div className="active-indicator"></div>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default ClientSideBar;
