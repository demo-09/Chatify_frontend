import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import BottomNav from "../components/dashboard/BottomNav";
import SocialSidebar from "../components/dashboard/SocialSidebar";
import { useState } from "react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-appbg overflow-hidden relative">
      <SocialSidebar />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto relative pb-16 lg:pb-0">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-accent/4 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent2/4 rounded-full blur-[100px] pointer-events-none" />
          <Outlet />
        </main>
        
        {/* Mobile Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default DashboardLayout;
