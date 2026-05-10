import { useState, useRef, useEffect } from "react";
import { Camera, Plus, Play, Zap, X, Send, Clock, Search, Check, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useSnapStore } from "../../store/useSnapStore";
import { useStoryStore } from "../../store/useStoryStore";
import { useSocialStore } from "../../store/useSocialStore";
import { useChatStore } from "../../store/useChatStore";
import toast from "react-hot-toast";

const SocialSidebar = () => {
  const { authUser } = useAuthStore();
  const { stories, fetchStories, uploadStory } = useStoryStore();
  const { snaps, fetchSnaps, openSnap, sendSnap, isSending } = useSnapStore();
  const { users, getUsers, selectedUser } = useChatStore();
  const { activeView, selectedContent, closeSidebar, isSidebarVisible } = useSocialStore();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [viewTimer, setViewTimer] = useState(5);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchStories();
    fetchSnaps();
    getUsers();
  }, [fetchStories, fetchSnaps, getUsers]);

  // Handle auto-close for snaps
  useEffect(() => {
    if (activeView === "snap" && selectedContent) {
      setViewTimer(5);
      const interval = setInterval(() => {
        setViewTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            closeSidebar();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeView, selectedContent, closeSidebar]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsCameraActive(true);
    } catch {
      toast.error("Camera access denied");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsCameraActive(false);
    setCapturedImage(null);
    setShowRecipientSelector(false);
    setSelectedRecipientId(null);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.filter = "saturate(1.2) contrast(1.1)";
    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
  };

  const handleSendSnap = async () => {
    if (!capturedImage || !selectedRecipientId) return;
    await sendSnap(capturedImage, selectedRecipientId, "image");
    stopCamera();
    closeSidebar();
  };

  // If a view is forced (camera from chat or snap from page)
  useEffect(() => {
    if (activeView === "camera" && !isCameraActive) startCamera();
  }, [activeView]);

  const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <aside className={`
      ${(activeView || isCameraActive) ? "fixed inset-0 z-[120] bg-[#0d0e14]/98 backdrop-blur-2xl flex" : (selectedUser || !isSidebarVisible) ? "hidden" : "hidden xl:flex w-[340px] border-l border-white/5"}
      flex-col transition-all duration-500 ease-in-out shadow-2xl overflow-hidden
    `}>
      {/* Mobile Backdrop - only for desktop side-panel mode if we wanted it, but let's focus on the viewer */}
      {/* Header with Close Button */}
      <div className="p-4 border-b border-app flex items-center justify-between bg-card/30">
        <h2 className="text-xs font-black uppercase tracking-widest text-main">Social Panel</h2>
        <button onClick={closeSidebar} className="p-1.5 rounded-lg bg-surface hover:bg-rose-500/10 text-muted hover:text-rose-500 transition-all border border-app">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-8">
        
        {/* Dynamic Viewer Section */}
        {activeView === "snap" && selectedContent ? (
          <section className="animate-scale-in flex-1 flex flex-col items-center justify-center relative">
             <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-10">
               <h3 className="text-[11px] font-black uppercase tracking-widest text-white drop-shadow-md">Viewing Snap</h3>
               <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="text-xs font-bold text-white">{viewTimer}s</span>
               </div>
             </div>
             <div className="w-full h-full sm:aspect-[9/16] sm:h-auto sm:max-h-[85vh] sm:rounded-3xl overflow-hidden shadow-2xl relative">
                <img src={selectedContent} className="w-full h-full object-cover" alt="Snap" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
             </div>
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">
               Disappearing Moment
             </div>
          </section>
        ) : activeView === "story" && selectedContent ? (
          <section className="animate-scale-in flex-1 flex flex-col items-center justify-center relative">
             <div className="absolute top-0 inset-x-0 p-4 z-20 flex gap-1.5">
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `100%` }} />
                </div>
             </div>
             <div className="absolute top-8 inset-x-0 p-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-0.5 rounded-full bg-gradient-main">
                      <img src="/avatar.png" alt="" className="w-9 h-9 rounded-full border-2 border-surface bg-surface" />
                   </div>
                   <div>
                      <div className="text-white text-sm font-bold">Story View</div>
                      <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Active Now</div>
                   </div>
                </div>
                <button onClick={closeSidebar} className="p-2 text-white/80 hover:text-white transition-all hover:scale-110"><X className="w-6 h-6" /></button>
             </div>
             <div className="w-full h-full sm:aspect-[9/16] sm:h-auto sm:max-h-[85vh] sm:rounded-3xl overflow-hidden shadow-2xl relative">
                <img src={selectedContent} className="w-full h-full object-cover" alt="Story" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
             </div>
             <div className="absolute bottom-6 inset-x-6 z-20 flex items-center gap-3">
                <input type="text" placeholder="Reply to story..." className="flex-1 bg-white/10 border border-white/20 rounded-full py-3 px-5 text-white placeholder:text-white/60 text-sm backdrop-blur-xl outline-none" />
                <button className="w-11 h-11 rounded-full flex items-center justify-center bg-accent shadow-glow text-white"><Send className="w-5 h-5" /></button>
             </div>
          </section>
        ) : (
          <>
            {/* Camera Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-muted">Snap Camera</h3>
                {isCameraActive && <button onClick={stopCamera} className="text-rose-500"><X className="w-4 h-4" /></button>}
              </div>
              <div className="relative aspect-square rounded-3xl bg-card border-2 border-dashed border-app overflow-hidden group">
                {!isCameraActive ? (
                  <div onClick={startCamera} className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><Camera className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-main">Launch Lens</span>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {!capturedImage ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
                        <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-glow">
                          <div className="w-12 h-12 rounded-full bg-white active:scale-90 transition-transform shadow-inner" />
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-black flex flex-col">
                        {!showRecipientSelector ? (
                          <>
                            <img src={capturedImage} className="w-full h-full object-cover" alt="" />
                            <div className="absolute bottom-4 inset-x-4 flex gap-2">
                               <button onClick={() => setCapturedImage(null)} className="flex-1 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-bold text-white uppercase tracking-widest">Retake</button>
                               <button onClick={() => setShowRecipientSelector(true)} className="flex-1 py-2 bg-accent shadow-glow rounded-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">Next <Send className="w-3 h-3" /></button>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col bg-surface animate-slide-up">
                            <div className="p-4 border-b border-app flex items-center justify-between">
                              <button onClick={() => setShowRecipientSelector(false)} className="text-muted hover:text-main text-[10px] font-bold uppercase tracking-tighter">Back</button>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-main">Send To</h4>
                              <div className="w-8" />
                            </div>
                            <div className="p-3">
                               <div className="relative">
                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" />
                                 <input 
                                   type="text" 
                                   placeholder="Search friends..." 
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                                   className="w-full pl-8 pr-4 py-2 bg-card border border-app rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                                 />
                               </div>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                              {filteredUsers.map(user => (
                                <div 
                                  key={user._id} 
                                  onClick={() => setSelectedRecipientId(user._id)}
                                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all mb-1 ${selectedRecipientId === user._id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-white/5 border border-transparent'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <img src={user.profilePic || "/avatar.png"} className="w-8 h-8 rounded-full object-cover" alt="" />
                                    <span className="text-[11px] font-medium text-main">{user.fullName}</span>
                                  </div>
                                  {selectedRecipientId === user._id && <Check className="w-4 h-4 text-accent" />}
                                </div>
                              ))}
                            </div>
                            <div className="p-4 border-t border-app">
                               <button 
                                 disabled={!selectedRecipientId || isSending}
                                 onClick={handleSendSnap}
                                 className="w-full py-3 bg-gradient-main shadow-glow rounded-xl text-xs font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
                               >
                                 {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Snap"}
                               </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
 
             {/* Stories Section */}
             <section>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-muted">Recent Stories</h3>
                 <button onClick={() => fileRef.current?.click()} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                 <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => {
                   const file = e.target.files[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.readAsDataURL(file);
                     reader.onload = async () => uploadStory(reader.result, "image");
                   }
                 }} />
               </div>
               <div className="grid grid-cols-4 gap-3">
                  {stories.slice(0, 8).map((story, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                       <div className={`w-12 h-12 rounded-full p-0.5 border-2 ${story.views.includes(authUser?._id) ? 'border-app' : 'border-accent animate-pulse-glow'}`}>
                         <img src={story.user?.profilePic || "/avatar.png"} alt="" className="w-full h-full rounded-full object-cover bg-card" />
                       </div>
                    </div>
                  ))}
                  {stories.length === 0 && <div className="col-span-4 py-4 text-center text-[10px] text-muted font-bold uppercase">No stories</div>}
               </div>
             </section>
           </>
         )}
       </div>
       <canvas ref={canvasRef} className="hidden" />
     </aside>
   );
 };
 
 export default SocialSidebar;
