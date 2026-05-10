import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import BottomNav from "../components/dashboard/BottomNav";
import SocialSidebar from "../components/dashboard/SocialSidebar";
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

const DashboardLayout = () => {
  const { selectedUser } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-appbg overflow-hidden relative">
      <SocialSidebar />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <div className={`lg:hidden fixed inset-0 z-[110] transition-all duration-300 ${isSidebarOpen ? "visible" : "invisible"}`}>
         <div 
           className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`} 
           onClick={() => setIsSidebarOpen(false)}
         />
         <div className={`absolute top-0 left-0 h-full w-[280px] transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <Sidebar onNavClick={() => setIsSidebarOpen(false)} />
         </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="block">
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
        <main className={`flex-1 overflow-y-auto relative min-h-0 ${selectedUser ? "pb-0" : "pb-16 lg:pb-0"}`}>
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-accent/4 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent2/4 rounded-full blur-[100px] pointer-events-none" />
          <Outlet />
        </main>
        
        {/* Mobile Navigation */}
        {!selectedUser && <BottomNav />}
      </div>
    </div>
  );
};

export default DashboardLayout;
