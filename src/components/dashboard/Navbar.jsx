import { Search, Bell, MessageSquare, Sun, Moon, Zap, X, Menu } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSocialStore } from "../../store/useSocialStore";
import { useChatStore } from "../../store/useChatStore";

const NOTIFICATIONS = [
  { id: 1, type: "message", text: "Alex sent you a message", time: "2m ago", unread: true },
  { id: 2, type: "story", text: "Emma posted a new Story", time: "15m ago", unread: true },
  { id: 3, type: "call", text: "Missed call from David", time: "1h ago", unread: false },
  { id: 4, type: "system", text: "Server health is 99.9%", time: "3h ago", unread: false },
];

const Navbar = ({ onMenuClick }) => {
  const { authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { isSidebarVisible, toggleSidebar } = useSocialStore();
  const { selectedUser } = useChatStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <header className="h-16 lg:h-20 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 flex-shrink-0 transition-all">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={onMenuClick}
          className="p-2 lg:hidden rounded-xl text-muted hover:text-main hover:bg-white/5 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo/Title (Mobile) */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-main flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">ChatiFy</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-4 relative">
        {/* Social Toggle (Desktop) */}
        {!selectedUser && (
          <button
            onClick={toggleSidebar}
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all
              ${isSidebarVisible
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-surface border-white/6 text-muted hover:border-white/20 hover:text-main"}
            `}
          >
            <Zap className={`w-4 h-4 ${isSidebarVisible ? "fill-accent" : ""}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Social</span>
          </button>
        )}

        {/* User Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-full border border-white/6 hover:border-accent/30 bg-surface hover:bg-white/6 transition-all group"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-main leading-tight">{authUser?.fullName?.split(" ")[0]}</div>
            <div className="text-[10px] text-accent font-bold uppercase tracking-wider">{authUser?.role === "admin" ? "Admin" : "User"}</div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
