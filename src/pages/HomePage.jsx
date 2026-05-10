import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-app flex flex-col">
      {/* Spacer for navbar */}
      <div className="h-16 flex-shrink-0" />

      {/* Chat layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex h-full w-full max-w-7xl mx-auto overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex overflow-hidden">
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
