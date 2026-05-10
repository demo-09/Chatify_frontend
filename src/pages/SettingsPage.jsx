import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, Palette, Eye, Bell, Lock, Globe, Monitor, Trash2, Download, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState("appearance");
  
  // Notification state
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem("chat-notifications");
    return saved ? JSON.parse(saved) : { push: true, browser: true, email: false, sound: true, mentions: true, stories: false };
  });

  // Privacy state
  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem("chat-privacy");
    return saved ? JSON.parse(saved) : { onlineStatus: true, readReceipts: true, profilePhoto: "everyone" };
  });

  // Language state
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem("chat-lang") || "en-US");

  useEffect(() => {
    localStorage.setItem("chat-notifications", JSON.stringify(notifSettings));
  }, [notifSettings]);

  useEffect(() => {
    localStorage.setItem("chat-privacy", JSON.stringify(privacySettings));
  }, [privacySettings]);

  useEffect(() => {
    localStorage.setItem("chat-lang", currentLang);
  }, [currentLang]);

  const toggle = (setter, key) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Setting updated");
  };

  const handleExportData = () => {
    const data = {
      profile: authUser,
      settings: { notifSettings, privacySettings, currentLang, theme },
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chatify-data-${authUser?._id || 'user'}.json`;
    a.click();
    toast.success("Data exported successfully");
  };

  const handleClearCache = () => {
    if (confirm("This will reset your local preferences (theme, language, notifications). Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const sections = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "language", label: "Language", icon: Globe },
    { id: "account", label: "Account", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-10 relative z-10 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl text-main tracking-tight mb-2">Settings</h1>
          <p className="text-muted text-sm max-w-lg">Manage your account preferences, appearance, and notification settings for the best ChatFy experience.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav - Now vertical on all screens */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="glass rounded-2xl p-2 flex flex-col gap-1 border border-white/5 bg-surface/30 lg:sticky lg:top-24 shadow-sm">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    activeSection === id 
                    ? "bg-accent text-white shadow-glow" 
                    : "text-muted hover:bg-white/5 hover:text-main"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeSection === id ? "text-white" : "text-accent"}`} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-40 transition-opacity ${activeSection === id ? "opacity-100" : ""}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <div className="space-y-8 animate-slide-up">
                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xl text-main">Interface Theme</h2>
                      <p className="text-sm text-muted">Select a premium appearance for your workspace.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
                    {THEMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                          theme === t 
                          ? "bg-accent/5 border-accent shadow-glow" 
                          : "bg-surface/40 border-transparent hover:border-white/10 hover:bg-surface/60"
                        }`}
                      >
                        <div className="relative h-12 w-full rounded-xl overflow-hidden shadow-sm" data-theme={t}>
                          <div className="absolute inset-0 grid grid-cols-4 gap-0 bg-base-100">
                            <div className="bg-primary" />
                            <div className="bg-secondary" />
                            <div className="bg-accent" />
                            <div className="bg-neutral" />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold truncate w-full text-center capitalize text-muted group-hover:text-main">
                          {t}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5">
                  <h3 className="font-bold text-main flex items-center gap-2 mb-6">
                    <Eye className="w-5 h-5 text-accent" /> Real-time Preview
                  </h3>
                  <div className="rounded-2xl overflow-hidden border border-base-300 shadow-2xl scale-95 origin-top transition-all" data-theme={theme}>
                    <div className="px-5 py-4 border-b border-base-300 bg-base-100 flex items-center gap-4">
                      <img src={authUser?.profilePic || "/avatar.png"} className="w-9 h-9 rounded-full object-cover border-2 border-primary/20" alt="" />
                      <div>
                        <div className="text-sm font-bold text-base-content">{authUser?.fullName || "Your Name"}</div>
                        <div className="text-[10px] text-base-content/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live Previewing
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4 min-h-[160px] bg-base-100/50 backdrop-blur-md">
                      <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-base-200 text-base-content rounded-bl-sm shadow-sm">
                          Hey! How does the {theme} theme look on your device? 👋
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-primary text-primary-content rounded-br-sm shadow-glow">
                          It looks incredible! So premium and clean. 🔥
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4 border-t border-base-300 bg-base-100 flex gap-3">
                      <div className="flex-1 bg-base-200/50 border border-base-300 rounded-xl px-4 py-2.5 text-xs text-base-content/40">Send a test message...</div>
                      <button className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow">
                        <Send className="w-4 h-4 text-primary-content" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 animate-slide-up">
                <h2 className="font-bold text-xl text-main flex items-center gap-3 mb-2">
                  <Bell className="w-5 h-5 text-accent" /> Notifications
                </h2>
                <p className="text-sm text-muted mb-8">Control how you want to be alerted about new messages and activities.</p>
                
                <div className="grid gap-3">
                  {[
                    { key: "push", label: "Push Notifications", desc: "Receive alerts even when the app is closed" },
                    { key: "browser", label: "Browser Notifications", desc: "System-level alerts while using your browser" },
                    { key: "sound", label: "Sound Effects", desc: "Play premium sounds for incoming messages" },
                    { key: "mentions", label: "Group Mentions", desc: "Special alerts when someone tags @you" },
                    { key: "stories", label: "Contact Updates", desc: "Alert me when friends post new stories" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-5 rounded-2xl bg-surface/40 border border-white/5 hover:bg-surface/60 transition-all">
                      <div className="pr-4">
                        <div className="text-sm font-bold text-main">{label}</div>
                        <div className="text-[11px] text-muted mt-1 leading-relaxed">{desc}</div>
                      </div>
                      <button
                        onClick={() => toggle(setNotifSettings, key)}
                        className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${notifSettings[key] ? "bg-accent shadow-glow" : "bg-white/10"}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${notifSettings[key] ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 animate-slide-up">
                <h2 className="font-bold text-xl text-main flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-accent" /> Privacy & Safety
                </h2>
                <p className="text-sm text-muted mb-8">Manage who can see your information and how you appear to others.</p>

                <div className="space-y-3">
                  {[
                    { key: "onlineStatus", label: "Online Visibility", desc: "Show 'Active now' status to your contacts" },
                    { key: "readReceipts", label: "Read Receipts", desc: "Allow others to see when you've read their messages" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-5 rounded-2xl bg-surface/40 border border-white/5">
                      <div>
                        <div className="text-sm font-bold text-main">{label}</div>
                        <div className="text-[11px] text-muted mt-1">{desc}</div>
                      </div>
                      <button
                        onClick={() => toggle(setPrivacySettings, key)}
                        className={`relative w-12 h-6 rounded-full transition-all ${privacySettings[key] ? "bg-accent shadow-glow" : "bg-white/10"}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${privacySettings[key] ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                  ))}

                  <div className="p-5 rounded-2xl bg-surface/40 border border-white/5">
                    <div className="text-sm font-bold text-main mb-1">Profile Photo Privacy</div>
                    <p className="text-[11px] text-muted mb-4">Choose who can view your profile picture.</p>
                    <div className="flex gap-2 p-1.5 bg-black/20 rounded-xl">
                      {["everyone", "contacts", "nobody"].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setPrivacySettings(p => ({ ...p, profilePhoto: opt })); toast.success("Visibility updated"); }}
                          className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            privacySettings.profilePhoto === opt 
                            ? "bg-accent text-white shadow-glow" 
                            : "text-muted hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Language Section */}
            {activeSection === "language" && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 animate-slide-up">
                <h2 className="font-bold text-xl text-main flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-accent" /> Display Language
                </h2>
                <p className="text-sm text-muted mb-8">Choose your preferred language for the ChatFy interface.</p>

                <div className="grid gap-2">
                  {[
                    { name: "English (US)", code: "en-US", region: "United States" },
                    { name: "हिन्दी", code: "hi-IN", region: "India" },
                    { name: "Español", code: "es", region: "Spain" },
                    { name: "Français", code: "fr", region: "France" },
                    { name: "日本語", code: "ja", region: "Japan" },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setCurrentLang(lang.code); toast.success(`Language set to ${lang.name}`); }}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        currentLang === lang.code 
                        ? "bg-accent/10 border-accent/40" 
                        : "bg-surface/40 border-transparent hover:border-white/5 hover:bg-surface/60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentLang === lang.code ? "bg-accent text-white" : "bg-white/5 text-muted"}`}>
                          {lang.code.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className={`text-sm font-bold ${currentLang === lang.code ? "text-accent" : "text-main"}`}>{lang.name}</div>
                          <div className="text-[10px] text-muted">{lang.region}</div>
                        </div>
                      </div>
                      {currentLang === lang.code && (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Account Section */}
            {activeSection === "account" && (
              <div className="space-y-6 animate-slide-up">
                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5">
                  <h2 className="font-bold text-xl text-main flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-accent" /> Data Management
                  </h2>
                  <p className="text-sm text-muted mb-8">Manage your information and local app data.</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button 
                      onClick={handleExportData}
                      className="p-5 rounded-2xl bg-surface/40 border border-white/5 hover:bg-surface/60 transition-all text-left group"
                    >
                      <Download className="w-6 h-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="text-sm font-bold text-main">Export My Data</h4>
                      <p className="text-[10px] text-muted mt-1 leading-relaxed">Download a copy of your settings and profile as a JSON file.</p>
                    </button>

                    <button 
                      onClick={handleClearCache}
                      className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-all text-left group"
                    >
                      <Trash2 className="w-6 h-6 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="text-sm font-bold text-rose-500">Clear Local Data</h4>
                      <p className="text-[10px] text-rose-400 mt-1 leading-relaxed">Reset your local preferences and reload the application.</p>
                    </button>
                  </div>
                </div>

                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-main">Session Management</h3>
                    <p className="text-sm text-muted">Currently logged in as <span className="text-accent font-semibold">{authUser?.email}</span></p>
                  </div>
                  <button 
                    onClick={logout}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-bold shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
