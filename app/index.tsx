import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Simplified features - only 4 main ones
const features = [
  { id: 1, title: "Music", icon: "🎵" },
  { id: 2, title: "Videos", icon: "🎬" },
  { id: 3, title: "Books", icon: "📚" },
  { id: 4, title: "Memorial", icon: "🗺️" },
];

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onFeaturePress?: (feature: string) => void;
}

export default function WelcomeScreen({

  onFeaturePress,
}: WelcomeScreenProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const pulseValue = useSharedValue(1);
  const scaleValue = useSharedValue(0);

  useEffect(() => {
    // Logo pulse animation
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );

    // Initial scale animation
    scaleValue.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  // Enhanced color system
  const colors = {
    primary: "#72b7e9",
    primaryDark: "#4a9ce8",
    text: colorScheme === "dark" ? "#FFFFFF" : "#1C1C1E",
    textSecondary: colorScheme === "dark" ? "#A1A1AA" : "#6B7280",
    background: colorScheme === "dark" ? "#000000" : "#FAFAFA",
    surface: colorScheme === "dark" ? "#111827" : "#FFFFFF",
    shadow: colorScheme === "dark" ? "#000000" : "#00000020",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Background gradient */}
      <LinearGradient
        colors={[
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.1)"
            : "rgba(114, 183, 233, 0.05)",
          "transparent",
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.1)"
            : "rgba(114, 183, 233, 0.05)",
        ]}
        style={styles.backgroundGradient}
      />

      {/* Main Content - Centered */}
      <View style={styles.mainContent}>
        {/* Header Section */}
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={styles.header}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              pulseAnimatedStyle,
              scaleAnimatedStyle,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.logo}
            >
              <Text style={styles.logoText}>M</Text>
            </LinearGradient>
          </Animated.View>

          <Text style={[styles.appTitle, { color: colors.text }]}>
            Mudaheranwa
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Where Art Meets Soul
          </Text>
        </Animated.View>

        {/* Features Grid */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(400)}
          style={styles.featuresContainer}
        >
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                entering={FadeInUp.duration(600).delay(index * 100 + 600)}
              >
                <TouchableOpacity
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: colors.surface,
                      shadowColor: colors.shadow,
                    },
                  ]}
                  onPress={() => onFeaturePress?.(feature.title.toLowerCase())}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.featureIconContainer}
                  >
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </LinearGradient>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {feature.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          entering={FadeInUp.duration(800).delay(1000)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={[styles.getStartedButton, { shadowColor: colors.primary }]}
            onPress={() => router.push("/(auth)/sign-in")}

            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Text style={styles.buttonIcon}>✨</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop:
      Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 20,
    paddingBottom: 40,
  },

  // Header Section
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "800",
    color: "white",
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "500",
  },

  // Features Section
  featuresContainer: {
    marginBottom: 50,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  featureCard: {
    width: (width - 80) / 2,
    height: 120,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Button Section
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  getStartedButton: {
    width: width - 48,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    fontSize: 18,
  },
});
