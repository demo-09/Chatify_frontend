import { useState, useEffect, useRef } from "react";
import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing, Search, Mic, MicOff, VideoOff, PhoneForwarded, X, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

const CallsPage = () => {
  const { authUser, socket } = useAuthStore();
  const { callHistory, fetchCallHistory, logCall, isLoading } = useCallStore();
  const { users, getUsers } = useChatStore();

  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    fetchCallHistory();
    getUsers();
  }, [fetchCallHistory, getUsers]);

  // Socket listeners for WebRTC Signaling
  useEffect(() => {
    if (!socket) return;

    socket.on("callUser", async ({ signal, from, name }) => {
      setIncomingCall({ signal, from, name });
    });

    socket.on("callAccepted", (signal) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on("iceCandidate", (candidate) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("endCall", () => {
      cleanupCall(true); // Remote ended
    });

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("endCall");
    };
  }, [socket]);

  const initWebRTC = async (type, targetUserId) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: type === "video",
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ],
    });
    
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && targetUserId) {
        socket.emit("iceCandidate", { to: targetUserId, candidate: event.candidate });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = async (type, user) => {
    try {
      setActiveCall({ type, user: user.fullName, userId: user._id, isInitiator: true });
      const pc = await initWebRTC(type, user._id);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("callUser", {
        userToCall: user._id,
        signalData: offer,
        from: authUser._id,
        name: authUser.fullName,
      });

      startCallTimer();
    } catch (err) {
      console.error("Failed to start call:", err);
      cleanupCall();
    }
  };

  const answerCall = async () => {
    try {
      setActiveCall({ type: "video", user: incomingCall.name, userId: incomingCall.from, isInitiator: false });
      const pc = await initWebRTC("video", incomingCall.from);

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answerCall", { signal: answer, to: incomingCall.from });
      setIncomingCall(null);
      startCallTimer();
    } catch (err) {
      console.error("Failed to answer call:", err);
      cleanupCall();
    }
  };

  const rejectCall = () => {
    // Log missed call
    logCall({
      receiverId: authUser._id, // Caller was incomingCall.from, so we log it differently in real app, but simplified here
      type: "video",
      status: "rejected",
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (activeCall) {
      socket.emit("endCall", { to: activeCall.userId });
      logCall({
        receiverId: activeCall.userId,
        type: activeCall.type,
        status: "completed",
        duration: callDuration,
      });
    }
    cleanupCall();
  };

  const cleanupCall = (fromRemote = false) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    clearInterval(callTimerRef.current);
    setCallDuration(0);
    setActiveCall(null);
    setIncomingCall(null);
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-1">Calls</h1>
          <p className="text-muted text-sm">High-quality voice and video meetings.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent" />
            <input 
              type="text" 
              placeholder="Search users to call..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-app rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-muted outline-none focus:border-accent/50"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Directory / Users List */}
        <div className="w-full md:w-1/3 flex flex-col glass rounded-2xl border border-app p-4 overflow-y-auto no-scrollbar">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Directory</h2>
          {filteredUsers.length === 0 ? (
            <div className="text-muted text-sm p-4 text-center">No users found.</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic || "/avatar.png"} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <h3 className="font-medium text-white text-sm">{user.fullName}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startCall("audio", user)} className="w-8 h-8 rounded-full border border-app flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startCall("video", user)} className="w-8 h-8 rounded-full border border-app flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-colors">
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call History */}
        <div className="w-full md:w-2/3 flex flex-col glass rounded-2xl border border-app p-4 sm:p-6 overflow-y-auto no-scrollbar">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Recent Calls</h2>
          
          <div className="space-y-2">
            {isLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
            ) : callHistory.length === 0 ? (
               <div className="text-muted text-sm p-8 text-center">No recent calls.</div>
            ) : callHistory.map((call) => {
              const isOutgoing = call.caller._id === authUser._id;
              const otherUser = isOutgoing ? call.receiver : call.caller;
              const iconClass = call.status === 'missed' ? 'bg-rose-500/10 text-rose-500' : 
                              isOutgoing ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500';

              return (
                <div key={call._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                      {call.status === 'missed' ? <PhoneMissed className="w-5 h-5" /> : 
                      isOutgoing ? <PhoneOutgoing className="w-5 h-5" /> : 
                      <PhoneIncoming className="w-5 h-5" />}
                    </div>

                    <div>
                      <h3 className={`font-semibold ${call.status === 'missed' ? 'text-rose-500' : 'text-white'}`}>
                        {otherUser.fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted flex items-center gap-1">
                          {call.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                          {call.status === 'missed' ? 'Missed Call' : isOutgoing ? 'Outgoing' : 'Incoming'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-xs text-muted">
                          {new Date(call.createdAt).toLocaleDateString()} {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {call.duration > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-xs text-muted">{formatDuration(call.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); startCall("audio", otherUser); }} className="w-8 h-8 rounded-full border border-app flex items-center justify-center text-muted hover:text-white hover:bg-white/10">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); startCall("video", otherUser); }} className="w-8 h-8 rounded-full border border-app flex items-center justify-center text-muted hover:text-white hover:bg-white/10">
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Incoming Call Notification */}
      {incomingCall && !activeCall && (
        <div className="fixed bottom-8 right-8 z-[110] bg-surface border border-app shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-scale-in">
          <div className="w-12 h-12 rounded-full bg-gradient-main flex items-center justify-center animate-pulse-glow shadow-glow">
            <PhoneIncoming className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <h4 className="text-white font-semibold">{incomingCall.name}</h4>
            <p className="text-muted text-sm">Incoming Video Call...</p>
          </div>
          <div className="flex gap-2 ml-4">
            <button onClick={rejectCall} className="w-10 h-10 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-500 flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
            <button onClick={answerCall} className="w-10 h-10 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-green-600 text-white flex items-center justify-center transition-colors">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md">
          <div className="w-full max-w-5xl aspect-[9/16] sm:aspect-video bg-surface sm:rounded-3xl border border-app overflow-hidden relative shadow-2xl flex flex-col animate-scale-in">
            
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
              <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-green-400 text-sm font-medium border border-green-400/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Secure Call
              </span>
              <span className="text-white font-mono bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">{formatDuration(callDuration)}</span>
            </div>

            {/* Video Streams */}
            <div className="flex-1 relative flex bg-black">
              {/* Remote Video */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {!remoteVideoRef.current?.srcObject && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                  <div className="w-32 h-32 rounded-full border-4 border-accent shadow-glow flex items-center justify-center mb-6 overflow-hidden animate-pulse-glow bg-surface">
                     <span className="text-4xl text-white font-bold">{activeCall.user.charAt(0)}</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">{activeCall.user}</h2>
                  <p className="text-accent tracking-widest uppercase text-sm font-bold animate-pulse">Connecting...</p>
                </div>
              )}

              {/* Local Video (PiP) */}
              <div className="absolute bottom-24 right-4 sm:right-6 w-32 sm:w-48 aspect-[3/4] sm:aspect-video bg-black rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl z-30 transition-all hover:scale-105">
                 <video 
                   ref={localVideoRef} 
                   autoPlay 
                   playsInline 
                   muted 
                   className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                 />
                 {isVideoOff && (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                     <VideoOff className="w-6 h-6 text-white/40" />
                   </div>
                 )}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center gap-4">
              <button onClick={toggleMute} className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-colors border ${isMuted ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={toggleVideo} className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-colors border ${isVideoOff ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <div className="w-px h-8 bg-white/20 mx-2" />
              <button 
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:scale-110 active:scale-95"
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CallsPage;
