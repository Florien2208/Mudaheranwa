import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_BASE_URL } from "@/constants";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Haptics,
  Image,
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

// API Service for profile updates
const profileAPI = {
  updateProfile: async (data, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/auth/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  },

  uploadProfilePicture: async (imageUri, token) => {
    try {
      const formData = new FormData();

      // Ensure proper FormData construction for React Native
      const fileExtension = imageUri.split(".").pop() || "jpg";
      const mimeType = `image/${fileExtension}`;

      formData.append("profilePicture", {
        uri: imageUri,
        type: mimeType,
        name: `profile.${fileExtension}`,
      } as any);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/profile/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Profile picture upload error:", error);
      throw error;
    }
  },

  removeProfilePicture: async (token) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/user/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Profile picture removal error:", error);
      throw error;
    }
  },
};

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
    error,
    required = false,
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
        error
          ? COLORS.error
          : isDark
            ? COLORS.cardDark
            : Colors[colorScheme].border + "40",
        error ? COLORS.error : COLORS.primary,
      ],
    });

    return (
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <Text
            className="text-sm font-medium"
            style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
          >
            {label}
          </Text>
          {required && <Text className="text-red-500 ml-1 text-sm">*</Text>}
          {!editable && (
            <View className="ml-2 px-2 py-1 bg-gray-200 rounded-md">
              <Text className="text-xs text-gray-600">Read only</Text>
            </View>
          )}
        </View>
        <Animated.View
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            borderWidth: 1.5,
            borderColor: borderColor,
            opacity: editable ? 1 : 0.7,
            shadowColor: COLORS.shadowColor,
            ...Platform.select({
              ios: {
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 3,
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
                  color={
                    error
                      ? COLORS.error
                      : isFocused
                        ? COLORS.primary
                        : isDark
                          ? COLORS.textMuted
                          : COLORS.textSecondary
                  }
                />
              </View>
            )}
            <TextInput
              className={`flex-1 p-4 text-base ${multiline ? "h-24" : "h-14"}`}
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
        {error && (
          <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
        )}
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

// Enhanced Profile Photo Section
const ProfilePhotoSection = React.memo(
  ({
    user,
    isDark,
    onPhotoPress,
    profilePicture,
    isUploadingPhoto,
    imageKey,
  }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;

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

    const handleImageLoad = useCallback(() => {
      setImageLoading(false);
      setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
      setImageLoading(false);
      setImageError(true);
    }, []);

    // Reset image loading state when profilePicture changes
    React.useEffect(() => {
      if (profilePicture) {
        setImageLoading(true);
        setImageError(false);
      }
    }, [profilePicture, imageKey]);

    // Pulse animation for camera icon
    React.useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, [pulseValue]);

    const currentProfilePicture = profilePicture || user?.profilePicture;

    return (
      <View className="items-center mb-8">
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Pressable
            className="relative"
            onPress={onPhotoPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessible={true}
            accessibilityLabel="Change profile photo"
            accessibilityRole="button"
            disabled={isUploadingPhoto}
          >
            <View
              className="w-32 h-32 rounded-full justify-center items-center shadow-lg overflow-hidden"
              style={{
                backgroundColor:
                  currentProfilePicture && !imageError
                    ? "transparent"
                    : COLORS.primary,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {currentProfilePicture && !imageError ? (
                <>
                  {imageLoading && (
                    <View className="absolute inset-0 justify-center items-center">
                      <IconSymbol
                        name="person.crop.circle.fill"
                        size={80}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                  <Image
                    key={`${currentProfilePicture}_${imageKey}`} // Force re-render with unique key
                    source={{ uri: currentProfilePicture }}
                    style={{
                      width: 128,
                      height: 128,
                      borderRadius: 64,
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    resizeMode="cover"
                  />
                </>
              ) : (
                <Text className="text-5xl font-bold text-white">
                  {getInitials(user?.displayName || user?.name)}
                </Text>
              )}

              {isUploadingPhoto && (
                <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-50 rounded-full">
                  <IconSymbol
                    name="arrow.clockwise"
                    size={30}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </View>
            <Animated.View
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full justify-center items-center border-4 border-white"
              style={{
                backgroundColor: isUploadingPhoto
                  ? COLORS.textMuted
                  : COLORS.primary,
                transform: [{ scale: pulseValue }],
              }}
            >
              <IconSymbol
                name={isUploadingPhoto ? "arrow.clockwise" : "camera.fill"}
                size={20}
                color="#FFFFFF"
              />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <Text
          className="text-sm mt-3 opacity-70 text-center"
          style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
        >
          {isUploadingPhoto
            ? "Uploading photo..."
            : "Tap to change your profile photo"}
        </Text>
      </View>
    );
  }
);

ProfilePhotoSection.displayName = "ProfilePhotoSection";

// Save Button Component
const SaveButton = React.memo(({ onPress, isLoading, hasChanges, isDark }) => {
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    if (!hasChanges || isLoading) return;

    Animated.sequence([
      Animated.timing(buttonOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  }, [hasChanges, isLoading, onPress, buttonOpacity]);

  return (
    <Animated.View style={{ opacity: buttonOpacity }}>
      <TouchableOpacity
        className={`px-6 py-3 rounded-xl ${
          !hasChanges || isLoading ? "opacity-50" : ""
        }`}
        style={{
          backgroundColor: hasChanges ? COLORS.primary : COLORS.textMuted,
          shadowColor: COLORS.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={handlePress}
        disabled={!hasChanges || isLoading}
        accessible={true}
        accessibilityLabel="Save changes"
        accessibilityRole="button"
      >
        <Text className="text-white font-semibold text-base">
          {isLoading ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

SaveButton.displayName = "SaveButton";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, updateProfile, token } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasProfilePictureChanged, setHasProfilePictureChanged] =
    useState(false);
  const [errors, setErrors] = useState({});
  const [imageKey, setImageKey] = useState(Date.now()); // Force re-render key

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setHasChanges(true);
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  const handlePhotoPress = useCallback(() => {
    if (isUploadingPhoto) return;

    const options = [
      {
        text: "Take Photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission needed",
              "Camera permission is required to take photos."
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            await handleProfilePictureUpload(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission needed",
              "Photo library permission is required to select photos."
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            await handleProfilePictureUpload(result.assets[0].uri);
          }
        },
      },
      {
        text: "Remove Photo",
        style: "destructive",
        onPress: async () => {
          await handleProfilePictureRemove();
        },
      },
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert(
      "Change Profile Photo",
      "How would you like to update your profile photo?",
      options
    );
  }, [isUploadingPhoto]);

  const handleProfilePictureUpload = useCallback(
    async (imageUri) => {
      setIsUploadingPhoto(true);
      console.log("Starting upload for:", imageUri);

      try {
        const response = await profileAPI.uploadProfilePicture(imageUri, token);
        console.log("Upload response:", response);

        const newProfilePictureUrl = response.profilePictureUrl;
        console.log("New profile picture URL:", newProfilePictureUrl);

        // Add cache-busting parameter to force image refresh
        const cacheBustedUrl = `${newProfilePictureUrl}?t=${Date.now()}`;
        console.log("Cache-busted URL:", cacheBustedUrl);

        // Update local state
        setProfilePicture(cacheBustedUrl);
        setImageKey(Date.now()); // Force component re-render
        setHasProfilePictureChanged(true);
        console.log("Local state updated");

        // Update user profile in store immediately
        await updateProfile?.({ profilePicture: cacheBustedUrl });
        console.log("Store updated");

        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (error) {
        console.error("Profile picture upload failed:", error);
        console.error("Error response:", error.response?.data);
        Alert.alert(
          "Error",
          "Failed to upload profile picture. Please try again."
        );
        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsUploadingPhoto(false);
      }
    },
    [token, updateProfile]
  );

  const handleProfilePictureRemove = useCallback(async () => {
    setIsUploadingPhoto(true);
    try {
      await profileAPI.removeProfilePicture(token);

      // Update local state
      setProfilePicture(null);
      setImageKey(Date.now()); // Force component re-render
      setHasProfilePictureChanged(true);

      // Update user profile in store immediately
      await updateProfile?.({ profilePicture: null });

      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Profile picture removed successfully!");
    } catch (error) {
      console.error("Profile picture removal failed:", error);
      Alert.alert(
        "Error",
        "Failed to remove profile picture. Please try again."
      );
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [token, updateProfile]);

  const handleSave = useCallback(async () => {
    if (!hasChanges || !validateForm()) return;

    setIsLoading(true);
    try {
      // Only send data that can be updated (excluding email)
      const updateData = {
        name: formData.name,
        phone: formData.phone,
      };

      await profileAPI.updateProfile(updateData, token);

      // Update local store
      await updateProfile?.({
        ...updateData,
        profilePicture: profilePicture,
      });

      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
      setHasChanges(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      Alert.alert("Error", errorMessage);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    profilePicture,
    hasChanges,
    validateForm,
    updateProfile,
    token,
  ]);

  const handleBack = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. What would you like to do?",
        [
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => router.back(),
          },
          {
            text: "Save & Exit",
            onPress: async () => {
              if (validateForm()) {
                await handleSave();
                router.back();
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      router.back();
    }
  }, [hasChanges, handleSave, validateForm]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Enhanced Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{
          borderBottomColor: Colors[colorScheme].border + "30",
          paddingTop: insets.top + 12,
          backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
          shadowColor: COLORS.shadowColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          className="p-2 rounded-full"
          style={{ backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
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

        <SaveButton
          onPress={handleSave}
          isLoading={isLoading}
          hasChanges={hasChanges}
          isDark={isDark}
        />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 24 }}
        >
          {/* Profile Photo */}
          <ProfilePhotoSection
            user={user}
            isDark={isDark}
            onPhotoPress={handlePhotoPress}
            profilePicture={profilePicture}
            isUploadingPhoto={isUploadingPhoto}
            imageKey={imageKey}
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
            required={true}
            error={errors.name}
          />

          <InputField
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Enter your email address"
            isDark={isDark}
            colorScheme={colorScheme}
            leftIcon="envelope.fill"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            required={true}
            error={errors.email}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
