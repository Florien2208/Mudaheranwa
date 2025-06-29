import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

// Enhanced features with better icons and descriptions
const features = [
  {
    id: 1,
    title: "Music",
    icon: "♫",
    description: "Discover melodies",
    gradient: ["#FF6B6B", "#FF8E8E"],
  },
  {
    id: 2,
    title: "Videos",
    icon: "▶",
    description: "Watch stories",
    gradient: ["#4ECDC4", "#44B3AA"],
  },
  {
    id: 3,
    title: "Books",
    icon: "📖",
    description: "Read wisdom",
    gradient: ["#45B7D1", "#3A9BC1"],
  },
  {
    id: 4,
    title: "Memorial",
    icon: "🏛",
    description: "Honor legacy",
    gradient: ["#96CEB4", "#85B8A3"],
  },
];

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onFeaturePress?: (feature: string) => void;
}

export default function WelcomeScreen({
  onFeaturePress,
}: WelcomeScreenProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const pulseValue = useSharedValue(1);
  const scaleValue = useSharedValue(0);
  const floatValue = useSharedValue(0);
  const rotateValue = useSharedValue(0);
  const shimmerValue = useSharedValue(0);

  // Responsive dimensions
  const isSmallScreen = height < 700;
  const isMediumScreen = height >= 700 && height < 800;
  const isLargeScreen = height >= 800;

  // Dynamic sizing based on screen
  const getIconSize = () => {
    if (isSmallScreen) return Math.min(width * 0.32, 140);
    if (isMediumScreen) return Math.min(width * 0.36, 160);
    return Math.min(width * 0.4, 180);
  };

  const getImageSize = () => {
    const iconSize = getIconSize();
    return iconSize * 0.85; // Image slightly smaller than container for better padding
  };

  const getVerticalSpacing = () => {
    if (isSmallScreen) return { section: 20, icon: 30, features: 25 };
    if (isMediumScreen) return { section: 30, icon: 40, features: 35 };
    return { section: 40, icon: 50, features: 45 };
  };

  useEffect(() => {
    // Logo pulse animation - more subtle for larger icon
    pulseValue.value = withRepeat(
      withTiming(1.08, { duration: 3500 }),
      -1,
      true
    );

    // Floating animation
    floatValue.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);

    // Subtle rotation
    rotateValue.value = withRepeat(
      withTiming(360, { duration: 30000 }),
      -1,
      false
    );

    // Shimmer effect
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 2500 }),
      -1,
      true
    );

    // Initial scale animation with bounce
    scaleValue.value = withDelay(
      500,
      withSpring(1, { damping: 12, stiffness: 80 })
    );
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const floatAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatValue.value, [0, 1], [0, -12]);
    return {
      transform: [{ translateY }],
    };
  });

  const rotateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotateValue.value}deg` },
      { scale: scaleValue.value },
    ],
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 0.5, 1], [0.8, 1, 0.8]);
    return {
      opacity,
    };
  });

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Enhanced background gradient with more colors */}
      <LinearGradient
        colors={[
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.15)"
            : "rgba(114, 183, 233, 0.08)",
          "transparent",
          colorScheme === "dark"
            ? "rgba(255, 107, 107, 0.12)"
            : "rgba(255, 107, 107, 0.06)",
          "transparent",
          colorScheme === "dark"
            ? "rgba(150, 206, 180, 0.1)"
            : "rgba(150, 206, 180, 0.05)",
          "transparent",
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.15)"
            : "rgba(114, 183, 233, 0.08)",
        ]}
        className="absolute inset-0"
      />

      {/* Enhanced floating decorative elements */}
      <Animated.View
        style={[
          floatAnimatedStyle,
          {
            position: "absolute",
            top: height * 0.15,
            right: -60,
            width: isSmallScreen ? 100 : 140,
            height: isSmallScreen ? 100 : 140,
            borderRadius: isSmallScreen ? 50 : 70,
            backgroundColor: "rgba(114, 183, 233, 0.12)",
            opacity: 0.6,
          },
        ]}
      />
      <Animated.View
        style={[
          floatAnimatedStyle,
          {
            position: "absolute",
            bottom: height * 0.35,
            left: -40,
            width: isSmallScreen ? 80 : 120,
            height: isSmallScreen ? 80 : 120,
            borderRadius: isSmallScreen ? 40 : 60,
            backgroundColor: "rgba(255, 107, 107, 0.1)",
            opacity: 0.5,
          },
        ]}
      />
      <Animated.View
        style={[
          floatAnimatedStyle,
          {
            position: "absolute",
            top: height * 0.4,
            right: width * 0.1,
            width: isSmallScreen ? 60 : 90,
            height: isSmallScreen ? 60 : 90,
            borderRadius: isSmallScreen ? 30 : 45,
            backgroundColor: "rgba(150, 206, 180, 0.08)",
            opacity: 0.4,
          },
        ]}
      />

      {/* Scrollable Content Container for better adaptability */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section - Enhanced artistic icon */}
        <Animated.View
          entering={FadeInUp.duration(1200).springify()}
          className="items-center"
          style={{ marginBottom: getVerticalSpacing().icon }}
        >
          {/* Enhanced Artistic Icon Container */}
          <Animated.View
            style={[pulseAnimatedStyle, rotateAnimatedStyle]}
            className="mb-6"
          >
            <Animated.View
              style={[shimmerAnimatedStyle]}
              className="rounded-full justify-center items-center relative overflow-hidden"
              style={{
                width: getIconSize(),
                height: getIconSize(),
                shadowOffset: { width: 0, height: isSmallScreen ? 12 : 20 },
                shadowOpacity: 0.4,
                shadowRadius: isSmallScreen ? 20 : 30,
                elevation: isSmallScreen ? 15 : 25,
                shadowColor: colorScheme === "dark" ? "#72b7e9" : "#4a9ce8",
              }}
            >
              {/* Multi-layered backdrop with artistic gradients */}
              <LinearGradient
                colors={[
                  "rgba(114, 183, 233, 0.25)",
                  "rgba(255, 107, 107, 0.2)",
                  "rgba(150, 206, 180, 0.15)",
                  "rgba(114, 183, 233, 0.25)",
                ]}
                className="absolute inset-0 rounded-full"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Inner glow effect */}
              <View
                className="absolute inset-2 rounded-full"
                style={{
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.3)",
                }}
              />

              {/* 
                REPLACE THIS IMAGE WITH YOUR CHOSEN ARTISTIC IMAGE
                
                🎨 RECOMMENDED FREE SOURCES:
                
                1. PEXELS (https://www.pexels.com/search/):
                   - "watercolor splash colorful"
                   - "abstract paint brush strokes"
                   - "artistic palette rainbow colors" 
                   - "creative mandala spiritual art"
                   - "watercolor blooms artistic"
                
                2. UNSPLASH (https://unsplash.com/s/photos/):
                   - "abstract art colorful"
                   - "watercolor paint creative"
                   - "artistic design vibrant"
                   - "creative art inspiration"
                
                3. PIXABAY (https://pixabay.com/images/search/):
                   - "abstract watercolor art"
                   - "colorful creative design"
                   - "artistic paint splash"
                
                💡 SUGGESTIONS FOR PERFECT MATCH:
                - Look for circular or square compositions
                - Choose images with vibrant colors that match your gradient scheme
                - Prefer watercolor/paint splash effects for artistic feel
                - Avoid images with text or complex details that won't show well when small
              */}
              <Image
                source={require("@/assets/images/icon.png")} // Replace with your chosen artistic image
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  borderRadius: getImageSize() / 2,
                }}
                resizeMode="cover" // Changed to cover for better image display
                className="z-10"
              />

              {/* Artistic overlay border */}
              <View
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(255, 255, 255, 0.4)",
                }}
              />
            </Animated.View>
          </Animated.View>

          {/* Enhanced App Title and Tagline */}
          <Animated.View
            entering={FadeInUp.duration(1000).delay(300)}
            className="items-center mb-4"
          >
            <Text
              className="text-center italic font-bold mb-3 text-gray-800 dark:text-white"
              style={{
                letterSpacing: 1.2,
                fontSize: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
                lineHeight: isSmallScreen ? 26 : isMediumScreen ? 28 : 30,
                textShadowColor:
                  colorScheme === "dark"
                    ? "rgba(114, 183, 233, 0.3)"
                    : "rgba(0, 0, 0, 0.1)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Where Art Meets Soul
            </Text>

            <LinearGradient
              colors={[
                colorScheme === "dark"
                  ? "rgba(30, 30, 30, 0.8)"
                  : "rgba(248, 250, 252, 0.9)",
                colorScheme === "dark"
                  ? "rgba(40, 40, 40, 0.9)"
                  : "rgba(241, 245, 249, 0.95)",
              ]}
              className="rounded-full border"
              style={{
                paddingHorizontal: isSmallScreen ? 18 : 26,
                paddingVertical: isSmallScreen ? 10 : 14,
                borderColor:
                  colorScheme === "dark"
                    ? "rgba(114, 183, 233, 0.2)"
                    : "rgba(203, 213, 225, 0.5)",
                borderWidth: 1,
              }}
            >
              <Text
                className="font-semibold text-center text-gray-600 dark:text-gray-300"
                style={{
                  fontSize: isSmallScreen ? 12 : 14,
                  letterSpacing: 0.5,
                }}
              >
                ✨ Discover • Create • Remember ✨
              </Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Enhanced Features Grid */}
        <Animated.View
          entering={FadeInDown.duration(1000).delay(600)}
          style={{ marginBottom: getVerticalSpacing().features }}
        >
          <Text
            className="font-bold text-center mb-6 tracking-wide text-gray-700 dark:text-gray-300"
            style={{
              fontSize: isSmallScreen ? 17 : 19,
              letterSpacing: 1,
            }}
          >
            Explore Features
          </Text>
          <View
            className="flex-row flex-wrap justify-center"
            style={{ gap: isSmallScreen ? 14 : 18 }}
          >
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                entering={FadeInUp.duration(800).delay(index * 150 + 800)}
              >
                <TouchableOpacity
                  className="items-center justify-center rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                  style={{
                    width: (width - 80) / 2,
                    height: isSmallScreen ? 130 : isMediumScreen ? 145 : 160,
                    paddingHorizontal: 14,
                    paddingVertical: isSmallScreen ? 14 : 18,
                    shadowOffset: { width: 0, height: isSmallScreen ? 8 : 12 },
                    shadowOpacity: 0.15,
                    shadowRadius: isSmallScreen ? 12 : 20,
                    elevation: isSmallScreen ? 6 : 10,
                    shadowColor: colorScheme === "dark" ? "#000" : "#666",
                  }}
                  onPress={() => onFeaturePress?.(feature.title.toLowerCase())}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={feature.gradient}
                    className="rounded-full justify-center items-center mb-3"
                    style={{
                      width: isSmallScreen ? 44 : 52,
                      height: isSmallScreen ? 44 : 52,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      elevation: 6,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text
                      className="text-white"
                      style={{ fontSize: isSmallScreen ? 18 : 22 }}
                    >
                      {feature.icon}
                    </Text>
                  </LinearGradient>
                  <Text
                    className="font-bold text-center mb-1 text-gray-900 dark:text-white"
                    style={{
                      fontSize: isSmallScreen ? 14 : 16,
                      lineHeight: isSmallScreen ? 17 : 19,
                    }}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    className="font-medium text-center text-gray-500 dark:text-gray-400"
                    style={{
                      fontSize: isSmallScreen ? 11 : 13,
                      lineHeight: isSmallScreen ? 13 : 15,
                    }}
                  >
                    {feature.description}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Get Started Button */}
        <Animated.View
          entering={FadeInUp.duration(1000).delay(1400)}
          className="mt-auto"
        >
          <TouchableOpacity
            className="rounded-3xl overflow-hidden mb-4"
            style={{
              width: width - 48,
              height: isSmallScreen ? 58 : 68,
              shadowOffset: { width: 0, height: isSmallScreen ? 10 : 15 },
              shadowOpacity: 0.35,
              shadowRadius: isSmallScreen ? 15 : 25,
              elevation: isSmallScreen ? 10 : 15,
              shadowColor: "#72b7e9",
            }}
            onPress={() => router.push("/(auth)/sign-in")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#72b7e9", "#4a9ce8", "#FF6B6B", "#96CEB4"]}
              className="flex-1 flex-row justify-center items-center"
              style={{ gap: isSmallScreen ? 12 : 18 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                className="text-white font-bold tracking-wider"
                style={{
                  fontSize: isSmallScreen ? 17 : 21,
                  letterSpacing: 1,
                }}
              >
                Get Started
              </Text>
            
                <Text
                  className="text-white font-bold"
                  style={{ fontSize: isSmallScreen ? 16 : 20 }}
                >
                  →
                </Text>
              
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text
              className="text-center font-medium text-gray-500 dark:text-gray-400"
              style={{ fontSize: isSmallScreen ? 14 : 16 }}
            >
              Already have an account?{" "}
              <Text className="font-bold text-blue-500 underline">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
