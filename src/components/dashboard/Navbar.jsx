import { Search, Bell, MessageSquare, Sun, Moon, Zap, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { Link } from "react-router-dom";
import { useState } from "react";

const NOTIFICATIONS = [
  { id: 1, type: "message", text: "Alex sent you a message", time: "2m ago", unread: true },
  { id: 2, type: "story", text: "Emma posted a new Story", time: "15m ago", unread: true },
  { id: 3, type: "call", text: "Missed call from David", time: "1h ago", unread: false },
  { id: 4, type: "system", text: "Server health is 99.9%", time: "3h ago", unread: false },
];

const Navbar = () => {
  const { authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <header className="h-20 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 flex-shrink-0">

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-4 relative">

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
