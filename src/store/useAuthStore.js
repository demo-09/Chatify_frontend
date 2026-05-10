import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    isVerifyingOtp: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data });

            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth:", error);

            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success(res.data.message || "OTP sent to your email");
            return { success: true, email: data.email };
        } catch (error) {
            toast.error(error?.response?.data?.message || "Signup failed");
            return { success: false };
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            toast.success(res.data.message || "OTP sent to your email");
            return { success: true, email: data.email };
        } catch (error) {
            console.log("Login error:", error);
            toast.error(error?.response?.data?.message || "Login failed");
            return { success: false };
        } finally {
            set({ isLoggingIn: false });
        }
    },

    googleLogin: async (token) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/google-login", { token });
            set({ authUser: res.data });
            toast.success("Logged in with Google");
            get().connectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Google Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    sendOtp: async (email) => {
        try {
            await axiosInstance.post("/auth/send-otp", { email });
            toast.success("OTP sent to your email");
            return true;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
            return false;
        }
    },

    sendUpdateOtp: async () => {
        try {
            await axiosInstance.post("/auth/send-update-otp");
            toast.success("Verification OTP sent to your email");
            return true;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
            return false;
        }
    },

    verifyOtp: async (email, otp) => {
        set({ isVerifyingOtp: true });
        try {
            const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
            set({ authUser: res.data });
            toast.success("OTP Verified! Logged in.");
            get().connectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Invalid OTP");
        } finally {
            set({ isVerifyingOtp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");

            get().disconnectSocket();

            set({
                authUser: null,
                onlineUsers: [],
            });

            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Logout failed"
            );
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });

        try {
            const res = await axiosInstance.put(
                "/auth/update-profile",
                data
            );

            set({ authUser: res.data });

            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in update profile:", error);

            toast.error(
                error?.response?.data?.message ||
                "Profile update failed"
            );
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get();

        if (!authUser) return;

        if (socket?.connected) return;

        const newSocket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
            withCredentials: true,
            transports: ["websocket"],
        });

        newSocket.connect();

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();

        if (socket?.connected) {
            socket.disconnect();
        }

        set({ socket: null });
    },
}));