import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

const DashboardLayout = () => {
  return (
    <div className="h-screen flex bg-appbg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto relative">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-accent/4 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent2/4 rounded-full blur-[100px] pointer-events-none" />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
