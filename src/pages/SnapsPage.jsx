import { useState, useEffect, useRef } from "react";
import { Camera, Send, X, Clock, Play, Image as ImageIcon, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useSnapStore } from "../store/useSnapStore";
import { useChatStore } from "../store/useChatStore";
import { useSocialStore } from "../store/useSocialStore";
import toast from "react-hot-toast";

const SnapsPage = () => {
  const { authUser } = useAuthStore();
  const { snaps, fetchSnaps, sendSnap, openSnap, isSending, subscribeToSnaps, unsubscribeFromSnaps } = useSnapStore();
  const { users, getUsers } = useChatStore();
  const { openSidebar } = useSocialStore();
  
  const [activeTab, setActiveTab] = useState("received");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  
  const fileRef = useRef(null);

  useEffect(() => {
    fetchSnaps();
    getUsers();
    subscribeToSnaps();
    return () => unsubscribeFromSnaps();
  }, [fetchSnaps, getUsers, subscribeToSnaps, unsubscribeFromSnaps]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedReceiver) return;
    if (!file.type.startsWith("image/")) { toast.error("Select an image file"); return; }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      await sendSnap(base64, selectedReceiver._id, "image");
      setShowUserModal(false);
      setSelectedReceiver(null);
      if (fileRef.current) fileRef.current.value = "";
    };
  };

  const handleOpenSnap = async (snap) => {
    if (snap.status === "opened") return;
    if (snap.sender._id === authUser._id) return;

    const mediaUrl = await openSnap(snap._id);
    if (mediaUrl) {
      openSidebar("snap", mediaUrl);
    }
  };

  const safeSnaps = Array.isArray(snaps) ? snaps : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const receivedSnaps = safeSnaps.filter(s => s?.receiver?._id === authUser?._id);
  const sentSnaps = safeSnaps.filter(s => s?.sender?._id === authUser?._id);
  
  const displaySnaps = activeTab === "received" ? receivedSnaps : sentSnaps;

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in min-h-[calc(100vh-80px)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-main tracking-tight mb-1">Snaps</h1>
          <p className="text-muted text-sm">Disappearing media and quick moments.</p>
        </div>
        <button 
          onClick={() => setShowUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-main rounded-xl text-white font-medium hover:scale-105 active:scale-95 transition-all shadow-glow"
        >
          <Camera className="w-4 h-4" />
          <span>New Snap</span>
        </button>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col">
        {/* Tabs */}
        <div className="flex p-1 bg-surface border border-app rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "received" ? "bg-card text-main shadow-sm border border-white/5" : "text-muted hover:text-main"}`}
          >
            Received
          </button>
          <button 
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "sent" ? "bg-card text-main shadow-sm border border-white/5" : "text-muted hover:text-main"}`}
          >
            Sent
          </button>
        </div>

        {/* Snap List */}
        <div className="flex-1 glass rounded-2xl border border-app p-2 overflow-y-auto no-scrollbar">
          {displaySnaps.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-surface flex items-center justify-center text-muted">
                 <Camera className="w-8 h-8" />
              </div>
              <p className="text-muted text-sm">No snaps {activeTab} yet.</p>
            </div>
          )}
          
          {displaySnaps.map((snap) => {
            const isReceived = activeTab === "received";
            const displayName = isReceived ? snap.sender?.fullName : snap.receiver?.fullName;
            const isOpened = snap.status === "opened";
            
            const bgClass = isOpened ? "bg-surface border-2 border-app" : "bg-rose-500 shadow-lg shadow-rose-500/20";
            const colorClass = isOpened ? "text-muted" : "text-rose-500";

            return (
              <div 
                key={snap._id} 
                onClick={() => isReceived && handleOpenSnap(snap)}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 group mb-1 ${isReceived && !isOpened ? 'hover:bg-accent/5 cursor-pointer border border-transparent hover:border-accent/10' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${bgClass}`}>
                    <div className={`w-4 h-4 rounded-sm ${isOpened ? "border-2 border-muted" : "bg-white"}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${!isOpened && isReceived ? "text-main" : "text-main/60"}`}>
                      {displayName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${colorClass}`}>
                        {!isOpened ? `New Snap` : "Opened"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-muted" />
                      <span className="text-xs text-muted">{new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                   <Play className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Select User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-4 border-b border-app flex items-center justify-between bg-card/50">
              <h3 className="font-semibold text-main">Send Snap To...</h3>
              <button onClick={() => setShowUserModal(false)} className="text-muted hover:text-main"><X className="w-5 h-5" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 no-scrollbar">
              {safeUsers.map(user => (
                <div 
                  key={user._id} 
                  onClick={() => setSelectedReceiver(user)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${selectedReceiver?._id === user._id ? "bg-accent/15 border border-accent/20" : "hover:bg-card border border-transparent"}`}
                >
                  <img src={user.profilePic || "/avatar.png"} alt="" className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-accent/50 transition-all" />
                  <span className={`text-sm font-medium ${selectedReceiver?._id === user._id ? "text-accent" : "text-main"}`}>{user.fullName}</span>
                </div>
              ))}
            </div>
            {selectedReceiver && !isSending && (
              <div className="p-4 border-t border-app">
                <button 
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3 bg-gradient-main rounded-xl text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" /> Select Media
                </button>
              </div>
            )}
            {isSending && (
              <div className="p-4 flex items-center justify-center gap-2 text-accent text-sm font-medium border-t border-app">
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Snap...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for uploading snap */}
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
    </div>
  );
};

export default SnapsPage;
