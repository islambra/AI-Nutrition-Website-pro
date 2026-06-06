import React from "react";
import Navbar from "../../components/dashboardComp/Navbar";
import SideBar from "../../components/dashboardComp/SideBar";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Outlet } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import "./Layout.css";

const Layout = () => {
  const { chatOpen } = useChat();

  return (
    <div className="dashboard">
      <AnimatedBackground />
      {!chatOpen && <Navbar />}

      <div className="dashboard-body">
        {!chatOpen && <SideBar />}

        <main className="dashboard-main">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default Layout;
