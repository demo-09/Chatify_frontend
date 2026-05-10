import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { useSocialStore } from "../store/useSocialStore";
import { Image, Send, X, Mic, Camera as CameraIcon, Smile, FileText } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';
import CameraModal from "./CameraModal";

const MessageInput = () => {
  const { theme } = useThemeStore();
  const { isCameraMode, setCameraMode, draftImage, setDraftImage } = useChatStore();
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const fileRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const { sendMessage } = useChatStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setDraftImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview({ name: file.name, data: reader.result });
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => setAudioBlob(reader.result);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !draftImage && !filePreview && !audioBlob) return;
    try {
      await sendMessage({ 
        text: text.trim(), 
        image: draftImage,
        file: filePreview?.data,
        fileName: filePreview?.name,
        audio: audioBlob
      });
      setText("");
      setDraftImage(null);
      setFilePreview(null);
      setAudioBlob(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (fileRef.current) fileRef.current.value = "";
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setText(prevInput => prevInput + emojiObject.emoji);
  };

  const pickerTheme = ["light", "cupcake", "bumblebee", "emerald", "corporate", "garden", "lofi", "pastel", "fantasy", "wireframe", "cmyk", "autumn", "lemonade", "winter"].includes(theme) ? "light" : "dark";

  return (
    <div className="border-t border-app bg-surface/80 backdrop-blur-sm p-3 sm:p-4 flex-shrink-0 relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {draftImage && (
          <div className="relative inline-block group">
            <img src={draftImage} alt="Preview" className="h-16 w-auto rounded-xl object-cover border border-app shadow-glow" />
            <button onClick={() => setDraftImage(null)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-surface border border-app text-muted hover:text-main flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {filePreview && (
          <div className="relative flex items-center gap-2 bg-card p-2 rounded-xl border border-app">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-xs text-main max-w-[100px] truncate">{filePreview.name}</span>
            <button onClick={() => setFilePreview(null)} className="w-5 h-5 rounded-full bg-surface text-muted hover:text-main flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {audioBlob && (
          <div className="relative flex items-center gap-2 bg-accent/10 p-2 rounded-xl border border-accent/20">
            <Mic className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent font-medium">Voice Note Recorded</span>
            <button onClick={() => setAudioBlob(null)} className="w-5 h-5 rounded-full bg-surface text-muted hover:text-main flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-[80px] left-4 z-50 shadow-card">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={pickerTheme} />
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-xl text-muted hover:text-main hover:bg-white/5 transition-all">
            <Smile className="w-5 h-5" />
          </button>
          <button 
            type="button" 
            onClick={() => setCameraMode(true)} 
            className={`p-2 rounded-xl transition-all ${isCameraMode ? "text-accent bg-accent/10" : "text-muted hover:text-main hover:bg-white/5"}`}
          >
            <CameraIcon className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl text-muted hover:text-main hover:bg-white/5 transition-all">
            <Image className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="p-2 rounded-xl text-muted hover:text-main hover:bg-white/5 transition-all">
            <FileText className="w-5 h-5" />
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          <input type="file" className="hidden" ref={fileRef} onChange={handleFileChange} />
        </div>

        <div className="flex-1 relative">
          {isListening ? (
            <div className="flex-1 bg-accent/5 border border-accent/20 rounded-2xl py-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-accent font-medium">Recording... {recordingTime}s</span>
              </div>
              <button type="button" onClick={stopVoiceRecording} className="text-accent font-bold text-xs uppercase tracking-wider">Stop</button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-card border border-app rounded-2xl py-3 pl-4 pr-12 text-sm text-main placeholder:text-muted outline-none focus:border-accent/50 transition-colors"
              />
              <button type="button" onClick={startVoiceRecording} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main">
                <Mic className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !draftImage && !filePreview && !audioBlob}
          className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-main flex items-center justify-center shadow-glow transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
