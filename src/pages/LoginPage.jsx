import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import OtpVerification from "../components/OtpVerification";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn, googleLogin, sendOtp, verifyOtp, isVerifyingOtp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result?.success) setStep("otp");
  };

  const handleGoogleSuccess = (credentialResponse) => {
    googleLogin(credentialResponse.credential);
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <OtpVerification
          email={formData.email}
          onVerify={(otp) => verifyOtp(formData.email, otp)}
          onBack={() => setStep("login")}
          isLoading={isVerifyingOtp}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex overflow-hidden">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 animate-fade-in">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent2/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative">
          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-main flex items-center justify-center shadow-glow">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">Chatify</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Welcome back</h1>
            <p className="text-muted">Sign in to continue chatting</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="app-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="app-input w-full rounded-xl py-3 pl-10 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary-gradient w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-xs text-muted font-medium">or continue with</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {}}
              theme="filled_black"
              shape="rectangular"
              width="368"
            />
          </div>

          {/* Signup link */}
          <p className="text-center text-sm text-muted mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:text-accent-light font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative bg-surface overflow-hidden">
        {/* Decorative mesh gradient */}
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent2/8 rounded-full blur-[100px]" />

        {/* Floating cards */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Mock chat preview */}
          <div className="glass rounded-2xl overflow-hidden shadow-card">
            {/* Header */}
            <div className="px-5 py-4 border-b border-app flex items-center gap-3">
              <div className="avatar-ring w-9 h-9 flex-shrink-0">
                <img src="/avatar.png" className="w-full h-full object-cover rounded-full" alt="User" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Alex Johnson</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full status-online inline-block"></span>
                  <span className="text-xs text-muted">Active now</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 bg-card min-h-[220px]">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-main flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">A</span>
                </div>
                <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                  <p className="text-sm text-white">Hey! Try the new AI assistant 🤖</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gradient-main rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">
                  <p className="text-sm text-white">It's amazing! Just tried it 🔥</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent2 to-accent3 flex-shrink-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                  <p className="text-sm text-white">I'm your AI assistant. Ask me anything!</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-app flex gap-2">
              <div className="flex-1 bg-card rounded-xl px-4 py-2.5 text-sm text-muted">
                Type a message...
              </div>
              <button className="w-9 h-9 bg-gradient-main rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow">
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {["🔒 OTP Secure", "🤖 AI Chat", "📸 Snap Camera", "🎤 Voice Input", "🌐 Google Auth"].map(f => (
              <span key={f} className="px-3 py-1.5 glass rounded-full text-xs font-medium text-white/70">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
