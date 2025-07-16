import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLanguage } from "@/hooks/useLanguage";
import useAuthStore from "@/store/useAuthStore";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Haptics,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Black and White Color Palette
const COLORS = {
  primary: "#000000",
  primaryLight: "#333333",
  primaryDark: "#000000",
  secondary: "#FFFFFF",
  accent: "#000000",
  success: "#000000",
  warning: "#000000",
  error: "#000000",
  purple: "#000000",
  orange: "#000000",
  pink: "#000000",
  emerald: "#000000",
  indigo: "#000000",
  textPrimary: "#000000",
  textSecondary: "#333333",
  textTertiary: "#666666",
  textMuted: "#999999",
  lightBg: "#FFFFFF",
  darkBg: "#000000",
  cardLight: "#FFFFFF",
  cardDark: "#1A1A1A",
  borderLight: "#E0E0E0",
  borderDark: "#333333",
  shadowColor: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

const ANIMATION_CONFIG = {
  spring: {
    useNativeDriver: true,
    tension: 300,
    friction: 20,
  },
  timing: {
    useNativeDriver: true,
    duration: 250,
  },
  bounce: {
    useNativeDriver: true,
    speed: 12,
    bounciness: 8,
  },
} as const;

// Enhanced MenuItem component with black and white styling
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
    badge,
    showChevron = true,
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const shadowValue = useRef(new Animated.Value(0)).current;

    const handlePressIn = useCallback(() => {
      if (disabled) return;
      Haptics?.selectionAsync?.();

      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.97,
          ...ANIMATION_CONFIG.spring,
        }),
        Animated.timing(shadowValue, {
          toValue: 1,
          ...ANIMATION_CONFIG.timing,
        }),
      ]).start();
    }, [disabled, scaleValue, shadowValue]);

    const handlePressOut = useCallback(() => {
      if (disabled) return;

      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          ...ANIMATION_CONFIG.spring,
        }),
        Animated.timing(shadowValue, {
          toValue: 0,
          ...ANIMATION_CONFIG.timing,
        }),
      ]).start();
    }, [disabled, scaleValue, shadowValue]);

    const isDark = colorScheme === "dark";
    const shadowOpacity = shadowValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.1],
    });

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          shadowOpacity,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          shadowColor: COLORS.shadowColor,
        }}
        className={`mx-1 mb-1 rounded-2xl overflow-hidden border ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
        }`}
      >
        <Pressable
          className={`flex-row items-center p-4 ${
            disabled ? "opacity-50" : ""
          }`}
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
          {/* Icon Container */}
          <View className="relative mr-4">
            <View
              className="w-12 h-12 rounded-2xl justify-center items-center border"
              style={{
                backgroundColor: disabled
                  ? isDark
                    ? COLORS.borderDark
                    : COLORS.borderLight
                  : isDark ? COLORS.secondary : COLORS.primary,
                borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
              }}
            >
              <IconSymbol
                name={icon}
                size={22}
                color={disabled ? COLORS.textMuted : isDark ? COLORS.primary : COLORS.secondary}
              />
            </View>
            {badge && (
              <View
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full justify-center items-center border-2"
                style={{
                  backgroundColor: COLORS.primary,
                  borderColor: isDark ? COLORS.cardDark : COLORS.cardLight,
                }}
              >
                <Text className="text-white text-xs font-bold">{badge}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="flex-1 justify-center">
            <Text
              className="text-base font-semibold mb-1"
              style={{
                color: isDark ? COLORS.secondary : COLORS.textPrimary,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className="text-sm"
                style={{
                  color: isDark ? COLORS.textMuted : COLORS.textSecondary,
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Content */}
          <View className="flex-row items-center">
            {rightContent ||
              (showChevron && (
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={isDark ? COLORS.textMuted : COLORS.textTertiary}
                />
              ))}
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

MenuItem.displayName = "MenuItem";

// Enhanced ProfileSection with black and white styling
const ProfileSection = React.memo(
  ({ user, isArtist, colorScheme, onEditPress, isDark, t }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const pulseValue = useRef(new Animated.Value(1)).current;

    // Pulse animation for loading state
    React.useEffect(() => {
      if (imageLoading) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseValue, {
              toValue: 0.8,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseValue, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
        pulse.start();
        return () => pulse.stop();
      }
    }, [imageLoading, pulseValue]);

    const profileStats = useMemo(() => {
      if (!isArtist) return null;
      return [
        { label: t("profile.artworks"), value: "12", icon: "paintbrush.fill" },
        { label: t("profile.followers"), value: "1.2K", icon: "person.2.fill" },
        {
          label: t("profile.sales"),
          value: "24",
          icon: "chart.line.uptrend.xyaxis",
        },
      ];
    }, [isArtist, t]);

    const handleImageLoad = useCallback(() => {
      setImageLoading(false);
      setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
      console.warn("Profile picture failed to load:", user?.profilePicture);
      setImageLoading(false);
      setImageError(true);
    }, [user?.profilePicture]);

    return (
      <View className="items-center mb-8">
        {/* Profile Picture */}
        <View className="relative mb-4">
          <Animated.View
            className="w-32 h-32 rounded-full justify-center items-center shadow-2xl overflow-hidden border-4"
            style={{
              backgroundColor:
                user?.profilePicture && !imageError
                  ? "transparent"
                  : COLORS.primary,
              borderColor: isDark ? COLORS.secondary : COLORS.primary,
           
            }}
          >
            {user?.profilePicture && !imageError ? (
              <>
                {imageLoading && (
                  <View className="absolute inset-0 justify-center items-center">
                    <IconSymbol
                      name="person.crop.circle.fill"
                      size={70}
                      color={isDark ? COLORS.primary : COLORS.secondary}
                    />
                  </View>
                )}
                <Image
                  source={{ uri: user.profilePicture }}
                  className="w-32 h-32 rounded-full"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  resizeMode="cover"
                />
              </>
            ) : (
              <IconSymbol
                name="person.crop.circle.fill"
                size={70}
                color={isDark ? COLORS.primary : COLORS.secondary}
              />
            )}

            {/* Artist Badge */}
            {isArtist && (
              <View
                className="absolute -top-1 -right-1 w-8 h-8 rounded-full justify-center items-center border-4"
                style={{
                  backgroundColor: COLORS.primary,
                  borderColor: isDark ? COLORS.cardDark : COLORS.cardLight,
                }}
              >
                <IconSymbol name="star.fill" size={14} color={COLORS.secondary} />
              </View>
            )}

            {/* Edit Button */}
            <TouchableOpacity
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full justify-center items-center border-4"
              style={{
                backgroundColor: COLORS.primary,
                borderColor: isDark ? COLORS.cardDark : COLORS.cardLight,
              }}
              onPress={onEditPress}
              activeOpacity={0.8}
            >
              <IconSymbol name="pencil" size={12} color={COLORS.secondary} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* User Info */}
        <View className="items-center mb-4">
          <Text
            className="text-3xl font-bold mb-2"
            style={{
              color: isDark ? COLORS.secondary : COLORS.textPrimary,
            }}
            numberOfLines={1}
          >
            {user?.name || user?.displayName || "User Name"}
          </Text>
          <Text
            className="text-base mb-3"
            style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
            numberOfLines={1}
          >
            {user?.email || "user@example.com"}
          </Text>

          {/* Artist Badge */}
          {isArtist && (
            <View
              className="flex-row items-center px-4 py-2 rounded-full border"
              style={{
                backgroundColor: COLORS.primary,
                borderColor: isDark ? COLORS.secondary : COLORS.primary,
              }}
            >
              <IconSymbol name="paintbrush.fill" size={14} color={COLORS.secondary} />
              <Text className="text-white text-sm font-bold ml-2">
                {t("profile.verifiedArtist")}
              </Text>
            </View>
          )}
        </View>

        {/* Artist Stats */}
        {profileStats && (
          <View
            className="flex-row w-full rounded-3xl p-6 border"
            style={{
              backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
              borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
            }}
          >
            {profileStats.map((stat, index) => (
              <View key={stat.label} className="flex-1 items-center">
                <View
                  className="w-12 h-12 rounded-2xl justify-center items-center mb-2 border"
                  style={{ 
                    backgroundColor: isDark ? COLORS.primary + "20" : COLORS.primary + "10",
                    borderColor: isDark ? COLORS.secondary : COLORS.primary,
                  }}
                >
                  <IconSymbol
                    name={stat.icon}
                    size={20}
                    color={isDark ? COLORS.secondary : COLORS.primary}
                  />
                </View>
                <Text
                  className="text-2xl font-bold mb-1"
                  style={{ color: isDark ? COLORS.secondary : COLORS.textPrimary }}
                >
                  {stat.value}
                </Text>
                <Text
                  className="text-sm text-center"
                  style={{
                    color: isDark ? COLORS.textMuted : COLORS.textSecondary,
                  }}
                >
                  {stat.label}
                </Text>
                {index < profileStats.length - 1 && (
                  <View
                    className="absolute right-0 w-px h-12 top-6"
                    style={{
                      backgroundColor: isDark
                        ? COLORS.borderDark
                        : COLORS.borderLight,
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }
);

ProfileSection.displayName = "ProfileSection";

// Enhanced MenuSection with black and white styling
const MenuSection = ({ title, children, isDark, icon }) => (
  <View className="mb-6">
    {title && (
      <View className="flex-row items-center mb-4 px-2">
        {icon && (
          <IconSymbol
            name={icon}
            size={18}
            color={isDark ? COLORS.textMuted : COLORS.textSecondary}
            className="mr-2"
          />
        )}
        <Text
          className="text-lg font-bold"
          style={{
            color: isDark ? COLORS.textMuted : COLORS.textSecondary,
          }}
        >
          {title}
        </Text>
      </View>
    )}
    <View className="rounded-3xl p-2">
      {children}
    </View>
  </View>
);

// Enhanced Language Modal with black and white styling
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
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            ...ANIMATION_CONFIG.bounce,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            ...ANIMATION_CONFIG.timing,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 300,
            ...ANIMATION_CONFIG.spring,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            ...ANIMATION_CONFIG.timing,
          }),
        ]).start();
      }
    }, [visible, slideAnim, backdropOpacity]);

    const handleBackdropPress = useCallback(() => {
      onClose();
    }, [onClose]);

    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Animated.View
          className="flex-1 justify-center items-center px-4"
          style={{
            backgroundColor: COLORS.overlay,
            opacity: backdropOpacity,
          }}
        >
          <Pressable
            className="absolute inset-0"
            onPress={handleBackdropPress}
          />
          <Animated.View
            className="w-full max-w-md max-h-3/4 rounded-3xl overflow-hidden border"
            style={{
              backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
              borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
              transform: [{ translateY: slideAnim }],
              shadowColor: COLORS.shadowColor,
              shadowOpacity: 0.3,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 20,
            }}
          >
            {/* Header */}
            <View
              className="flex-row justify-between items-center px-6 py-6 border-b"
              style={{
                borderBottomColor: isDark
                  ? COLORS.borderDark
                  : COLORS.borderLight,
                backgroundColor: isDark ? COLORS.cardDark : COLORS.lightBg,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-2xl justify-center items-center mr-3 border"
                  style={{ 
                    backgroundColor: COLORS.primary,
                    borderColor: isDark ? COLORS.secondary : COLORS.primary,
                  }}
                >
                  <IconSymbol name="globe" size={20} color={COLORS.secondary} />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: isDark ? COLORS.secondary : COLORS.textPrimary }}
                >
                  {t("profile.selectLanguage")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-2xl justify-center items-center border"
                style={{
                  backgroundColor: isDark
                    ? COLORS.borderDark
                    : COLORS.borderLight,
                  borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
                }}
                activeOpacity={0.8}
              >
                <IconSymbol
                  name="xmark"
                  size={18}
                  color={isDark ? COLORS.secondary : COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Language List */}
            <ScrollView
              className="max-h-96 p-2"
              showsVerticalScrollIndicator={false}
            >
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  className={`flex-row items-center justify-between p-4 m-1 rounded-2xl border ${
                    currentLanguage === language.name ? "" : ""
                  }`}
                  style={{
                    backgroundColor:
                      currentLanguage === language.name
                        ? COLORS.primary
                        : isDark
                          ? COLORS.cardDark
                          : COLORS.lightBg,
                    borderColor: currentLanguage === language.name
                      ? COLORS.primary
                      : isDark ? COLORS.borderDark : COLORS.borderLight,
                  }}
                  onPress={() => onLanguageSelect(language)}
                  activeOpacity={0.8}
                >
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold mb-1"
                      style={{
                        color:
                          currentLanguage === language.name
                            ? COLORS.secondary
                            : isDark
                              ? COLORS.secondary
                              : COLORS.textPrimary,
                      }}
                    >
                      {language.name}
                    </Text>
                    {language.nativeName !== language.name && (
                      <Text
                        className="text-sm"
                        style={{
                          color:
                            currentLanguage === language.name
                              ? COLORS.secondary
                              : isDark
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
                      className="w-6 h-6 rounded-full justify-center items-center"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    >
                      <IconSymbol name="checkmark" size={14} color={COLORS.secondary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }
);

LanguageModal.displayName = "LanguageModal";

// Enhanced Logout Button with black and white styling
const LogoutButton = ({ onPress, isLoading, isDark, t }) => (
  <TouchableOpacity
    className={`rounded-3xl p-4 items-center border ${
      isLoading ? "opacity-70" : ""
    }`}
    style={{
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    }}
    onPress={onPress}
    disabled={isLoading}
    activeOpacity={0.8}
  >
    <View className="flex-row items-center">
      <IconSymbol
        name={
          isLoading ? "arrow.clockwise" : "rectangle.portrait.and.arrow.right"
        }
        size={20}
        color={COLORS.secondary}
        className="mr-2"
      />
      <Text className="text-white text-lg font-bold">
        {isLoading ? t("profile.signingOut") : t("profile.signOut")}
      </Text>
    </View>
  </TouchableOpacity>
);

// Main Component
export default function AccountScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const { user, logout, refreshUser } = useAuthStore();
  const isArtist = user?.isArtist;
  const insets = useSafeAreaInsets();

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
            router.push("/");
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

  const navigateTo = useCallback((screenName) => {
    Haptics?.selectionAsync?.();
    router.push(`/Account/${screenName}`);
  }, []);

  const handleLanguageSelect = useCallback(
    async (language) => {
      try {
        setLanguageModalVisible(false); // Close modal first
        await changeLanguage(language.code);
        Haptics?.selectionAsync?.();
      } catch (error) {
        console.error("Failed to change language:", error);
        // Show error alert if language change fails
        Alert.alert(
          t("common.error"),
          "Failed to change language. Please try again."
        );
      }
    },
    [changeLanguage, t]
  );

  // Memoized menu sections with black and white styling
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
        title: t("profile.notificationSettings"),
        subtitle: t("profile.customizeNotifications"),
        icon: "bell.fill",
        onPress: () => navigateTo("notification-settings"),
        iconColor: COLORS.primary,
        // badge: "3",
      },
    ];

    const appItems = [
      {
        title: t("profile.subscription"),
        subtitle: t("profile.managePlan"),
        icon: "crown.fill",
        onPress: () => navigateTo("subscription"),
        iconColor: COLORS.primary,
      },
      {
        title: t("profile.language"),
        subtitle: t("profile.currentlySet", { language: currentLanguageName }),
        icon: "globe",
        onPress: () => setLanguageModalVisible(true),
        iconColor: COLORS.primary,
        rightContent: (
          <View className="flex-row items-center">
            <View
              className="px-3 py-1 rounded-full mr-2 border"
              style={{
                backgroundColor: isDark
                  ? COLORS.primary + "20"
                  : COLORS.primary + "10",
                borderColor: isDark ? COLORS.secondary : COLORS.primary,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: isDark ? COLORS.secondary : COLORS.primary }}
              >
                {currentLanguageName}
              </Text>
            </View>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={isDark ? COLORS.textMuted : COLORS.textTertiary}
            />
          </View>
        ),
        showChevron: false,
      },
    ];

    const supportItems = [
      {
        title: t("profile.helpSupport"),
        subtitle: t("profile.getHelp"),
        icon: "questionmark.circle",
        onPress: () => navigateTo("helpCenter"),
        iconColor: COLORS.primary,
      },
      {
        title: t("profile.about"),
        subtitle: t("profile.appInfo"),
        icon: "info.circle",
        onPress: () => navigateTo("about"),
        iconColor: COLORS.primary,
      },
    ];

    // Add artist-specific items
    if (isArtist) {
      accountItems.push({
        title: "Payout Settings",
        subtitle: "Manage your earnings and payouts",
        icon: "dollarsign.circle",
        onPress: () => navigateTo("PayoutSettings"),
        iconColor: COLORS.primary,
      });
    }

    return [
      {
        title: t("profile.account"),
        items: accountItems,
        icon: "person.circle",
      },
      { title: t("profile.preferences"), items: appItems, icon: "gear" },
      {
        title: t("profile.support"),
        items: supportItems,
        icon: "questionmark.circle",
      },
    ];
  }, [isArtist, currentLanguageName, t, navigateTo, isDark]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={
              isDark ? COLORS.cardDark : COLORS.cardLight
            }
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

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <MenuSection
            key={section.title}
            title={section.title}
            icon={section.icon}
            isDark={isDark}
          >
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
        <LogoutButton
          onPress={handleLogout}
          isLoading={isLoggingOut}
          isDark={isDark}
          t={t}
        />

        {/* Version Info */}
        <Text
          className="text-center text-sm mt-6 opacity-60"
          style={{
            color: isDark ? COLORS.textMuted : COLORS.textSecondary,
          }}
        >
          {t("profile.version")} 1.0.0
        </Text>
      </ScrollView>

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
  );
}
