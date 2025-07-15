import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

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

  const getVerticalSpacing = () => {
    if (isSmallScreen)
      return { section: 25, icon: 35, features: 30, title: 20 };
    if (isMediumScreen)
      return { section: 35, icon: 45, features: 40, title: 25 };
    return { section: 45, icon: 55, features: 50, title: 30 };
  };

  // Get responsive icon size
  const getIconSize = () => {
    if (isSmallScreen) return 100;
    if (isMediumScreen) return 120;
    return 140;
  };

  useEffect(() => {
    // Subtle pulse animation
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 3000 }),
      -1,
      true
    );

    // Floating animation
    floatValue.value = withRepeat(withTiming(1, { duration: 4500 }), -1, true);

    // Very subtle rotation
    rotateValue.value = withRepeat(
      withTiming(360, { duration: 40000 }),
      -1,
      false
    );

    // Shimmer effect
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 2800 }),
      -1,
      true
    );

    // Initial scale animation with bounce
    scaleValue.value = withDelay(
      300,
      withSpring(1, { damping: 15, stiffness: 100 })
    );
  }, []);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Scrollable Content Container */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 30,
          paddingBottom: Math.max(insets.bottom, 30),
          paddingHorizontal: 24,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section - Better positioned and sized */}
        <View className="flex-1 justify-center items-center">
          <Animated.View
            entering={FadeInUp.duration(1200).springify()}
            className="items-center"
            style={{ marginBottom: getVerticalSpacing().icon }}
          >
            {/* Icon Container */}
            <Animated.View
              style={[
                {
                  transform: [
                    { scale: scaleValue },
                    { rotate: `${rotateValue.value}deg` },
                  ],
                },
              ]}
              className="mb-6"
            >
              <Animated.View
                style={[
                  {
                    transform: [
                      { scale: pulseValue },
                      { translateY: floatValue.value * 5 },
                    ],
                  },
                ]}
              >
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={{
                    width: getIconSize(),
                    height: getIconSize(),
                  }}
                  resizeMode="contain"
                />
              </Animated.View>
            </Animated.View>

            {/* App Title and Tagline */}
            <Animated.View
              entering={FadeInUp.duration(1000).delay(800)}
              className="items-center"
              style={{ marginBottom: getVerticalSpacing().title }}
            >
              <Text
                className="text-gray-800 dark:text-white font-bold text-center mb-3"
                style={{
                  fontSize: isSmallScreen ? 28 : 34,
                  letterSpacing: 0.5,
                }}
              >
                Welcome to Your App
              </Text>
              <Text
                className="text-gray-600 dark:text-gray-300 text-center leading-relaxed"
                style={{
                  fontSize: isSmallScreen ? 16 : 18,
                  maxWidth: width - 80,
                  lineHeight: isSmallScreen ? 24 : 28,
                }}
              >
                Discover amazing features and get started on your journey with
                us
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Feature highlights or additional content can go here */}
          <Animated.View
            entering={FadeInUp.duration(1000).delay(1200)}
            className="flex-row justify-center items-center space-x-8 mb-8"
          >
            {/* Feature icons or highlights */}
            <View className="items-center">
              <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full justify-center items-center mb-2">
                <Text className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                  ✨
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Easy
              </Text>
            </View>

            <View className="items-center">
              <View className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full justify-center items-center mb-2">
                <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                  🚀
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Fast
              </Text>
            </View>

            <View className="items-center">
              <View className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full justify-center items-center mb-2">
                <Text className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                  🎯
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Smart
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Get Started Button - Single color, better positioning */}
        <Animated.View
          entering={FadeInUp.duration(1000).delay(1400)}
          className="mb-4"
        >
          <TouchableOpacity
            className="rounded-2xl overflow-hidden"
            style={{
              width: width - 48,
              height: isSmallScreen ? 56 : 64,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              shadowColor: "#4a9ce8",
            }}
            onPress={() => router.push("/(auth)/sign-in")}
            activeOpacity={0.85}
          >
            {/* Single color gradient for consistency */}
            <LinearGradient
              colors={["#4a9ce8", "#3b82f6"]}
              className="flex-1 flex-row justify-center items-center"
              style={{ gap: 12 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                className="text-white font-semibold tracking-wide"
                style={{
                  fontSize: isSmallScreen ? 16 : 18,
                  letterSpacing: 0.5,
                }}
              >
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
