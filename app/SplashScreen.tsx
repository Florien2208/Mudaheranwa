import React, { useEffect, useCallback } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { ThemedView } from "@/components/ThemedView";

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const navigateToAuth = useCallback(() => {
    router.replace("/auth");
  }, [router]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 800 });
      scale.value = withTiming(0.8, { duration: 800 }, () => {
        runOnJS(navigateToAuth)();
      });
    }, 5000); // shorten duration for faster testing

    return () => clearTimeout(timer);
  }, [navigateToAuth, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.textContainer, animatedStyle]}>
        <Text style={styles.welcomeText}>welocme</Text>
        <Text style={styles.nameText}>MUDAHERANWA</Text>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontStyle: "italic",
    color: "#2e3a59",
    fontFamily: "serif",
  },
  nameText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8a4fff",
    marginTop: 4,
    textTransform: "uppercase",
  },
});
