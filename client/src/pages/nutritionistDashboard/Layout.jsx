import React from "react";
import Navbar from "../../components/dashboardComp/Navbar";
import SideBar from "../../components/dashboardComp/SideBar";
import { Outlet } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="dashboard">

      <Navbar />

      <div className="dashboard-body">
        <SideBar />

        <main className="dashboard-main">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default Layout;
