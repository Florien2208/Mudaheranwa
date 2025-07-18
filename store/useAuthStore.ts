import { API_BASE_URL } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { create } from "zustand";

interface User {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  displayName?: string;
  profilePicture?: string;
  phone?: string;
  isArtist?: boolean;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticating: boolean;
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>; // ADD THIS
  refreshUser: () => Promise<void>; // ADD THIS
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  token: null,
  isAuthenticating: false,

  // Initialize auth state from storage
  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");
      const userJson = await AsyncStorage.getItem("user");

      if (token && userJson) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const user = JSON.parse(userJson);

        set({ user, token, loading: false });
      } else {
        set({ user: null, token: null, loading: false });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ loading: false, error: "Failed to initialize authentication" });
    }
  },

  // Login function with delayed navigation
  login: async (credentials: LoginCredentials) => {
    set({ loading: true, error: null, isAuthenticating: true });
    console.log("login called", credentials);
    try {
      // API call to authenticate
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/v1/auth/login`,
        credentials
      );

      const { user, token } = response.data;

      // Store auth data
      await AsyncStorage.setItem("@auth_token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Set default auth header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ user, token, loading: false, error: null });

      // Navigate after a small delay to allow UI to update
      setTimeout(() => {
        set({ isAuthenticating: false });
        router.replace("/(tabs)");
      }, 200);
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      set({
        loading: false,
        isAuthenticating: false,
        error:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      });
    }
  },

  // Signup function with delayed navigation
  signup: async (userData: SignupData) => {
    set({ loading: true, error: null, isAuthenticating: true });
    console.log("signup called", userData);
    try {
      // API call to register
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/v1/auth/register`,
        userData
      );

      const { user, token } = response.data;

      // Store auth data
      await AsyncStorage.setItem("@auth_token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Set default auth header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ user, token, loading: false, error: null });

      // Navigate after a small delay to allow UI to update
      setTimeout(() => {
        set({ isAuthenticating: false });
        router.replace("/(tabs)");
      }, 200);
    } catch (error: any) {
      console.error("Signup error:", error.response?.data || error.message);
      set({
        loading: false,
        isAuthenticating: false,
        error:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  },

  // Logout function
  logout: async () => {
    try {
      // Remove auth data
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("user");

      // Clear auth header
      delete axios.defaults.headers.common["Authorization"];

      set({ user: null, token: null, isAuthenticating: false, loading: false });
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      set({ error: "Failed to logout properly", loading: false });
    }
  },

  // Clear any error messages
  clearError: () => set({ error: null }),

  // ADD THIS: Update profile method
  updateProfile: async (userData: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) return;

      const updatedUser = { ...user, ...userData };

      // Update AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      set({ user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // ADD THIS: Refresh user data from server
  refreshUser: async () => {
    try {
      const { token } = get();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = response.data.user || response.data;

      // Update AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      set({ user: updatedUser });
    } catch (error) {
      console.error("Error refreshing user:", error);
      throw error;
    }
  },
}));

export default useAuthStore;
