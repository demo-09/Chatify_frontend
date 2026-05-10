import { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, Send, Zap } from "lucide-react";
import toast from "react-hot-toast";

const filters = [
  { name: "Normal", value: "none" },
  { name: "B&W", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(80%)" },
  { name: "Vivid", value: "saturate(200%) contrast(110%)" },
  { name: "Cool", value: "hue-rotate(200deg) saturate(130%)" },
  { name: "Warm", value: "sepia(40%) saturate(150%)" },
];

const CameraModal = ({ isOpen, onClose, onSend }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [filter, setFilter] = useState("none");

  useEffect(() => {
    if (isOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      toast.error("Cannot access camera");
      onClose();
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCapturedImage(null);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.filter = filter;
    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl overflow-hidden border border-app shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app bg-card/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Camera className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-sm text-main uppercase tracking-widest">Chat Camera</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-muted hover:text-main transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Preview */}
        <div className="relative aspect-[3/4] sm:aspect-square bg-black overflow-hidden group">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ filter, transform: "scaleX(-1)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full relative">
              <img src={capturedImage} className="w-full h-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
            </div>
          )}

          {/* Filter strip */}
          {!capturedImage && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 px-6 overflow-x-auto no-scrollbar scroll-smooth">
              {filters.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFilter(f.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${filter === f.value
                      ? "bg-white text-black border-white shadow-lg scale-105"
                      : "bg-black/40 text-white/70 backdrop-blur-xl border-white/10 hover:bg-black/60 hover:border-white/20"
                    }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-8 flex items-center justify-center gap-10 bg-card/30 backdrop-blur-sm">
          {!capturedImage ? (
            <>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl border border-app text-muted hover:text-main hover:bg-white/5 flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Shutter */}
              <button
                onClick={takePhoto}
                className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center active:scale-90 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-lg group-hover:scale-95 transition-transform" />
              </button>

              <button className="w-12 h-12 rounded-2xl border border-app text-muted flex items-center justify-center transition-all opacity-20 cursor-not-allowed">
                <RefreshCw className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="w-full flex gap-4">
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-4 rounded-2xl border-2 border-app text-muted hover:text-main hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all"
              >
                Retake
              </button>
              <button
                onClick={() => { onSend(capturedImage); onClose(); }}
                className="flex-2 py-4 px-8 rounded-2xl bg-gradient-main shadow-glow flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white hover:shadow-glow-strong transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" /> Send Photo
              </button>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraModal;
