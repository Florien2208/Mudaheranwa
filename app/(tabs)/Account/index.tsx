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
  StyleSheet,
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
          style={[
            styles.menuItem,
            {
              borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
              borderBottomColor: borderColor + "30",
              opacity: disabled ? 0.5 : 1,
            },
          ]}
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
          <View style={styles.menuItemLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: iconBackgroundColor },
              ]}
            >
              <IconSymbol
                name={icon}
                size={20}
                color={disabled ? Colors[colorScheme].secondaryText : "#FFFFFF"}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text
                style={[styles.menuItemText, { color: COLORS.textPrimary }]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.menuItemSubtitle,
                    { color: COLORS.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.menuItemRight}>
            {rightContent || (
              <Text
                style={[
                  styles.menuArrow,
                  { color: Colors[colorScheme].secondaryText },
                ]}
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
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <View
            style={[styles.profileImage, { backgroundColor: COLORS.primary }]}
          >
            <Text style={styles.profileImageText}>
              {getInitials(user?.displayName || user?.name)}
            </Text>
            {isArtist && (
              <View
                style={[
                  styles.artistIndicator,
                  { backgroundColor: COLORS.warning },
                ]}
              >
                <IconSymbol name="star.fill" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>

        <Text
          style={[
            styles.profileName,
            {
              color: isDark ? "#FFFFFF" : COLORS.textPrimary,
            },
          ]}
          numberOfLines={1}
        >
          {user?.name || user?.displayName || "User Name"}
        </Text>
        <Text
          style={[
            styles.profileEmail,
            { color: isDark ? COLORS.textMuted : COLORS.textSecondary },
          ]}
          numberOfLines={1}
        >
          {user?.email || "user@example.com"}
        </Text>

        {isArtist && (
          <View
            style={[styles.badgeContainer, { backgroundColor: COLORS.warning }]}
          >
            <IconSymbol name="paintbrush.fill" size={12} color="#FFFFFF" />
            <Text style={styles.artistBadge}>
              {t("profile.verifiedArtist")}
            </Text>
          </View>
        )}

        {/* Artist Stats */}
        {profileStats && (
          <View
            style={[
              styles.statsContainer,
              { backgroundColor: COLORS.secondary },
            ]}
          >
            {profileStats.map((stat, index) => (
              <View key={stat.label} style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: isDark ? "#FFFFFF" : COLORS.textPrimary },
                  ]}
                >
                  {stat.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? COLORS.textMuted : COLORS.textSecondary },
                  ]}
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
    style={[
      styles.menuSection,
      {
        backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
        shadowColor: COLORS.shadowColor,
      },
    ]}
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
        <Pressable style={styles.modalOverlay} onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
                transform: [{ translateY: slideAnim }],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: Colors[colorScheme].border + "40" },
              ]}
            >
              <Text style={[styles.modalTitle, { color: COLORS.primary }]}>
                {t("profile.selectLanguage")}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
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
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            >
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    {
                      borderBottomWidth:
                        index === languages.length - 1
                          ? 0
                          : StyleSheet.hairlineWidth,
                      borderBottomColor: Colors[colorScheme].border + "40",
                    },
                    currentLanguage === language.name && {
                      backgroundColor: COLORS.primary + "15",
                    },
                  ]}
                  onPress={() => onLanguageSelect(language)}
                  accessibilityLabel={`Select ${language.name} language`}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: currentLanguage === language.name,
                  }}
                >
                  <View style={styles.languageTextContainer}>
                    <Text
                      style={[
                        styles.languageText,
                        { color: isDark ? "#FFFFFF" : COLORS.textPrimary },
                      ]}
                    >
                      {language.name}
                    </Text>
                    {language.nativeName !== language.name && (
                      <Text
                        style={[
                          styles.languageNative,
                          {
                            color: isDark
                              ? COLORS.textMuted
                              : COLORS.textSecondary,
                          },
                        ]}
                      >
                        {language.nativeName}
                      </Text>
                    )}
                  </View>
                  {currentLanguage === language.name && (
                    <View
                      style={[
                        styles.checkmarkContainer,
                        { backgroundColor: COLORS.primary },
                      ]}
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
        style={[
          styles.themeToggle,
          {
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            shadowColor: COLORS.shadowColor,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.themeToggleContent,
            { borderColor: Colors[colorScheme].border + "30" },
          ]}
        >
          <View
            style={[
              styles.themeIconContainer,
              { backgroundColor: COLORS.primary },
            ]}
          >
            <IconSymbol
              name={isDark ? "sun.max.fill" : "moon.fill"}
              size={18}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.themeTextContainer}>
            <Text
              style={[
                styles.themeToggleText,
                { color: isDark ? "#FFFFFF" : COLORS.textPrimary },
              ]}
            >
              {isDark ? t("profile.lightMode") : t("profile.darkMode")}
            </Text>
            <Text
              style={[
                styles.themeToggleSubtext,
                { color: isDark ? COLORS.textMuted : COLORS.textSecondary },
              ]}
            >
              {isDark ? t("profile.switchToLight") : t("profile.switchToDark")}
            </Text>
          </View>
          <View
            style={[
              styles.toggleSwitch,
              {
                backgroundColor: isDark
                  ? COLORS.primary
                  : Colors[colorScheme].border + "40",
              },
            ]}
          >
            <Animated.View
              style={[
                styles.toggleKnob,
                {
                  backgroundColor: "#FFFFFF",
                  transform: [{ translateX: isDark ? 20 : 2 }],
                },
              ]}
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
        onPress: () => navigateTo("EditProfile"),
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
          <View style={styles.languageValue}>
            <Text
              style={[
                styles.languageValueText,
                { color: isDark ? COLORS.textMuted : COLORS.textSecondary },
              ]}
            >
              {currentLanguageName}
            </Text>
            <Text
              style={[
                styles.menuArrow,
                { color: isDark ? COLORS.textMuted : COLORS.textSecondary },
              ]}
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
        onPress: () => navigateTo("Support"),
        iconColor: COLORS.accent,
      },
      {
        title: t("profile.about"),
        subtitle: t("profile.appInfo"),
        icon: "info.circle",
        onPress: () => navigateTo("About"),
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
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
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
              style={[
                styles.logoutButton,
                {
                  backgroundColor: COLORS.error,
                  opacity: isLoggingOut ? 0.7 : 1,
                },
              ]}
              onPress={handleLogout}
              disabled={isLoggingOut}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign out from account"
              accessibilityHint="Logs you out of your account"
              accessibilityState={{ disabled: isLoggingOut }}
            >
              <Text style={styles.logoutText}>
                {isLoggingOut ? t("profile.signingOut") : t("profile.signOut")}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.versionText,
                { color: isDark ? COLORS.textMuted : COLORS.textSecondary },
              ]}
            >
              {t("profile.version")}
            </Text>

            <View style={styles.bottomSpacing} />
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

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  artistIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  artistBadge: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginTop: 16,
    borderRadius: 12,
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  menuSection: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
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
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuArrow: {
    fontSize: 16,
  },
  languageValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageValueText: {
    fontSize: 16,
    marginRight: 8,
  },
  logoutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 56,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    width: "90%",
    maxHeight: "70%",
    borderRadius: 24,
    overflow: "hidden",
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageText: {
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  themeToggle: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
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
  },
  themeToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  themeToggleSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    position: "relative",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
