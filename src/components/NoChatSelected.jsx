import { MessageSquare, Bot, Mic, Camera, Image, Shield } from "lucide-react";

const features = [
  { icon: Bot, label: "AI Assistant", desc: "Powered by Gemini" },
  { icon: Mic, label: "Voice Input", desc: "Speak to type" },
  { icon: Camera, label: "Snap Camera", desc: "Snapchat-style photos" },
  { icon: Shield, label: "OTP Secure", desc: "Email verification" },
];

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-appbg relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-main rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow float-anim">
          <MessageSquare className="w-10 h-10 text-white" />
        </div>

        <h2 className="font-display font-bold text-2xl text-main mb-2 tracking-tight">
          Select a conversation
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-10">
          Choose a contact from the sidebar to start chatting, or try the AI Assistant.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass rounded-xl p-4 text-left">
              <div className="w-8 h-8 rounded-lg bg-gradient-main flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-semibold text-main mb-0.5">{label}</div>
              <div className="text-xs text-muted">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
