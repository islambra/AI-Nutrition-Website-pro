import { useLocation, NavLink } from "react-router-dom";
import { studentMenuLinks } from "../../assets/assets";
import "./StudentSideBar.css";

const StudentSideBar = () => {
  const location = useLocation();

  return (
    <div className="sidebar student-sidebar">
      {studentMenuLinks.map((link, i) => (
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

export default StudentSideBar;
