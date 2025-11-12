import { create } from "zustand";
import { fetchCurrentUser } from "../api/auth"; // 🔧 ตรวจสอบให้แน่ใจว่า path นี้ถูกต้อง

const useAuthStore = create((set, get) => ({
  // 🔹 State
  token: (() => {
    try {
      return localStorage.getItem("authToken") || null;
    } catch {
      return null;
    }
  })(),
  user: null,
  loadingUser: false,

  // 🔹 Action: Login + ดึงข้อมูลผู้ใช้
  setUser: async (authData) => {
    const token = authData?.access;
    if (!token) {
      console.error("No access token provided");
      return;
    }

    try {
      localStorage.setItem("authToken", token);
    } catch (err) {
      console.warn("Unable to access localStorage:", err);
    }

    set({ token, loadingUser: true });

    try {
      const userProfile = await fetchCurrentUser();
      set({ user: userProfile });
    } catch (err) {
      console.error("Failed to fetch user profile after login:", err);
      get().logout();
    } finally {
      set({ loadingUser: false });
    }
  },

  // 🔹 Action: โหลดข้อมูลผู้ใช้จาก token ที่มีใน localStorage
  loadUserFromToken: async () => {
    const { token, user, loadingUser } = get();
    if (!token || user || loadingUser) return;

    set({ loadingUser: true });
    try {
      const userProfile = await fetchCurrentUser();
      set({ user: userProfile });
    } catch (err) {
      console.warn("Token invalid or expired. Logging out.", err);
      get().logout();
    } finally {
      set({ loadingUser: false });
    }
  },

  // 🔹 Action: Logout (ล้าง token + state)
  logout: () => {
    try {
      localStorage.removeItem("authToken");
    } catch (err) {
      console.warn("Failed to clear localStorage:", err);
    }
    set({ token: null, user: null, loadingUser: false });
  },
}));

export default useAuthStore;
