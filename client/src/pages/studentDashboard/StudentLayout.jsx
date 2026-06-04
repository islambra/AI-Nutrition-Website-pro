import Navbar from "../../components/dashboardComp/Navbar";
import StudentSideBar from "../../components/dashboardComp/StudentSideBar";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Outlet } from "react-router-dom";
import "../dieteticienDashboard/Layout.css";

const StudentLayout = () => {
  return (
    <div className="dashboard">
      <AnimatedBackground />
      <Navbar />

      <div className="dashboard-body">
        <StudentSideBar />

        <main className="dashboard-main">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default StudentLayout;
