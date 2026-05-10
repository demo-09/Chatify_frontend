import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Bot, FileText } from "lucide-react";
import CameraModal from "./CameraModal";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages, isCameraMode, setCameraMode, setDraftImage } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const isAI = selectedUser.email === "ai@chatify.com";

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-appbg">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-appbg relative">
      <ChatHeader />

      {/* Camera Mode Overlay */}
      {isCameraMode && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <CameraModal 
            isOpen={true} 
            onClose={() => setCameraMode(false)} 
            onSend={(img) => {
              setDraftImage(img);
              setCameraMode(false);
            }} 
          />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-4">
        {/* Date separator (top) */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-muted font-medium px-2">Today</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {messages.map((message, index) => {
          const isMe = message.senderId === authUser._id;
          const isFromAI = !isMe && isAI;

          return (
            <div
              key={message._id}
              className={`flex items-end gap-2.5 msg-enter ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              {!isMe && (
                <div className="flex-shrink-0 mb-0.5">
                  <div className="w-7 h-7 rounded-lg overflow-hidden">
                    {isFromAI ? (
                      <div className="w-full h-full bg-gradient-main flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        alt={selectedUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Bubble */}
              <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                {message.image && (
                  <div className="relative group">
                    <img
                      src={message.image}
                      alt="attachment"
                      className={`rounded-2xl max-w-full max-h-72 object-cover shadow-card cursor-pointer
                        ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                    />
                  </div>
                )}
                {message.file && (
                  <a
                    href={message.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors
                      ${isMe ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-card border-app text-main hover:bg-white/5"}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{message.fileName || "Document"}</p>
                      <p className="text-[10px] text-muted">Click to view file</p>
                    </div>
                  </a>
                )}
                {message.audio && (
                  <div className={`p-2 rounded-2xl border ${isMe ? "bg-white/10 border-white/20" : "bg-card border-app"}`}>
                    <audio src={message.audio} controls className="h-8 max-w-[200px]" />
                  </div>
                )}
                {message.text && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${isMe
                        ? "bg-gradient-main text-white rounded-br-sm"
                        : isFromAI
                          ? "bg-surface border border-accent/20 text-main rounded-bl-sm"
                          : "bg-card text-main rounded-bl-sm border border-app"
                      }`}
                  >
                    {message.text}
                  </div>
                )}
                <span className="text-[10px] text-muted px-1">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>

              {/* My avatar */}
              {isMe && (
                <div className="flex-shrink-0 mb-0.5">
                  <div className="w-7 h-7 rounded-lg overflow-hidden">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt="me"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
