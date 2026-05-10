import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAdminStore = create((set, get) => ({
  stats: null,
  users: [],
  isLoadingStats: false,
  isLoadingUsers: false,
  isUpdatingRole: false,

  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const res = await axiosInstance.get("/admin/stats");
      set({ stats: res.data });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch stats");
    } finally {
      set({ isLoadingStats: false });
    }
  },

  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const res = await axiosInstance.get("/admin/users");
      set({ users: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  updateUserRole: async (userId, newRole) => {
    set({ isUpdatingRole: true });
    try {
      const res = await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole });
      set({
        users: get().users.map((u) => (u._id === userId ? res.data : u)),
      });
      toast.success("User role updated");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error?.response?.data?.message || "Failed to update role");
    } finally {
      set({ isUpdatingRole: false });
    }
  },

  deleteUser: async (userId) => {
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      set({
        users: get().users.filter((u) => u._id !== userId),
      });
      toast.success("User deleted");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  },
}));
