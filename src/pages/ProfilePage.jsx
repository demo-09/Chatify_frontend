import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera, Mail, User, Edit3, Save, X, Loader2,
  Shield, Clock, CheckCircle2, Lock, Eye, EyeOff,
  Sparkles, Upload, Bell, Globe, Palette
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import OtpVerification from "../components/OtpVerification";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, sendOtp, sendUpdateOtp } = useAuthStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(authUser?.fullName || "");
  const [isSavingName, setIsSavingName] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPwd: "", confirm: "" });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [updatePayload, setUpdatePayload] = useState(null);

  const fileRef = useRef(null);

  const triggerUpdateWithOtp = async (payload) => {
    const sent = await sendUpdateOtp();
    if (sent) {
      setUpdatePayload(payload);
      setShowOtpModal(true);
    }
  };

  const handleFinalUpdate = async (otp) => {
    try {
      await updateProfile({ ...updatePayload, otp });
      setShowOtpModal(false);
      setUpdatePayload(null);
      setIsEditingName(false);
      setShowPasswordSection(false);
      setPasswordData({ current: "", newPwd: "", confirm: "" });
    } catch (err) {
      // toast.error is handled in store
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Select an image file"); return; }
    setIsUploadingImg(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      setSelectedImg(base64);
      await triggerUpdateWithOtp({ profilePic: base64 });
      setIsUploadingImg(false);
    };
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === authUser.fullName) {
      setIsEditingName(false);
      return;
    }
    await triggerUpdateWithOtp({ fullName: newName.trim() });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPwd.length < 6) { toast.error("New password must be 6+ characters"); return; }
    if (passwordData.newPwd !== passwordData.confirm) { toast.error("Passwords do not match"); return; }
    await triggerUpdateWithOtp({ currentPassword: passwordData.current, newPassword: passwordData.newPwd });
  };

  const handleSendOtp = async () => {
    const sent = await sendOtp(authUser.email);
    if (sent) setOtpSent(true);
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">My Profile</h1>
          <p className="text-muted mt-1 text-sm">Manage your account and personal settings.</p>
        </div>

        {/* Hero Card */}
        <div className="glass rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-subtle pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-accent/30 shadow-glow">
                <img
                  src={selectedImg || authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isUploadingImg || isUpdatingProfile}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-main rounded-full flex items-center justify-center shadow-glow border-2 border-appbg hover:scale-110 active:scale-95 transition-transform"
              >
                {isUploadingImg ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-white" />
                )}
              </button>
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Name + Email */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="app-input rounded-xl px-3 py-2 text-lg font-semibold flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") { setIsEditingName(false); setNewName(authUser.fullName); }
                      }}
                    />
                    <button onClick={handleSaveName} disabled={isSavingName} className="p-2 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors">
                      {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setIsEditingName(false); setNewName(authUser.fullName); }} className="p-2 rounded-lg hover:bg-white/5 text-muted transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-bold text-main">{authUser?.fullName}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-main transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted mb-3">
                <Mail className="w-3.5 h-3.5" />
                {authUser?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface border border-white/5 rounded-xl mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id 
                  ? "bg-card text-main shadow-sm border border-white/5" 
                  : "text-muted hover:text-main"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <h3 className="font-semibold text-main mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted">
              <User className="w-4 h-4" /> Account Information
            </h3>
            <div className="divide-y divide-white/5">
              <InfoRow label="Full Name" value={authUser?.fullName} />
              <InfoRow label="Email Address" value={authUser?.email} />
              <InfoRow label="Member Since" value={new Date(authUser?.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              <InfoRow label="Account Type" value="Standard" />
              <InfoRow label="Account ID" value={authUser?._id?.slice(-8).toUpperCase()} />
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-main mb-4 text-sm uppercase tracking-wider text-muted flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password & Authentication
              </h3>
              
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-card rounded-xl hover:bg-surface transition-all group mb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-main">Change Password</div>
                    <div className="text-xs text-muted">Update your account password</div>
                  </div>
                </div>
                <Edit3 className="w-4 h-4 text-muted group-hover:text-main transition-colors" />
              </button>

              {showPasswordSection && (
                <form onSubmit={handleChangePassword} className="space-y-3 pt-1 animate-slide-up">
                  {[
                    { label: "Current Password", key: "current", show: showCurrentPwd, toggle: () => setShowCurrentPwd(!showCurrentPwd) },
                    { label: "New Password", key: "newPwd", show: showNewPwd, toggle: () => setShowNewPwd(!showNewPwd) },
                  ].map(({ label, key, show, toggle }) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-muted block mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type={show ? "text" : "password"}
                          value={passwordData[key]}
                          onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                          className="app-input w-full rounded-xl py-2.5 px-4 pr-10 text-sm"
                          placeholder={key === "current" ? "Enter current password" : "Min 6 characters"}
                        />
                        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors">
                          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-muted block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="app-input w-full rounded-xl py-2.5 px-4 text-sm"
                      placeholder="Repeat new password"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={isChangingPwd} className="btn-primary-gradient flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                      {isChangingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </button>
                    <button type="button" onClick={() => setShowPasswordSection(false)} className="px-4 py-2.5 rounded-xl bg-surface text-sm text-muted hover:text-main transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              
            </div>
          </div>
        )}

      

      {/* OTP Verification Modal for Updates */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="animate-scale-in">
            <OtpVerification
              email={authUser.email}
              onVerify={handleFinalUpdate}
              onBack={() => setShowOtpModal(false)}
              isLoading={isUpdatingProfile}
              title="Verify Update"
              subtitle="Please enter the code sent to your email to confirm these changes."
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-sm text-muted">{label}</span>
    <span className="text-sm text-white font-medium">{value}</span>
  </div>
);

export default ProfilePage;
