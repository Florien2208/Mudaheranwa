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
import { useEffect, useState, useRef } from "react";
import useAuthStore from "@/store/useAuthStore";
import {
  View,
  ActivityIndicator,
  PanResponder,
  Dimensions,
} from "react-native";
import ChatBot from "../components/chatbot";

export default function RootLayout(): React.ReactNode {
  const colorScheme = useColorScheme();
  const { initialize, loading, user } = useAuthStore();
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatBotVisible, setChatBotVisible] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Poppins: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsSemiBold: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Reset inactivity timer - only if chatbot is not currently open
  const resetInactivityTimer = (chatIsOpen = false) => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Show chatbot if it was hidden due to inactivity
    setChatBotVisible(true);

    // Only set timer to hide chatbot if chat is not currently open
    if (!chatIsOpen) {
      inactivityTimer.current = setTimeout(() => {
        setChatBotVisible(false);
      }, 5000);
    }
  };

  // Create PanResponder to detect user interactions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetInactivityTimer(false); // Pass false since this is general app interaction
        return false; // Don't capture the gesture, just detect it
      },
      onMoveShouldSetPanResponder: () => {
        resetInactivityTimer(false); // Pass false since this is general app interaction
        return false;
      },
    })
  ).current;

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
        setShowChatBot(true);
        // Start the inactivity timer when chatbot becomes available
        resetInactivityTimer(false);
      }, 5000); // Small delay to ensure navigation works properly

      return () => clearTimeout(timeout);
    }
  }, [loading, user]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

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
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
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
          {showChatBot && chatBotVisible && (
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
              <ChatBot onInteraction={resetInactivityTimer} />
            </View>
          )}
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
