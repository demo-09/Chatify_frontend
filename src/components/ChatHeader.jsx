import { X, Phone, Video, MoreHorizontal, Bot, ChevronLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);
  const isAI = selectedUser?.email === "ai@chatify.com";

  if (!selectedUser) return null;

  return (
    <div className="h-16 flex items-center px-3 sm:px-5 border-b border-app bg-surface/50 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* Left: Back (mobile) + Avatar + Name */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedUser(null)}
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-white/5 transition-all md:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl overflow-hidden ${isAI ? "bg-gradient-main flex items-center justify-center" : ""}`}>
              {isAI ? (
                <Bot className="w-5 h-5 text-white" />
              ) : (
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-online border-2 border-surface" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-main leading-tight truncate">{selectedUser.fullName}</h3>
            <div className="flex items-center gap-1.5">
              {isAI ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
                  <span className="text-[10px] sm:text-xs text-accent font-medium truncate">AI Assistant</span>
                </>
              ) : (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOnline ? "bg-green-500" : "bg-muted"}`} />
                  <span className="text-[10px] sm:text-xs text-muted">{isOnline ? "Active now" : "Offline"}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <div className="hidden sm:block w-px h-5 bg-white/8 mx-1" />
          <button
            onClick={() => setSelectedUser(null)}
            className="hidden md:flex p-2 rounded-xl text-muted hover:text-main hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
