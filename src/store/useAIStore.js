import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAIStore = create((set, get) => ({
  chatHistory: [],
  isGenerating: false,

  sendMessage: async (prompt) => {
    set({ isGenerating: true });
    try {
      // Add user message to local history first for immediate feedback
      const userMessage = { role: "user", parts: [{ text: prompt }] };
      set({ chatHistory: [...get().chatHistory, userMessage] });

      const res = await axiosInstance.post("/ai/chat", { 
        prompt,
        history: get().chatHistory.slice(0, -1) // Send history excluding the latest user message
      });

      const aiMessage = { role: "model", parts: [{ text: res.data.response }] };
      set({ chatHistory: [...get().chatHistory, aiMessage] });
    } catch (error) {
      console.error("AI error:", error);
      toast.error(error?.response?.data?.message || "AI failed to respond");
    } finally {
      set({ isGenerating: false });
    }
  },

  analyzeImage: async (image, prompt) => {
    set({ isGenerating: true });
    try {
      const res = await axiosInstance.post("/ai/analyze-image", { image, prompt });
      const aiMessage = { 
        role: "model", 
        parts: [{ text: `[Image Analysis] ${res.data.response}` }],
        isImageAnalysis: true 
      };
      set({ chatHistory: [...get().chatHistory, aiMessage] });
    } catch (error) {
      console.error("AI image analysis error:", error);
      toast.error(error?.response?.data?.message || "Image analysis failed");
    } finally {
      set({ isGenerating: false });
    }
  },

  clearHistory: () => set({ chatHistory: [] }),
}));
