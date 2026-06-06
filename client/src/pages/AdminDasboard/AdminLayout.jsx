import Navbar from "../../components/dashboardComp/Navbar";
import AdminSideBar from "../../components/dashboardComp/AdminSideBar";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Outlet } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { chatOpen } = useChat();

  return (
    <div className="dashboard">
      <AnimatedBackground />
      {!chatOpen && <Navbar />}

      <div className="dashboard-body">
        {!chatOpen && <AdminSideBar />}

        <main className="dashboard-main">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
