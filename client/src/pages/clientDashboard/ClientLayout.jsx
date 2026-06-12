import Navbar from "../../components/dashboardComp/Navbar";
import ClientSideBar from "../../components/dashboardComp/ClientSideBar";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Outlet } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import "../dieteticienDashboard/Layout.css";

const ClientLayout = () => {
  const { chatOpen } = useChat();
  return (
    <div className="dashboard">
      <AnimatedBackground />
      {!chatOpen && <Navbar />}
      <div className="dashboard-body">
        {!chatOpen && <ClientSideBar />}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
