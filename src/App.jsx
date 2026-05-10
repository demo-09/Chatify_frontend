import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import StoriesPage from "./pages/StoriesPage";
import SnapsPage from "./pages/SnapsPage";
import CallsPage from "./pages/CallsPage";
import UsersPage from "./pages/UsersPage";
import AIToolsPage from "./pages/AIToolsPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme || "coffee");
  }, [theme]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-main flex items-center justify-center shadow-glow animate-pulse-glow">
            <Loader className="size-6 text-white animate-spin" />
          </div>
          <p className="text-muted text-sm">Loading ChatFy...</p>
        </div>
      </div>
    );

  return (
    <div>
      <Routes>
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/" element={authUser ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={authUser?.role === "admin" ? <DashboardHome /> : <Navigate to="/chats" />} />
          <Route path="chats" element={<ChatPage />} />
          <Route path="snaps" element={<SnapsPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="calls" element={<CallsPage />} />
          <Route path="ai-tools" element={<AIToolsPage />} />
          <Route path="users" element={authUser?.role === "admin" ? <UsersPage /> : <Navigate to="/chats" />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>

      <Toaster
        position="bottom-right"
        containerStyle={{ zIndex: 9999999 }}
        toastOptions={{
          style: {
            background: "#181920",
            color: "#f1f1f5",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#7c6ff7", secondary: "#fff" } },
        }}
      />
    </div>
  );
};
export default App;
