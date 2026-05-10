import { useState, useEffect, useRef } from "react";
import { Plus, Eye, MoreHorizontal, Heart, Send, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useStoryStore } from "../store/useStoryStore";
import toast from "react-hot-toast";

const StoriesPage = () => {
  const { authUser } = useAuthStore();
  const { stories, fetchStories, uploadStory, isUploading, isLoading, viewStory } = useStoryStore();
  const [activeStory, setActiveStory] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    if (isViewing && activeStory) {
      setProgress(0);
      const startTime = Date.now();
      const duration = 5000;

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          setIsViewing(false);
          setActiveStory(null);
        }
      }, 50);
    } else {
      clearInterval(progressIntervalRef.current);
    }
    return () => clearInterval(progressIntervalRef.current);
  }, [isViewing, activeStory]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Select an image file"); return; }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      await uploadStory(base64, "image");
      if (fileRef.current) fileRef.current.value = "";
    };
  };

  const openStory = async (story) => {
    setActiveStory(story);
    setIsViewing(true);
    if (!story.views.includes(authUser._id)) {
      await viewStory(story._id);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in overflow-y-auto no-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-main tracking-tight mb-1">Stories</h1>
        <p className="text-muted text-sm">Share moments that disappear in 24 hours.</p>
      </div>

      {/* Story Bubbles Feed */}
      <div className="flex gap-5 overflow-x-auto pb-8 no-scrollbar">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group" onClick={() => !isUploading && fileRef.current?.click()}>
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-app bg-surface p-1 transition-all group-hover:border-accent">
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img 
                src={authUser?.profilePic || "/avatar.png"} 
                alt="You" 
                className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-30' : 'opacity-60 group-hover:opacity-40'}`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-main uppercase tracking-wider">Add Story</span>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        {/* Other Users' Stories */}
        {isLoading ? (
          <div className="flex items-center gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-2.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface animate-pulse border-2 border-app" />
                <div className="w-12 h-3 bg-surface rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          stories.map(story => {
            const hasSeen = story.views.includes(authUser._id);
            return (
              <div 
                key={story._id} 
                onClick={() => openStory(story)}
                className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-300 ${hasSeen ? "border-2 border-app bg-surface" : "bg-gradient-main p-[3px] animate-pulse-glow"}`}>
                  <div className="w-full h-full rounded-full border-2 border-surface overflow-hidden bg-surface relative">
                    <img src={story.user?.profilePic || "/avatar.png"} alt={story.user?.fullName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
                <span className={`text-[11px] uppercase tracking-wider ${hasSeen ? "text-muted font-bold" : "text-main font-black"} truncate w-16 text-center`}>
                  {story.user?.fullName?.split(" ")[0]}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Active Story Viewer */}
      {isViewing && activeStory && (
        <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center backdrop-blur-md">
          <div className="relative w-full max-w-md h-[100dvh] sm:h-[85dvh] sm:rounded-3xl overflow-hidden bg-surface shadow-2xl flex flex-col animate-scale-in">
            
            {/* Story Progress Bars */}
            <div className="absolute top-0 inset-x-0 p-4 z-20 flex gap-1.5">
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Story Header */}
            <div className="absolute top-4 inset-x-0 p-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-0.5 rounded-full bg-gradient-main">
                  <img src={activeStory.user?.profilePic || "/avatar.png"} alt="" className="w-9 h-9 rounded-full border-2 border-surface bg-surface" />
                </div>
                <div className="drop-shadow-lg">
                  <div className="text-white text-sm font-bold">{activeStory.user?.fullName}</div>
                  <div className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                    {new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white/80 hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                <button onClick={() => { setIsViewing(false); setActiveStory(null); }} className="p-2 text-white/80 hover:text-white transition-all hover:scale-110"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>
            </div>

            {/* Story Image */}
            <div className="flex-1 relative bg-black/40 flex items-center justify-center">
              <img src={activeStory.mediaUrl} alt="Story" className="w-full h-full object-contain sm:object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Story Footer */}
            <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex items-center gap-3">
              <div className="flex-1 relative">
                <input type="text" placeholder="Send a reply..." className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-5 text-white placeholder:text-white/60 text-sm backdrop-blur-xl outline-none focus:border-white/40 transition-all focus:bg-white/20" />
              </div>
              <button className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-rose-500 transition-all group backdrop-blur-xl">
                <Heart className="w-6 h-6 text-white group-hover:scale-110" />
              </button>
              <button className="w-11 h-11 rounded-full flex items-center justify-center bg-accent shadow-glow transition-all hover:scale-105 active:scale-95">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Stories Grid */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-5">
           <h2 className="text-xl font-display font-bold text-main">Highlights</h2>
           <div className="w-12 h-0.5 bg-accent/20 rounded-full" />
        </div>
        
        {stories.length === 0 && !isLoading ? (
          <div className="text-muted text-sm border-2 border-dashed border-app bg-surface/50 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-app flex items-center justify-center text-muted">
                <Plus className="w-6 h-6" />
             </div>
             <p className="font-medium">No highlights yet. Share your first moment!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {stories.map(story => (
              <div key={`grid-${story._id}`} onClick={() => openStory(story)} className="aspect-[10/16] rounded-3xl overflow-hidden relative group cursor-pointer border border-app bg-surface shadow-lg hover:shadow-accent/10 transition-all duration-500">
                <img src={story.mediaUrl} alt="Highlight" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/10">
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px] text-white font-bold">{story.views.length}</span>
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="p-0.5 rounded-full bg-gradient-main">
                    <img src={story.user?.profilePic || "/avatar.png"} className="w-8 h-8 rounded-full border-2 border-surface bg-surface" />
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[100px] drop-shadow-md">{story.user?.fullName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesPage;

