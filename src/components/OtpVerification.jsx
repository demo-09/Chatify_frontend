import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2, MessageSquare, Shield } from "lucide-react";

const OtpVerification = ({ email, onVerify, onBack, isLoading, title, subtitle }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = [...otp];
    pasted.split("").forEach((char, i) => { if (i < 6) updated[i] = char; });
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = otp.join("");
    if (val.length === 6) onVerify(val);
  };

  return (
    <div className="w-full max-w-sm glass rounded-2xl p-8 shadow-card animate-slide-up">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-main flex items-center justify-center shadow-glow">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl gradient-text">Chatify</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white mb-1.5 tracking-tight">
          {title || "Check your email"}
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          {subtitle || "We sent a 6-digit code to"} <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* OTP inputs */}
        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all outline-none
                bg-card text-white
                ${digit ? "border-accent shadow-glow" : "border-app"}
                focus:border-accent focus:shadow-glow`}
              style={{ height: "52px" }}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={otp.join("").length !== 6 || isLoading}
          className="btn-primary-gradient w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold mb-4"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
          ) : (
            "Verify & Continue"
          )}
        </button>
      </form>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button className="text-sm text-accent hover:text-accent-light transition-colors font-medium">
          Resend code
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
