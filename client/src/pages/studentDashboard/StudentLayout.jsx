import Navbar from "../../components/dashboardComp/Navbar";
import StudentSideBar from "../../components/dashboardComp/StudentSideBar";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Outlet } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import "../dieteticienDashboard/Layout.css";

const StudentLayout = () => {
  const { chatOpen } = useChat();

  return (
    <div className="dashboard">
      <AnimatedBackground />
      {!chatOpen && <Navbar />}

      <div className="dashboard-body">
        {!chatOpen && <StudentSideBar />}

        <main className="dashboard-main">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default StudentLayout;
