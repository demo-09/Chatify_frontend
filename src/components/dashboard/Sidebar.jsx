import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, Camera, CircleDashed,
  Phone, Mail, Bot, Users, BarChart3, Settings, LogOut,
  Crown, ChevronRight, X
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const navItems = [
  { to: "/", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/chats", icon: MessageSquare, label: "Chats" },
  { to: "/snaps", icon: Camera, label: "Snaps", badge: "NEW", badgeColor: "bg-accent2/20 text-accent2" },
  { to: "/stories", icon: CircleDashed, label: "Stories" },
  { to: "/calls", icon: Phone, label: "Calls" },
  { to: "/ai-tools", icon: Bot, label: "AI Tools", badge: "NEW", badgeColor: "bg-accent2/20 text-accent2" },
  { to: "/users", icon: Users, label: "Users" },
];

const Sidebar = () => {
  const { logout, authUser } = useAuthStore();

  const filteredNavItems = navItems.filter(item => {
    if (authUser?.role !== "admin") {
      return item.label !== "Dashboard" && item.label !== "Users";
    }
    return true;
  });

  return (
    <aside className="w-[280px] h-full bg-[#0d0e14] border-r border-white/5 flex flex-col flex-shrink-0 transition-all duration-300">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-4 lg:px-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-main flex items-center justify-center shadow-glow">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <span className="font-display font-bold text-xl text-white tracking-tight leading-none block">ChatiFy</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2 lg:px-4 space-y-0.5 no-scrollbar">
        <div className="hidden lg:block text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-2">Menu</div>

        {filteredNavItems.map(({ to, end, icon: Icon, label, badge, badgeColor }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
              ${isActive
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-white/5 hover:text-white"
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-accent rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 min-w-[20px] transition-colors ${isActive ? "text-accent" : "text-muted group-hover:text-white"}`} />
                <span className="hidden lg:block font-medium text-sm">{label}</span>
                {badge && (
                  <span className={`hidden lg:block ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}`}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-6 mb-3 px-2">
          <div className="h-px bg-white/5" />
        </div>

        <div className="hidden lg:block text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-2">Preferences</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
            ${isActive ? "bg-accent/10 text-accent" : "text-muted hover:bg-white/5 hover:text-white"}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-accent rounded-r-full" />}
              <Settings className={`w-5 h-5 min-w-[20px] ${isActive ? "text-accent" : "text-muted group-hover:text-white"}`} />
              <span className="hidden lg:block font-medium text-sm">Settings</span>
            </>
          )}
        </NavLink>
      </div>

      {/* Footer / User + Logout */}
      <div className="p-2 lg:p-4 border-t border-white/5 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-3 p-3 rounded-xl bg-white/3 mb-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
            <img src={authUser?.profilePic || "/avatar.png"} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{authUser?.fullName}</div>
            <div className="text-[10px] text-muted truncate">{authUser?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center lg:justify-start gap-3 w-full px-3 py-2.5 rounded-xl text-muted hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
        >
          <LogOut className="w-5 h-5 min-w-[20px] group-hover:text-rose-400 transition-colors" />
          <span className="hidden lg:block font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
