import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Haptics,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

// Constants
const COLORS = {
  primary: "#4A90E2",
  primaryLight: "#6BA6F2",
  primaryDark: "#2C5282",
  secondary: "#E2F4FF",
  accent: "#FF6B6B",
  success: "#4ECDC4",
  warning: "#FFD93D",
  error: "#FF6B6B",
  purple: "#9F7AEA",
  orange: "#FF8C42",
  textPrimary: "#1A202C",
  textSecondary: "#4A5568",
  textAccent: "#2D3748",
  textMuted: "#718096",
  textBlue: "#4A90E2",
  textPurple: "#805AD5",
  textTeal: "#319795",
  lightBg: "#f8fbff",
  darkBg: "#0a1a24",
  cardLight: "#ffffff",
  cardDark: "#1a2832",
  shadowColor: "#000",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

const ANIMATION_CONFIG = {
  spring: {
    useNativeDriver: true,
    speed: 20,
    bounciness: 4,
  },
  timing: {
    useNativeDriver: true,
    duration: 200,
  },
} as const;

// Enhanced Input Field Component
const InputField = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    isDark,
    colorScheme,
    multiline = false,
    maxLength,
    keyboardType = "default",
    autoCapitalize = "sentences",
    editable = true,
    leftIcon,
    rightIcon,
    onRightIconPress,
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [focusAnim]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [focusAnim]);

    const borderColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        isDark ? COLORS.cardDark : Colors[colorScheme].border + "40",
        COLORS.primary,
      ],
    });

    return (
      <View className="mb-4">
        <Text
          className="text-sm font-medium mb-2"
          style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
        >
          {label}
        </Text>
        <Animated.View
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            borderWidth: 1,
            borderColor: borderColor,
            shadowColor: COLORS.shadowColor,
            ...Platform.select({
              ios: {
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              },
              android: {
                elevation: 2,
              },
            }),
          }}
        >
          <View className="flex-row items-center">
            {leftIcon && (
              <View className="pl-4">
                <IconSymbol
                  name={leftIcon}
                  size={20}
                  color={isDark ? COLORS.textMuted : COLORS.textSecondary}
                />
              </View>
            )}
            <TextInput
              className={`flex-1 p-4 text-base ${multiline ? "h-24" : "h-12"}`}
              style={{
                color: isDark ? "#FFFFFF" : COLORS.textPrimary,
                textAlignVertical: multiline ? "top" : "center",
              }}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={
                isDark ? COLORS.textMuted : COLORS.textSecondary
              }
              multiline={multiline}
              maxLength={maxLength}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              editable={editable}
              onFocus={handleFocus}
              onBlur={handleBlur}
              accessible={true}
              accessibilityLabel={label}
            />
            {rightIcon && (
              <TouchableOpacity className="pr-4" onPress={onRightIconPress}>
                <IconSymbol
                  name={rightIcon}
                  size={20}
                  color={isDark ? COLORS.textMuted : COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        {maxLength && (
          <Text
            className="text-xs mt-1 text-right"
            style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
          >
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
    );
  }
);

InputField.displayName = "InputField";

// Profile Photo Section
const ProfilePhotoSection = React.memo(({ user, isDark, onPhotoPress }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const getInitials = useCallback((name) => {
    if (!name) return "👤";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  return (
    <View className="items-center mb-6">
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Pressable
          className="relative"
          onPress={onPhotoPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessible={true}
          accessibilityLabel="Change profile photo"
          accessibilityRole="button"
        >
          <View
            className="w-28 h-28 rounded-full justify-center items-center shadow-lg"
            style={{
              backgroundColor: COLORS.primary,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-4xl font-bold text-white">
              {getInitials(user?.displayName || user?.name)}
            </Text>
          </View>
          <View
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full justify-center items-center border-2 border-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            <IconSymbol name="camera.fill" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
      </Animated.View>
      <Text
        className="text-sm mt-2 opacity-70"
        style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
      >
        Tap to change photo
      </Text>
    </View>
  );
});

ProfilePhotoSection.displayName = "ProfilePhotoSection";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, updateProfile } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || user?.displayName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    website: user?.website || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      await updateProfile?.(formData);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
      setHasChanges(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, hasChanges, updateProfile]);

  const handlePhotoPress = useCallback(() => {
    Alert.alert(
      "Change Photo",
      "Choose how you'd like to update your profile photo",
      [
        { text: "Camera", onPress: () => console.log("Open camera") },
        { text: "Photo Library", onPress: () => console.log("Open library") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, []);

  const handleBack = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save them before leaving?",
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
          { text: "Save", onPress: handleSave },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      router.back();
    }
  }, [hasChanges, handleSave]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        className="flex-row items-center justify-between p-4 border-b"
        style={{
          borderBottomColor: Colors[colorScheme].border + "40",
          paddingTop: insets.top + 16,
        }}
      >
        <TouchableOpacity
          className="p-1"
          onPress={handleBack}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconSymbol
            name="chevron.left"
            size={24}
            color={isDark ? "#FFFFFF" : COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text
          className="text-xl font-bold"
          style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
        >
          Edit Profile
        </Text>

        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${
            !hasChanges || isLoading ? "opacity-50" : ""
          }`}
          style={{ backgroundColor: COLORS.primary }}
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
          accessible={true}
          accessibilityLabel="Save changes"
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile Photo */}
          <ProfilePhotoSection
            user={user}
            isDark={isDark}
            onPhotoPress={handlePhotoPress}
          />

          {/* Form Fields */}
          <InputField
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="Enter your full name"
            isDark={isDark}
            colorScheme={colorScheme}
            leftIcon="person.fill"
            maxLength={50}
          />

          <InputField
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Enter your email"
            isDark={isDark}
            colorScheme={colorScheme}
            leftIcon="envelope.fill"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false} // Usually email is not editable
          />

          <InputField
            label="Bio"
            value={formData.bio}
            onChangeText={(value) => handleInputChange("bio", value)}
            placeholder="Tell us about yourself..."
            isDark={isDark}
            colorScheme={colorScheme}
            leftIcon="text.bubble.fill"
            multiline={true}
            maxLength={200}
          />

          <InputField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            placeholder="Enter your phone number"
            isDark={isDark}
            colorScheme={colorScheme}
            leftIcon="phone.fill"
            keyboardType="phone-pad"
          />

          <InputField
            label="Website"
            value={formData.website}
            onChangeText={(value) => handleInputChange("website", value)}
            placeholder="https://your-website.com"
            isDark={isDark}
            colorScheme={colorScheme}
            leftIcon="globe"
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Additional Options */}
          <View
            className="rounded-xl p-4 mt-4"
            style={{
              backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
              shadowColor: COLORS.shadowColor,
              ...Platform.select({
                ios: {
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                },
                android: {
                  elevation: 2,
                },
              }),
            }}
          >
            <Text
              className="text-base font-semibold mb-3"
              style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
            >
              Privacy Settings
            </Text>

            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => router.push("/Account/PrivacySettings")}
            >
              <View className="flex-row items-center">
                <IconSymbol name="lock.fill" size={20} color={COLORS.primary} />
                <Text
                  className="text-base ml-3"
                  style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
                >
                  Profile Visibility
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={isDark ? COLORS.textMuted : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
