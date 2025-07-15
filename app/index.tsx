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


  // Get responsive icon size
  const getIconSize = () => {
    if (isSmallScreen) return 100;
    if (isMediumScreen) return 120;
    return 140;
  };

  

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
          
            className="items-center"
           
          >
            {/* Icon Container */}
            <Animated.View
           
              className="mb-6"
            >
              <Animated.View
             
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
             
              elevation: 8,
             
            }}
            onPress={() => router.push("/(auth)/sign-in")}
            activeOpacity={0.85}
          >
            {/* Single color gradient for consistency */}
            <LinearGradient
              colors={["#000", "#000"]}
              className="flex-1 flex-row justify-center items-center"
              style={{ gap: 12 }}
             
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
