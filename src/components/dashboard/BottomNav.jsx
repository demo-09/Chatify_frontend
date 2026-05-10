import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Camera, CircleDashed, Settings, Users, Phone, Bot } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const BottomNav = () => {
  const { authUser } = useAuthStore();

  const navItems = [
    { to: "/", end: true, icon: LayoutDashboard, label: "Home", adminOnly: true },
    { to: "/chats", icon: MessageSquare, label: "Chats" },
    { to: "/snaps", icon: Camera, label: "Snaps" },
    { to: "/stories", icon: CircleDashed, label: "Stories" },
    { to: "/calls", icon: Phone, label: "Calls" },
    { to: "/ai-tools", icon: Bot, label: "AI" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const filteredItems = navItems.filter(item => 
    !item.adminOnly || authUser?.role === "admin"
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d0e14]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-[100] pb-safe">
      {filteredItems.map(({ to, end, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `
            flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative
            ${isActive ? "text-accent" : "text-muted"}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-accent rounded-full shadow-[0_0_8px_rgba(124,111,247,0.5)]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? "animate-pulse-subtle" : ""}`} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
