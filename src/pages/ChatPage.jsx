import { useChatStore } from "../store/useChatStore";
import ChatSidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const ChatPage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-full flex flex-col p-0 sm:p-4 lg:p-6 relative z-10 animate-fade-in overflow-hidden">
      <div className="mb-5 px-4 sm:px-0 hidden sm:block">
        <h1 className="text-3xl font-display font-bold text-main tracking-tight mb-1">Messages</h1>
        <p className="text-muted text-sm">Real-time conversations with your contacts.</p>
      </div>
      <div className="flex-1 glass sm:rounded-2xl overflow-hidden flex border-0 sm:border border-white/5 shadow-card min-h-0">
        {/* Sidebar: hidden on mobile when a chat is selected */}
        <div className={`w-full md:w-auto ${selectedUser ? "hidden md:flex" : "flex"}`}>
          <ChatSidebar />
        </div>

        {/* Chat Area: hidden on mobile when no chat is selected */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-appbg min-h-0 ${!selectedUser ? "hidden md:flex" : "flex"}`}>
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
