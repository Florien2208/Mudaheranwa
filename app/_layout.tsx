import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { View, ActivityIndicator } from "react-native";
import ChatBot from "../components/chatbot";

export default function RootLayout(): React.ReactNode {
  const colorScheme = useColorScheme();
  const { initialize, loading, user } = useAuthStore();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Poppins: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsSemiBold: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize auth on app launch
  useEffect(() => {
    initialize();
  }, []);

  // Redirect based on auth status after initialization
  useEffect(() => {
    if (!loading) {
      // After auth is initialized, redirect to appropriate screen
      const timeout = setTimeout(() => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth");
        }
      }, 5000); // Small delay to ensure navigation works properly

      return () => clearTimeout(timeout);
    }
  }, [loading, user]);

  if (!loaded || loading) {
    // Show loading indicator while fonts and auth are loading
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          {/* ChatBot positioned as an absolute overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "box-none",
            }}
          >
            <ChatBot />
          </View>
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
