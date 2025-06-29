import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import useLanguageStore from "@/store/useLanguageStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect,  useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../i18n";

export default function RootLayout(): React.ReactNode {
  const colorScheme = useColorScheme();
  const { initialize, loading, user } = useAuthStore();

  const [hasInitializedApp, setHasInitializedApp] = useState(false);
  const [hasNavigatedOnce, setHasNavigatedOnce] = useState(false);
 
  const pathname = usePathname();

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

  // UPDATED: Navigate immediately when user state is determined, regardless of other loading states
  useEffect(() => {
    // Only proceed if fonts are loaded and auth has been initialized (user state is determined)
    if (loaded && hasInitializedApp && !hasNavigatedOnce) {
      const timeout = setTimeout(() => {
        if (user) {
          console.log("User found, navigating to tabs");
          router.replace("/(tabs)");
        } else {
          console.log("No user found, navigating to auth");
          router.replace("/");
        }

        setHasNavigatedOnce(true);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [loaded, hasInitializedApp, user, hasNavigatedOnce]);

  // Handle subsequent user state changes (login/logout)
  useEffect(() => {
    if (hasNavigatedOnce && hasInitializedApp && !loading) {
      const currentPath = pathname;

      if (user && (currentPath.includes("auth") || currentPath === "/")) {
        // User logged in successfully, navigate to tabs
        console.log("User logged in, navigating to tabs");
        router.replace("/(tabs)");
      } else if (!user && currentPath.includes("tabs")) {
        // User logged out, navigate to auth
        console.log("User logged out, navigating to auth");
        router.replace("/");
      }
    }
  }, [user, hasNavigatedOnce, hasInitializedApp, loading, pathname]);

  // Show loading only while essential components are loading
  if (!loaded || !hasInitializedApp) {
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
              name="(auth)"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
