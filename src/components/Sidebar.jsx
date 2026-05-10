import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Bot, Search, X } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [search, setSearch] = useState("");

  const { groups, fetchGroups, isGroupsLoading } = useGroupStore();
  const { createGroup, isCreatingGroup } = useGroupStore();
  const [showGroups, setShowGroups] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => { 
    getUsers(); 
    fetchGroups();
  }, [getUsers, fetchGroups]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || selectedMembers.length === 0) return toast.error("Name and at least 1 member required");
    const success = await createGroup({ name: groupName, members: selectedMembers });
    if (success) {
      setIsModalOpen(false);
      setGroupName("");
      setSelectedMembers([]);
    }
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const safeGroups = Array.isArray(groups) ? groups : [];

  const filteredUsers = safeUsers
    .filter((u) => showOnlineOnly ? onlineUsers.includes(u._id) : true)
    .filter((u) => u?.fullName?.toLowerCase().includes(search.toLowerCase()));

  const onlineCount = onlineUsers.filter((id) => safeUsers.some((u) => u._id === id)).length;

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full md:w-[72px] lg:w-80 bg-surface border-r border-app flex flex-col transition-all duration-300 flex-shrink-0">
      {/* Group Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 w-full max-w-md rounded-2xl p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-main">Create New Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-main transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5 ml-1">Group Name</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. Project Team" 
                  className="w-full bg-card border border-app rounded-xl py-3 px-4 text-sm text-main focus:border-accent outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5 ml-1">Select Members ({selectedMembers.length})</label>
                <div className="max-h-48 overflow-y-auto no-scrollbar border border-app rounded-xl bg-card p-2 grid grid-cols-1 gap-1">
                  {safeUsers.filter(u => u?.email !== "ai@chatify.com").map(user => (
                    <div 
                      key={user._id} 
                      onClick={() => toggleMember(user._id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${selectedMembers.includes(user._id) ? "bg-accent/15 border border-accent/20" : "hover:bg-white/5 border border-transparent"}`}
                    >
                      <img src={user.profilePic || "/avatar.png"} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <span className={`text-sm ${selectedMembers.includes(user._id) ? "text-main font-medium" : "text-muted"}`}>{user.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isCreatingGroup}
                className="w-full py-3 bg-gradient-main rounded-xl text-white font-bold text-sm shadow-glow hover:shadow-glow-strong transition-all disabled:opacity-50"
              >
                {isCreatingGroup ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-app">
        <div className="hidden lg:flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm text-main">Messages</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            <span className="text-xs text-green-400 font-medium">{onlineCount} online</span>
          </div>
        </div>

        {/* Search bar - only visible on large */}
        <div className="hidden lg:block relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-card border border-app rounded-xl py-2 pl-9 pr-3 text-sm text-main placeholder:text-muted outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className={`relative w-8 h-4 rounded-full transition-colors ${showOnlineOnly ? "bg-accent" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showOnlineOnly ? "left-4" : "left-0.5"}`} />
          </button>
          <span className="text-xs text-muted">Online only</span>
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Groups Section */}
        <div className="mb-2">
          <div 
            className="px-4 py-3 flex items-center justify-between hover:bg-white/3 transition-colors text-muted hover:text-main group"
          >
            <div onClick={() => setShowGroups(!showGroups)} className="flex items-center gap-2 cursor-pointer flex-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Groups ({safeGroups.length})</span>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="p-1 rounded-md hover:bg-accent/20 hover:text-accent transition-all opacity-0 group-hover:opacity-100">
              <X className="w-3.5 h-3.5 rotate-45" />
            </button>
          </div>
          
          {showGroups && safeGroups.map((group) => {
            const isSelected = selectedUser?._id === group._id;
            return (
              <button
                key={group._id}
                onClick={() => setSelectedUser(group)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left
                  ${isSelected ? "bg-accent/8 border-r-2 border-accent" : "hover:bg-white/2 border-r-2 border-transparent"}`}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center overflow-hidden border border-accent/20 flex-shrink-0">
                  {group.groupIcon ? (
                    <img src={group.groupIcon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div className="hidden lg:block flex-1 min-w-0">
                  <span className="text-sm font-semibold text-main truncate block">{group.name}</span>
                  <span className="text-[10px] text-muted truncate block">{group.members.length} members</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Direct Messages Section */}
        <div className="px-4 py-3 text-muted">
          <span className="text-[11px] font-bold uppercase tracking-wider">Direct Messages</span>
        </div>

        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(user._id);
          const isAI = user.email === "ai@chatify.com";

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-150 text-left group relative
                ${isSelected ? "bg-accent/8 border-r-2 border-accent" : "hover:bg-white/3 border-r-2 border-transparent"}`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-xl overflow-hidden ${isSelected || isAI ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""}`}>
                  {isAI ? (
                    <div className="w-full h-full bg-gradient-main flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full status-online border-2 border-surface" />
                )}
              </div>

              {/* Info - only on large */}
              <div className="hidden lg:flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-semibold truncate ${isSelected ? "text-main" : "text-main/80"}`}>
                    {user.fullName}
                  </span>
                  {isAI && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-accent/15 text-accent rounded-full ml-1 flex-shrink-0">AI</span>
                  )}
                </div>
                <span className="text-xs text-muted truncate">
                  {isAI ? "Ask me anything..." : isOnline ? "Active now" : "Offline"}
                </span>
              </div>
            </button>
          );
        })}

        {(filteredUsers.length === 0 && safeGroups.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-muted" />
            </div>
            <p className="text-sm text-muted">No conversations found</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
