import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState, useMemo, useRef } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Alert,
  Haptics,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Constants
const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Español", nativeName: "Español" },
  { code: "fr", name: "Français", nativeName: "Français" },
  { code: "de", name: "Deutsch", nativeName: "Deutsch" },
  { code: "pt", name: "Português", nativeName: "Português" },
  { code: "ja", name: "日本語", nativeName: "日本語" },
  { code: "zh", name: "中文", nativeName: "中文" },
  { code: "ar", name: "العربية", nativeName: "العربية" },
] as const;

const COLORS = {
  primary: "#72b7e9",
  primaryLight: "#8fc5ed",
  primaryDark: "#5ca8d8",
  secondary: "#a8d8f0",
  accent: "#4a90e2",
  success: "#34c759",
  warning: "#ff9500",
  error: "#ff3b30",
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

// Enhanced MenuItem component with better animations and accessibility
const MenuItem = React.memo(
  ({
    icon,
    title,
    onPress,
    colorScheme,
    rightContent,
    isLast,
    subtitle,
    disabled = false,
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      if (disabled) return;
      Haptics?.selectionAsync?.(); // Optional haptic feedback

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

    const borderColor = Colors[colorScheme].border + "40";
    const iconBackgroundColor = disabled
      ? Colors[colorScheme].secondaryText + "20"
      : COLORS.primary + "15";
    const iconColor = disabled
      ? Colors[colorScheme].secondaryText
      : COLORS.primary;

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
              borderBottomColor: borderColor,
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
              <IconSymbol name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text
                style={[
                  styles.menuItemText,
                  { color: Colors[colorScheme].text },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.menuItemSubtitle,
                    { color: Colors[colorScheme].secondaryText },
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
              <IconSymbol
                name="chevron.right"
                size={14}
                color={Colors[colorScheme].secondaryText}
              />
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
  ({ user, isArtist, colorScheme, onEditPress, isDark }) => {
    const getInitials = useCallback((name) => {
      if (!name) return "?";
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
        { label: "Artworks", value: "12" },
        { label: "Followers", value: "1.2K" },
        { label: "Sales", value: "24" },
      ];
    }, [isArtist]);

    return (
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            shadowColor: COLORS.shadowColor,
          },
        ]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <View
              style={[
                styles.profileImagePlaceholder,
                { backgroundColor: COLORS.primary },
              ]}
            >
              <Text style={styles.initials}>
                {getInitials(user?.displayName || user?.name)}
              </Text>
            </View>
            {isArtist && (
              <View
                style={[
                  styles.artistIndicator,
                  { backgroundColor: COLORS.success },
                ]}
              >
                <IconSymbol name="star.fill" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={[styles.userName, { color: Colors[colorScheme].text }]}
              numberOfLines={1}
            >
              {user?.name || user?.displayName || "User Name"}
            </Text>
            <Text
              style={[
                styles.userEmail,
                { color: Colors[colorScheme].secondaryText },
              ]}
              numberOfLines={1}
            >
              {user?.email || "user@example.com"}
            </Text>
            {isArtist && (
              <View
                style={[
                  styles.badgeContainer,
                  { backgroundColor: COLORS.primary },
                ]}
              >
                <IconSymbol name="paintbrush.fill" size={12} color="#FFFFFF" />
                <Text style={styles.artistBadge}>Verified Artist</Text>
              </View>
            )}
          </View>
        </View>

        {/* Artist Stats */}
        {profileStats && (
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={stat.label} style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {stat.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.editProfileButton,
            {
              backgroundColor: isDark
                ? COLORS.primary + "20"
                : COLORS.primary + "15",
              borderColor: COLORS.primary + "40",
            },
          ]}
          onPress={onEditPress}
          accessibilityLabel="Edit profile"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <IconSymbol name="pencil" size={16} color={COLORS.primary} />
          <Text style={[styles.editButtonText, { color: COLORS.primary }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

ProfileSection.displayName = "ProfileSection";

// Enhanced Language Modal
const LanguageModal = React.memo(
  ({
    visible,
    onClose,
    currentLanguage,
    onLanguageSelect,
    colorScheme,
    isDark,
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
                Select Language
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
              {LANGUAGES.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    {
                      borderBottomWidth:
                        index === LANGUAGES.length - 1
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
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {language.name}
                    </Text>
                    {language.nativeName !== language.name && (
                      <Text
                        style={[
                          styles.languageNative,
                          { color: Colors[colorScheme].secondaryText },
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

LanguageModal.displayName = "LanguageModal";

// Main Component
export default function AccountScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const { user, logout, refreshUser } = useAuthStore();
  const isArtist = user?.isArtist;
  const insets = useSafeAreaInsets();

  // State
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");
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
      // Add small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.warn("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUser]);

  // Enhanced logout with confirmation
  const handleLogout = useCallback(async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
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
            Alert.alert("Error", "Failed to sign out. Please try again.");
            Haptics?.notificationAsync?.(
              Haptics.NotificationFeedbackType.Error
            );
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }, [logout]);

   const navigateTo = useCallback(
    (screenName) => {
      Haptics?.selectionAsync?.();
      router.push(`/Account/${screenName}`); // Updated to use router
    },
    []
  );


  const handleLanguageSelect = useCallback((language) => {
    setCurrentLanguage(language.name);
    setLanguageModalVisible(false);
    Haptics?.selectionAsync?.();
    // Here you would typically save the language preference
  }, []);

  // Memoized menu items
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        title: "Edit Profile",
        subtitle: "Update your personal information",
        icon: "person.crop.circle",
        onPress: () => navigateTo("EditProfile"),
      },
      {
        title: "Payment Methods",
        subtitle: "Manage cards and payment options",
        icon: "creditcard",
        onPress: () => navigateTo("PaymentMethods"),
      },
      {
        title: "Subscription",
        subtitle: "Manage your subscription plan",
        icon: "crown.fill",
        onPress: () => navigateTo("subscription"),
      },
      {
        title: "Notification Settings",
        subtitle: "Customize your notifications",
        icon: "bell.fill",
        onPress: () => navigateTo("NotificationSettings"),
      },
      {
        title: "Language",
        subtitle: `Currently set to ${currentLanguage}`,
        icon: "globe",
        onPress: () => setLanguageModalVisible(true),
        rightContent: (
          <View style={styles.languageValue}>
            <Text
              style={[
                styles.languageValueText,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              {currentLanguage}
            </Text>
            <IconSymbol
              name="chevron.right"
              size={14}
              color={Colors[colorScheme].secondaryText}
            />
          </View>
        ),
      },
      {
        title: "Privacy Settings",
        subtitle: "Control your privacy preferences",
        icon: "lock.fill",
        onPress: () => navigateTo("PrivacySettings"),
      },
      {
        title: "Help & Support",
        subtitle: "Get help and contact support",
        icon: "questionmark.circle",
        onPress: () => navigateTo("Support"),
      },
      {
        title: "About",
        subtitle: "App information and legal",
        icon: "info.circle",
        onPress: () => navigateTo("About"),
      },
    ];

    // Add artist-specific options if user is an artist
    if (isArtist) {
      baseItems.splice(2, 0, {
        title: "Payout Settings",
        subtitle: "Manage your earnings and payouts",
        icon: "dollarsign.circle",
        onPress: () => navigateTo("PayoutSettings"),
      });
    }

    return baseItems;
  }, [isArtist, currentLanguage, colorScheme, navigateTo]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Enhanced Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        {/* <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: COLORS.primary }]}>
            {isArtist ? "Artist Account" : "My Account"}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Manage your profile and preferences
          </Text>
        </View> */}
      </View>

      <ScrollView
        style={styles.content}
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
        {/* Enhanced User Profile Section */}
        <ProfileSection
          user={user}
          isArtist={isArtist}
          colorScheme={colorScheme}
          onEditPress={() => navigateTo("EditProfile")}
          isDark={isDark}
        />

        {/* Enhanced Menu Section */}
        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
              shadowColor: COLORS.shadowColor,
            },
          ]}
        >
          {menuItems.map((item, index) => (
            <MenuItem
              key={`menu-item-${index}`}
              {...item}
              colorScheme={colorScheme}
              isLast={index === menuItems.length - 1}
            />
          ))}
        </View>

        {/* Enhanced Sign Out Section */}
        <View
          style={[
            styles.signOutCard,
            {
              backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
              shadowColor: COLORS.shadowColor,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
              isLoggingOut && styles.signOutButtonDisabled,
            ]}
            onPress={handleLogout}
            disabled={isLoggingOut}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Sign out from account"
            accessibilityHint="Logs you out of your account"
            accessibilityState={{ disabled: isLoggingOut }}
          >
            <IconSymbol
              name="arrow.right.square"
              size={18}
              color={
                isLoggingOut ? Colors[colorScheme].secondaryText : COLORS.error
              }
            />
            <Text
              style={[
                styles.signOutText,
                {
                  color: isLoggingOut
                    ? Colors[colorScheme].secondaryText
                    : COLORS.error,
                },
              ]}
            >
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Text>
          </Pressable>
        </View>

        <Text
          style={[
            styles.versionText,
            { color: Colors[colorScheme].secondaryText },
          ]}
        >
          Version 1.0.3 • Built with ❤️
        </Text>
      </ScrollView>

      {/* Enhanced Language Selection Modal */}
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        currentLanguage={currentLanguage}
        onLanguageSelect={handleLanguageSelect}
        colorScheme={colorScheme}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  artistIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  initials: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
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
    alignSelf: "flex-start",
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
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "rgba(114, 183, 233, 0.1)",
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
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  menuCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 17,
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
  languageValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageValueText: {
    fontSize: 16,
    marginRight: 8,
  },
  signOutCard: {
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  signOutButtonPressed: {
    opacity: 0.7,
  },
  signOutButtonDisabled: {
    opacity: 0.5,
  },
  signOutText: {
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
    opacity: 0.6,
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
});
