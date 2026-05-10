import { create } from "zustand";

export const useSocialStore = create((set) => ({
  isSidebarOpen: false,
  isSidebarVisible: false, // Desktop manual toggle
  activeView: null, // "camera", "snap", "story"
  selectedContent: null, // The actual snap or story object

  openSidebar: (view, content = null) => set({ 
    isSidebarOpen: true, 
    activeView: view, 
    selectedContent: content 
  }),

  closeSidebar: () => set({ 
    isSidebarOpen: false, 
    activeView: null, 
    selectedContent: null 
  }),

  toggleSidebar: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
}));
