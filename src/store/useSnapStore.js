import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useSnapStore = create((set, get) => ({
  snaps: [],
  isLoading: false,
  isSending: false,

  fetchSnaps: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/snaps");
      set({ snaps: res.data });
    } catch (error) {
      console.error("Error fetching snaps:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch snaps");
    } finally {
      set({ isLoading: false });
    }
  },

  sendSnap: async (mediaUrl, receiverId, type = "image") => {
    set({ isSending: true });
    try {
      const res = await axiosInstance.post("/snaps/send", { mediaUrl, receiverId, type });
      set({ snaps: [res.data, ...get().snaps] });
      toast.success("Snap sent successfully!");
    } catch (error) {
      console.error("Error sending snap:", error);
      toast.error(error?.response?.data?.message || "Failed to send snap");
    } finally {
      set({ isSending: false });
    }
  },

  openSnap: async (snapId) => {
    try {
      const res = await axiosInstance.put(`/snaps/open/${snapId}`);
      // Update local state to mark as opened
      set({
        snaps: get().snaps.map((snap) =>
          snap._id === snapId ? { ...snap, status: "opened" } : snap
        ),
      });
      return res.data.mediaUrl;
    } catch (error) {
      console.error("Error opening snap:", error);
      toast.error(error?.response?.data?.message || "Failed to open snap");
      return null;
    }
  },

  subscribeToSnaps: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newSnap", (newSnap) => {
      set({ snaps: [newSnap, ...get().snaps] });
    });

    socket.on("snapOpened", ({ snapId }) => {
      set({
        snaps: get().snaps.map((snap) =>
          snap._id === snapId ? { ...snap, status: "opened" } : snap
        ),
      });
    });
  },

  unsubscribeFromSnaps: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newSnap");
    socket.off("snapOpened");
  },
}));
