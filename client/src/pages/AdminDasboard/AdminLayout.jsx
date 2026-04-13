import Navbar from "../../components/dashboardComp/Navbar";
import AdminSideBar from "../../components/dashboardComp/AdminSideBar";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="dashboard">
      <AnimatedBackground />
      <Navbar />

      <div className="dashboard-body">
        <AdminSideBar />

        <main className="dashboard-main">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
