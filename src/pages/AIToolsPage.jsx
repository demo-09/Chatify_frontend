import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, User, Sparkles, Trash2, Image as ImageIcon } from "lucide-react";
import { useAIStore } from "../store/useAIStore";
import { useAuthStore } from "../store/useAuthStore";

const AIToolsPage = () => {
  const { chatHistory, sendMessage, isGenerating, clearHistory, analyzeImage } = useAIStore();
  const { authUser } = useAuthStore();
  const [prompt, setPrompt] = useState("");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isGenerating]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const currentPrompt = prompt;
    setPrompt("");
    await sendMessage(currentPrompt);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      await analyzeImage(base64Image, "Describe this image in detail.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in overflow-hidden">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-main tracking-tight mb-1">AI Chat Assistant</h1>
          <p className="text-muted text-sm flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-accent" /> Powered by Gemini 1.5 Flash
          </p>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 text-muted hover:text-rose-500 transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass rounded-2xl border border-app mb-4 overflow-y-auto p-4 sm:p-6 no-scrollbar flex flex-col gap-4">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-main font-semibold mb-2">How can I help you today?</h3>
            <p className="text-sm text-muted max-w-xs">Ask me anything, translate text, or even upload an image for analysis.</p>
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-accent' : 'bg-surface border border-app'}`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-accent" />
                )}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-tr-none' 
                  : 'bg-card border border-app text-main rounded-tl-none'
              }`}>
                {msg.parts[0].text}
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface border border-app flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-card border border-app p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span className="text-xs text-muted">Gemini is thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative group">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..." 
          disabled={isGenerating}
          className="w-full bg-card border border-app rounded-2xl py-4 pl-12 pr-24 text-sm text-main placeholder:text-muted outline-none focus:border-accent/50 transition-all shadow-xl"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Bot className="w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            className="p-2 text-muted hover:text-white transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`p-2 rounded-xl transition-all ${
              prompt.trim() && !isGenerating 
                ? 'bg-accent text-white shadow-glow hover:scale-105' 
                : 'text-muted'
            }`}
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIToolsPage;
