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
import { View, ActivityIndicator, PanResponder } from "react-native";
import ChatBot from "../components/chatbot";
import useLanguageStore from "@/store/useLanguageStore";
import "../i18n";

export default function RootLayout(): React.ReactNode {
  const colorScheme = useColorScheme();
  const { initialize, loading, user } = useAuthStore();
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatBotVisible, setChatBotVisible] = useState(true);
  const [hasInitializedApp, setHasInitializedApp] = useState(false);
  const inactivityTimer = useRef<number | null>(null);

  const {
    initializeLanguage,
    isInitialized: languageInitialized,
    isLoading: languageLoading,
  } = useLanguageStore();

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
        resetInactivityTimer(false);
        return false;
      },
      onMoveShouldSetPanResponder: () => {
        resetInactivityTimer(false);
        return false;
      },
    })
  ).current;

  // Initialize app only once
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize language first
        await initializeLanguage();
        // Then initialize auth
        await initialize();
        setHasInitializedApp(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setHasInitializedApp(true); // Still set to true to prevent infinite loading
      }
    };

    if (!hasInitializedApp) {
      initializeApp();
    }
  }, [hasInitializedApp, initializeLanguage, initialize]);

  // Handle navigation only once after initialization
  useEffect(() => {
    if (hasInitializedApp && !loading && languageInitialized) {
      const timeout = setTimeout(() => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth");
        }
        setShowChatBot(true);
        resetInactivityTimer(false);
      }, 100); // Reduced delay

      return () => clearTimeout(timeout);
    }
  }, [hasInitializedApp, loading, user, languageInitialized]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  // Show loading while app is initializing
  if (
    !loaded ||
    !hasInitializedApp ||
    loading ||
    !languageInitialized ||
    languageLoading
  ) {
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
            {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
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
