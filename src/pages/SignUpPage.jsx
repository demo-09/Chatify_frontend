import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, ArrowRight, Check } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import OtpVerification from "../components/OtpVerification";

const features = [
  "End-to-end encrypted messages",
  "AI chat assistant included",
  "Voice-to-text messaging",
  "Snap & send photos",
];

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("signup");
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp, googleLogin, verifyOtp, isVerifyingOtp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be 6+ characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() === true) {
      const result = await signup(formData);
      if (result?.success) setStep("otp");
    }
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <OtpVerification
          email={formData.email}
          onVerify={(otp) => verifyOtp(formData.email, otp)}
          onBack={() => setStep("signup")}
          isLoading={isVerifyingOtp}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex overflow-hidden">
      {/* Left: Visual */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 flex-1 relative bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent2/8 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-gradient-main rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow-strong float-anim">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white mb-3 tracking-tight">
            The future of chat
          </h2>
          <p className="text-muted text-base mb-10 leading-relaxed">
            A beautifully designed, AI-powered messaging platform built for the modern era.
          </p>

          <div className="space-y-4 text-left">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-sm text-white/70">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 animate-fade-in">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-main flex items-center justify-center shadow-glow">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">Chatify</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Create account</h1>
            <p className="text-muted">Join millions of users today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ujjaval Karangiya"
                  className="app-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
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
              {/* Password strength hint */}
              {formData.password && (
                <div className="flex gap-1 mt-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        formData.password.length >= (i + 1) * 2
                          ? i < 2 ? "bg-yellow-400" : "bg-green-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className="btn-primary-gradient w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2"
            >
              {isSigningUp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-xs text-muted font-medium">or sign up with</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(cr) => googleLogin(cr.credential)}
              onError={() => {}}
              theme="filled_black"
              shape="rectangular"
              width="368"
            />
          </div>

          <p className="text-center text-sm text-muted mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:text-accent-light font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
