import { useLocation, NavLink } from "react-router-dom";
import { adminMenuLinks } from "../../assets/assets";
import "./SideBar.css";

const SideBar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      {adminMenuLinks.map((link, i) => (
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

export default SideBar;