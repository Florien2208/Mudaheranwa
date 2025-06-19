import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Haptics,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

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

// Enhanced MenuItem component
const MenuItem = React.memo(
  ({
    icon,
    title,
    subtitle,
    onPress,
    colorScheme,
    rightContent,
    isLast,
    disabled = false,
    iconColor = COLORS.primary,
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      if (disabled) return;
      Haptics?.selectionAsync?.();

      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.98,
          ...ANIMATION_CONFIG.spring,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          ...ANIMATION_CONFIG.timing,
        }),
      ]).start();
    }, [disabled, scaleValue, opacityValue]);

    const handlePressOut = useCallback(() => {
      if (disabled) return;

      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          ...ANIMATION_CONFIG.spring,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          ...ANIMATION_CONFIG.timing,
        }),
      ]).start();
    }, [disabled, scaleValue, opacityValue]);

    const borderColor = Colors[colorScheme].border;
    const iconBackgroundColor = disabled
      ? Colors[colorScheme].secondaryText + "20"
      : iconColor;

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        }}
      >
        <Pressable
          className={`flex-row items-center p-4 ${
            !isLast ? "border-b border-gray-200/30" : ""
          } ${disabled ? "opacity-50" : ""}`}
          onPress={disabled ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityHint={
            disabled
              ? "This option is currently unavailable"
              : `Navigate to ${title}`
          }
          accessibilityState={{ disabled }}
        >
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-lg justify-center items-center mr-3"
              style={{ backgroundColor: iconBackgroundColor }}
            >
              <IconSymbol
                name={icon}
                size={20}
                color={disabled ? Colors[colorScheme].secondaryText : "#FFFFFF"}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-medium mb-0.5"
                style={{ color: COLORS.textPrimary }}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  className="text-sm opacity-70"
                  style={{ color: COLORS.textSecondary }}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row items-center">
            {rightContent || (
              <Text
                className="text-base"
                style={{ color: Colors[colorScheme].secondaryText }}
              >
                ›
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

MenuItem.displayName = "MenuItem";

// Enhanced ProfileSection component
const ProfileSection = React.memo(
  ({ user, isArtist, colorScheme, onEditPress, isDark, t }) => {
    const getInitials = useCallback((name) => {
      if (!name) return "👤";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }, []);

    const profileStats = useMemo(() => {
      if (!isArtist) return null;
      return [
        { label: t("profile.artworks"), value: "12" },
        { label: t("profile.followers"), value: "1.2K" },
        { label: t("profile.sales"), value: "24" },
      ];
    }, [isArtist, t]);

    return (
      <View className="items-center mb-6">
        <View className="relative mb-3">
          <View
            className="w-25 h-25 rounded-full justify-center items-center shadow-lg"
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
            {isArtist && (
              <View
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full justify-center items-center border-2 border-white"
                style={{ backgroundColor: COLORS.warning }}
              >
                <IconSymbol name="star.fill" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>

        <Text
          className="text-2xl font-bold mb-1"
          style={{
            color: isDark ? "#FFFFFF" : COLORS.textPrimary,
          }}
          numberOfLines={1}
        >
          {user?.name || user?.displayName || "User Name"}
        </Text>
        <Text
          className="text-base opacity-70"
          style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
          numberOfLines={1}
        >
          {user?.email || "user@example.com"}
        </Text>

        {isArtist && (
          <View
            className="flex-row items-center mt-2 px-3 py-1.5 rounded-2xl"
            style={{ backgroundColor: COLORS.warning }}
          >
            <IconSymbol name="paintbrush.fill" size={12} color="#FFFFFF" />
            <Text className="text-white text-xs font-semibold ml-1">
              {t("profile.verifiedArtist")}
            </Text>
          </View>
        )}

        {/* Artist Stats */}
        {profileStats && (
          <View
            className="flex-row justify-around py-4 mt-4 rounded-xl w-full"
            style={{ backgroundColor: COLORS.secondary }}
          >
            {profileStats.map((stat, index) => (
              <View key={stat.label} className="items-center">
                <Text
                  className="text-xl font-bold mb-0.5"
                  style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
                >
                  {stat.value}
                </Text>
                <Text
                  className="text-xs opacity-70"
                  style={{
                    color: isDark ? COLORS.textMuted : COLORS.textSecondary,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }
);

ProfileSection.displayName = "ProfileSection";

// MenuSection component
const MenuSection = ({ children, isDark }) => (
  <View
    className="rounded-xl mb-4 overflow-hidden"
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
          elevation: 3,
        },
      }),
    }}
  >
    {children}
  </View>
);

// Enhanced Language Modal
const LanguageModal = React.memo(
  ({
    visible,
    onClose,
    currentLanguage,
    onLanguageSelect,
    colorScheme,
    isDark,
    languages,
    t,
  }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;

    React.useEffect(() => {
      if (visible) {
        Animated.spring(slideAnim, {
          toValue: 0,
          ...ANIMATION_CONFIG.spring,
        }).start();
      } else {
        Animated.spring(slideAnim, {
          toValue: 300,
          ...ANIMATION_CONFIG.spring,
        }).start();
      }
    }, [visible, slideAnim]);

    const handleBackdropPress = useCallback(() => {
      onClose();
    }, [onClose]);

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: COLORS.overlay }}
          onPress={handleBackdropPress}
        >
          <Animated.View
            className="w-11/12 max-h-3/4 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
              transform: [{ translateY: slideAnim }],
              ...Platform.select({
                ios: {
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                },
                android: {
                  elevation: 8,
                },
              }),
            }}
            onStartShouldSetResponder={() => true}
          >
            <View
              className="flex-row justify-between items-center px-6 py-5 border-b"
              style={{ borderBottomColor: Colors[colorScheme].border + "40" }}
            >
              <Text
                className="text-xl font-bold"
                style={{ color: COLORS.primary }}
              >
                {t("profile.selectLanguage")}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-1"
                accessibilityLabel="Close language selection"
                accessibilityRole="button"
              >
                <IconSymbol
                  name="xmark.circle.fill"
                  size={28}
                  color={Colors[colorScheme].secondaryText}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            >
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  className={`flex-row items-center justify-between py-4 px-6 ${
                    index !== languages.length - 1 ? "border-b" : ""
                  } ${currentLanguage === language.name ? "bg-blue-50" : ""}`}
                  style={{
                    borderBottomColor: Colors[colorScheme].border + "40",
                    backgroundColor:
                      currentLanguage === language.name
                        ? COLORS.primary + "15"
                        : "transparent",
                  }}
                  onPress={() => onLanguageSelect(language)}
                  accessibilityLabel={`Select ${language.name} language`}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: currentLanguage === language.name,
                  }}
                >
                  <View className="flex-1">
                    <Text
                      className="text-lg font-medium"
                      style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
                    >
                      {language.name}
                    </Text>
                    {language.nativeName !== language.name && (
                      <Text
                        className="text-sm opacity-70"
                        style={{
                          color: isDark
                            ? COLORS.textMuted
                            : COLORS.textSecondary,
                        }}
                      >
                        {language.nativeName}
                      </Text>
                    )}
                  </View>
                  {currentLanguage === language.name && (
                    <View
                      className="w-6 h-6 rounded-xl justify-center items-center"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }
);

const ThemeToggle = React.memo(({ isDark, onToggle, colorScheme, t }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Haptics?.selectionAsync?.();

    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        ...ANIMATION_CONFIG.spring,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        ...ANIMATION_CONFIG.spring,
      }),
    ]).start();

    onToggle();
  }, [onToggle, scaleValue]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        className="rounded-xl mb-4 overflow-hidden"
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
              elevation: 3,
            },
          }),
        }}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
        accessibilityRole="button"
      >
        <View
          className="flex-row items-center p-4"
          style={{ borderColor: Colors[colorScheme].border + "30" }}
        >
          <View
            className="w-10 h-10 rounded-lg justify-center items-center mr-3"
            style={{ backgroundColor: COLORS.primary }}
          >
            <IconSymbol
              name={isDark ? "sun.max.fill" : "moon.fill"}
              size={18}
              color="#FFFFFF"
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-medium mb-0.5"
              style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
            >
              {isDark ? t("profile.lightMode") : t("profile.darkMode")}
            </Text>
            <Text
              className="text-sm opacity-70"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              {isDark ? t("profile.switchToLight") : t("profile.switchToDark")}
            </Text>
          </View>
          <View
            className="w-11 h-6 rounded-xl justify-center relative"
            style={{
              backgroundColor: isDark
                ? COLORS.primary
                : Colors[colorScheme].border + "40",
            }}
          >
            <Animated.View
              className="w-5 h-5 rounded-full absolute shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                transform: [{ translateX: isDark ? 20 : 2 }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

ThemeToggle.displayName = "ThemeToggle";
LanguageModal.displayName = "LanguageModal";

// Main Component
export default function AccountScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const { user, logout, refreshUser } = useAuthStore();
  const isArtist = user?.isArtist;
  const insets = useSafeAreaInsets();
  const [userPreferredTheme, setUserPreferredTheme] = useState(null);

  // i18n hooks
  const { t } = useTranslation();
  const {
    currentLanguage,
    currentLanguageName,
    languages,
    changeLanguage,
    isLoading: languageLoading,
  } = useLanguage();

  // State
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDark = colorScheme === "dark";

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          await refreshUser?.();
        } catch (error) {
          console.warn("Failed to refresh user data:", error);
        }
      };

      refreshData();
      return () => {};
    }, [refreshUser])
  );

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshUser?.();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.warn("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUser]);

  // Enhanced logout with translations
  const handleLogout = useCallback(async () => {
    Alert.alert(t("profile.signOut"), t("profile.signOutConfirm"), [
      {
        text: t("profile.cancel"),
        style: "cancel",
      },
      {
        text: t("profile.signOut"),
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            Haptics?.notificationAsync?.(
              Haptics.NotificationFeedbackType.Success
            );
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert(
              t("common.error"),
              "Failed to sign out. Please try again."
            );
            Haptics?.notificationAsync?.(
              Haptics.NotificationFeedbackType.Error
            );
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }, [logout, t]);

  const handleThemeToggle = useCallback(() => {
    const newTheme = isDark ? "light" : "dark";
    setUserPreferredTheme(newTheme);
    // Save preference to AsyncStorage
    // AsyncStorage.setItem('userTheme', newTheme);
  }, [isDark]);

  const navigateTo = useCallback((screenName) => {
    Haptics?.selectionAsync?.();
    router.push(`/Account/${screenName}`);
  }, []);

  const handleLanguageSelect = useCallback(
    async (language) => {
      try {
        await changeLanguage(language.code);
        setLanguageModalVisible(false);
        Haptics?.selectionAsync?.();
      } catch (error) {
        console.error("Failed to change language:", error);
      }
    },
    [changeLanguage]
  );

  // Memoized menu sections with translations
  const menuSections = useMemo(() => {
    const accountItems = [
      {
        title: t("profile.editProfile"),
        subtitle: t("profile.updateInfo"),
        icon: "person.crop.circle",
        onPress: () => navigateTo("profile"),
        iconColor: COLORS.primary,
      },
      {
        title: t("profile.privacySettings"),
        subtitle: t("profile.controlPrivacy"),
        icon: "lock.fill",
        onPress: () => navigateTo("PrivacySettings"),
        iconColor: COLORS.purple,
      },
      {
        title: t("profile.notificationSettings"),
        subtitle: t("profile.customizeNotifications"),
        icon: "bell.fill",
        onPress: () => navigateTo("NotificationSettings"),
        iconColor: COLORS.orange,
      },
    ];

    const appItems = [
      {
        title: t("profile.paymentMethods"),
        subtitle: t("profile.manageCards"),
        icon: "creditcard",
        onPress: () => navigateTo("PaymentMethods"),
        iconColor: COLORS.success,
      },
      {
        title: t("profile.subscription"),
        subtitle: t("profile.managePlan"),
        icon: "crown.fill",
        onPress: () => navigateTo("subscription"),
        iconColor: COLORS.warning,
      },
      {
        title: t("profile.language"),
        subtitle: t("profile.currentlySet", { language: currentLanguageName }),
        icon: "globe",
        onPress: () => setLanguageModalVisible(true),
        iconColor: COLORS.primary,
        rightContent: (
          <View className="flex-row items-center">
            <Text
              className="text-base mr-2"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              {currentLanguageName}
            </Text>
            <Text
              className="text-base"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              ›
            </Text>
          </View>
        ),
      },
    ];

    const supportItems = [
      {
        title: t("profile.helpSupport"),
        subtitle: t("profile.getHelp"),
        icon: "questionmark.circle",
        onPress: () => navigateTo("helpCenter"),
        iconColor: COLORS.accent,
      },
      {
        title: t("profile.about"),
        subtitle: t("profile.appInfo"),
        icon: "info.circle",
        onPress: () => navigateTo("about"),
        iconColor: COLORS.primaryDark,
      },
    ];

    // Add artist-specific items if user is an artist
    if (isArtist) {
      appItems.splice(1, 0, {
        title: "Payout Settings", // Add this to translations
        subtitle: "Manage your earnings and payouts", // Add this to translations
        icon: "dollarsign.circle",
        onPress: () => navigateTo("PayoutSettings"),
        iconColor: COLORS.success,
      });
    }

    return [
      { title: "Account", items: accountItems },
      { title: "App", items: appItems },
      { title: "Support", items: supportItems },
    ];
  }, [isArtist, currentLanguageName, t, navigateTo, isDark]);

  return (
    <>
      <SafeAreaView className="flex-1">
        <StatusBar style={isDark ? "light" : "dark"} />

        <SafeAreaView className="flex-1">
          <ScrollView
            className="p-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          >
            {/* Profile Section */}
            <ProfileSection
              user={user}
              isArtist={isArtist}
              colorScheme={colorScheme}
              onEditPress={() => navigateTo("EditProfile")}
              isDark={isDark}
              t={t}
            />

            <ThemeToggle
              isDark={isDark}
              onToggle={handleThemeToggle}
              colorScheme={colorScheme}
              t={t}
            />

            {/* Menu Sections */}
            {menuSections.map((section, sectionIndex) => (
              <MenuSection key={section.title} isDark={isDark}>
                {section.items.map((item, index) => (
                  <MenuItem
                    key={`${section.title}-${index}`}
                    {...item}
                    colorScheme={colorScheme}
                    isLast={index === section.items.length - 1}
                  />
                ))}
              </MenuSection>
            ))}

            {/* Sign Out Button */}
            <TouchableOpacity
              className={`rounded-xl p-4 items-center mt-2 ${
                isLoggingOut ? "opacity-70" : ""
              }`}
              style={{ backgroundColor: COLORS.error }}
              onPress={handleLogout}
              disabled={isLoggingOut}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign out from account"
              accessibilityHint="Logs you out of your account"
              accessibilityState={{ disabled: isLoggingOut }}
            >
              <Text className="text-white text-base font-semibold">
                {isLoggingOut ? t("profile.signingOut") : t("profile.signOut")}
              </Text>
            </TouchableOpacity>

            <Text
              className="text-center text-sm mt-5 opacity-60"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              {t("profile.version")}
            </Text>

            <View className="h-14" />
          </ScrollView>
        </SafeAreaView>

        {/* Language Selection Modal */}
        <LanguageModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          currentLanguage={currentLanguageName}
          onLanguageSelect={handleLanguageSelect}
          colorScheme={colorScheme}
          isDark={isDark}
          languages={languages}
          t={t}
        />
      </SafeAreaView>
    </>
  );
}
