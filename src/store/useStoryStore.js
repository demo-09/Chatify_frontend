import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useStoryStore = create((set, get) => ({
  stories: [],
  isLoading: false,
  isUploading: false,

  fetchStories: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/stories");
      set({ stories: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch stories");
    } finally {
      set({ isLoading: false });
    }
  },

  uploadStory: async (mediaUrl, type = "image") => {
    set({ isUploading: true });
    try {
      const res = await axiosInstance.post("/stories/upload", { mediaUrl, type });
      set({ stories: [res.data, ...get().stories] });
      toast.success("Story uploaded successfully!");
    } catch (error) {
      console.error("Error uploading story:", error);
      toast.error(error?.response?.data?.message || "Failed to upload story");
    } finally {
      set({ isUploading: false });
    }
  },

  viewStory: async (storyId) => {
    try {
      await axiosInstance.put(`/stories/view/${storyId}`);
      // Optimistically update the view in local state if needed
    } catch (error) {
      console.error("Error viewing story:", error);
    }
  }
}));
