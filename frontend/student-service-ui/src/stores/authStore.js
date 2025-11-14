import { create } from "zustand";
import { fetchCurrentUser } from "../api/auth";

const useAuthStore = create((set, get) => ({
  token: (() => {
    try {
      return localStorage.getItem("authToken") || null;
    } catch {
      return null;
    }
  })(),
  user: null,
  loadingUser: false,


  setUser: async (authData) => {
    console.log('🔍 setUser called with:', authData);
    
    const token = authData?.access;
    console.log('🔍 Extracted token:', token);
    
    if (!token) {
      console.error("❌ No access token provided");
      return;
    }

    try {
      localStorage.setItem("authToken", token);
      console.log('✅ Token saved to localStorage');
    } catch (err) {
      console.warn("⚠️ Unable to access localStorage:", err);
    }

    set({ token, loadingUser: true });

    try {
    
      if (authData.id || authData.username || authData.email) {
        console.log('✅ User data found in authData, using directly');
        set({ user: authData });
      } else {
        console.log('🔄 Fetching user profile...');
        const userProfile = await fetchCurrentUser();
        console.log('✅ User profile fetched:', userProfile);
        set({ user: userProfile });
      }
    } catch (err) {
      console.error("❌ Failed to fetch user profile after login:", err);
      get().logout();
    } finally {
      set({ loadingUser: false });
    }
  },


  loadUserFromToken: async () => {
    const { token, user, loadingUser } = get();
    console.log('🔍 loadUserFromToken called. Token:', !!token, 'User:', !!user);
    
    if (!token || user || loadingUser) return;

    set({ loadingUser: true });
    try {
      const userProfile = await fetchCurrentUser();
      console.log('✅ User loaded from token:', userProfile);
      set({ user: userProfile });
    } catch (err) {
      console.warn("⚠️ Token invalid or expired. Logging out.", err);
      get().logout();
    } finally {
      set({ loadingUser: false });
    }
  },

  
  logout: () => {
    console.log('🔴 Logging out...');
    try {
      localStorage.removeItem("authToken");
    } catch (err) {
      console.warn("⚠️ Failed to clear localStorage:", err);
    }
    set({ token: null, user: null, loadingUser: false });
  },
}));

export default useAuthStore;