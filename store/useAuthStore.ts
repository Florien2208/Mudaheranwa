import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { API_BASE_URL } from "@/constants";

// API base URL - replace with your actual API endpoint


// Define types
interface User {
  id?: string;
  email?: string;
  fullName?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
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

  // Initialize auth state from storage
  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      console.log("Token from storage:", token);
      const userJson = await AsyncStorage.getItem("user");

      if (token && userJson) {
        // Set default auth header for all requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        set({
          user: JSON.parse(userJson) as User,
          token,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ loading: false, error: "Failed to initialize authentication" });
    }
  },

  // Login function
  login: async (credentials: LoginCredentials) => {
    set({ loading: true, error: null });
console.log("login called", credentials);
    try {
      // API call to authenticate
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/v1/auth/login`,
        credentials
      );

      const { user, token } = response.data;

      // Store auth data
      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Set default auth header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ user, token, loading: false });
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      set({
        loading: false,
        error:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      });
    }
  },

  // Signup function
  signup: async (userData: SignupData) => {
    set({ loading: true, error: null });
console.log("signup called", userData);
    try {
      // API call to register
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/v1/auth/register`,
        userData
      );

      const { user, token } = response.data;

      // Store auth data
      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Set default auth header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ user, token, loading: false });
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Signup error:", error.response?.data || error.message);
      set({
        loading: false,
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
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user");

      // Clear auth header
      delete axios.defaults.headers.common["Authorization"];

      set({ user: null, token: null });
      router.replace("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      set({ error: "Failed to logout properly" });
    }
  },

  // Clear any error messages
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
