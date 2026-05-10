import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  callHistory: [],
  isLoading: false,

  fetchCallHistory: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/calls/history");
      set({ callHistory: res.data });
    } catch (error) {
      console.error("Error fetching call history:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  logCall: async (callData) => {
    try {
      const res = await axiosInstance.post("/calls/log", callData);
      set({ callHistory: [res.data, ...get().callHistory] });
    } catch (error) {
      console.error("Error logging call:", error);
    }
  },
}));
