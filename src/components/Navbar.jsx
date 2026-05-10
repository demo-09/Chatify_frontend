import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Bot } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const navLinks = [
    { to: "/", icon: MessageSquare, label: "Chats" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <header className="fixed w-full top-0 z-50">
      {/* Backdrop blur bar */}
      <div className="bg-appbg/80 backdrop-blur-2xl border-b border-app">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-main flex items-center justify-center shadow-glow group-hover:shadow-glow-strong transition-all duration-300">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text hidden sm:block tracking-tight">
              Chatify
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {authUser ? (
              <>
                {/* AI badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent">AI On</span>
                </div>

                {/* Profile */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="avatar-ring w-8 h-8 flex-shrink-0">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt={authUser.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                    {authUser.fullName?.split(" ")[0]}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
