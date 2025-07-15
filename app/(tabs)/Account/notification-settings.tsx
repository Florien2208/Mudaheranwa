import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Alert,
  Haptics,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTranslation } from "react-i18next";

// Enhanced Constants matching your design system
const COLORS = {
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  primaryDark: "#1D4ED8",
  secondary: "#F1F5F9",
  accent: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  purple: "#8B5CF6",
  orange: "#F97316",
  pink: "#EC4899",
  emerald: "#059669",
  indigo: "#6366F1",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#64748B",
  textMuted: "#94A3B8",
  lightBg: "#F8FAFC",
  darkBg: "#0F172A",
  cardLight: "#FFFFFF",
  cardDark: "#1E293B",
  borderLight: "#E2E8F0",
  borderDark: "#334155",
  shadowColor: "#000",
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
} as const;

// Enhanced NotificationItem component
const NotificationItem = React.memo(
  ({
    title,
    subtitle,
    icon,
    isEnabled,
    onToggle,
    iconColor,
    isDark,
    disabled = false,
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      if (disabled) return;
      Animated.spring(scaleValue, {
        toValue: 0.98,
        ...ANIMATION_CONFIG.spring,
      }).start();
    }, [disabled, scaleValue]);

    const handlePressOut = useCallback(() => {
      if (disabled) return;
      Animated.spring(scaleValue, {
        toValue: 1,
        ...ANIMATION_CONFIG.spring,
      }).start();
    }, [disabled, scaleValue]);

    const handleToggle = useCallback(() => {
      if (disabled) return;
      Haptics?.selectionAsync?.();
      onToggle(!isEnabled);
    }, [disabled, isEnabled, onToggle]);

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
        }}
        className={`mx-1 mb-2 rounded-2xl overflow-hidden ${
          isDark ? "bg-slate-800" : "bg-white"
        }`}
      >
        <TouchableOpacity
          className={`flex-row items-center p-4 ${
            disabled ? "opacity-50" : ""
          }`}
          onPress={handleToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="switch"
          accessibilityLabel={title}
          accessibilityState={{ checked: isEnabled, disabled }}
        >
          {/* Icon Container */}
          <View className="relative mr-4">
            <View
              className="w-12 h-12 rounded-2xl justify-center items-center shadow-sm"
              style={{
                backgroundColor: disabled
                  ? isDark
                    ? COLORS.borderDark
                    : COLORS.borderLight
                  : iconColor,
                shadowColor: iconColor,
                shadowOpacity: disabled ? 0 : 0.2,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <IconSymbol
                name={icon}
                size={22}
                color={disabled ? COLORS.textMuted : "#FFFFFF"}
              />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 justify-center">
            <Text
              className="text-base font-semibold mb-1"
              style={{
                color: isDark ? "#FFFFFF" : COLORS.textPrimary,
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
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Switch */}
          <Switch
            value={isEnabled}
            onValueChange={handleToggle}
            disabled={disabled}
            trackColor={{
              false: isDark ? COLORS.borderDark : COLORS.borderLight,
              true: COLORS.primary,
            }}
            thumbColor={isEnabled ? "#FFFFFF" : isDark ? "#FFFFFF" : "#F4F4F4"}
            ios_backgroundColor={
              isDark ? COLORS.borderDark : COLORS.borderLight
            }
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

// Enhanced Section Header
const SectionHeader = ({ title, subtitle, icon, isDark }) => (
  <View className="flex-row items-center mb-4 px-2">
    {icon && (
      <View
        className="w-8 h-8 rounded-xl justify-center items-center mr-3"
        style={{ backgroundColor: COLORS.primary + "20" }}
      >
        <IconSymbol name={icon} size={16} color={COLORS.primary} />
      </View>
    )}
    <View className="flex-1">
      <Text
        className="text-lg font-bold"
        style={{
          color: isDark ? COLORS.textMuted : COLORS.textSecondary,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-sm mt-1"
          style={{
            color: isDark ? COLORS.textMuted : COLORS.textTertiary,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  </View>
);

// Enhanced Section Container
const SectionContainer = ({ children, isDark }) => (
  <View
    className="rounded-3xl p-2 shadow-lg mb-6"
    style={{
      backgroundColor: isDark
        ? COLORS.cardDark + "80"
        : COLORS.cardLight + "80",
      shadowColor: COLORS.shadowColor,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    }}
  >
    {children}
  </View>
);

// Header Component
const Header = ({ isDark, onBack, t }) => (
  <View
    className="flex-row items-center justify-between px-6 py-4 border-b"
    style={{
      borderBottomColor: isDark ? COLORS.borderDark : COLORS.borderLight,
    }}
  >
    <TouchableOpacity
      onPress={onBack}
      className="w-10 h-10 rounded-2xl justify-center items-center"
      style={{
        backgroundColor: isDark ? COLORS.cardDark : COLORS.lightBg,
      }}
      activeOpacity={0.8}
    >
      <IconSymbol
        name="chevron.left"
        size={20}
        color={isDark ? "#FFFFFF" : COLORS.textPrimary}
      />
    </TouchableOpacity>

    <View className="flex-1 items-center">
      <Text
        className="text-xl font-bold"
        style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
      >
        {t("notifications.title")}
      </Text>
    </View>

    <View className="w-10 h-10" />
  </View>
);

// Main NotificationSettings Component
export default function NotificationSettings() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  // Notification settings state
  const [notifications, setNotifications] = useState({
    // Push Notifications
    pushEnabled: true,

    // Email Notifications
    emailEnabled: true,
  });

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const updateNotification = useCallback((key, value) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const showResetConfirmation = useCallback(() => {
    Alert.alert(
      t("notifications.resetTitle"),
      t("notifications.resetMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("notifications.reset"),
          style: "destructive",
          onPress: () => {
            setNotifications({
              pushEnabled: true,
              emailEnabled: true,
            });
            Haptics?.notificationAsync?.(
              Haptics.NotificationFeedbackType.Success
            );
          },
        },
      ]
    );
  }, [t]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <Header isDark={isDark} onBack={handleBack} t={t} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
      >
        {/* Push Notifications Section */}
        <SectionHeader
          title={t("notifications.pushNotifications")}
          subtitle={t("notifications.pushSubtitle")}
          icon="bell.fill"
          isDark={isDark}
        />

        <SectionContainer isDark={isDark}>
          <NotificationItem
            title={t("notifications.enablePush")}
            subtitle={t("notifications.enablePushSubtitle")}
            icon="bell.fill"
            isEnabled={notifications.pushEnabled}
            onToggle={(value) => updateNotification("pushEnabled", value)}
            iconColor={COLORS.primary}
            isDark={isDark}
          />
        </SectionContainer>

        {/* Email Notifications Section */}
        <SectionHeader
          title={t("notifications.emailNotifications")}
          subtitle={t("notifications.emailSubtitle")}
          icon="envelope.fill"
          isDark={isDark}
        />

        <SectionContainer isDark={isDark}>
          <NotificationItem
            title={t("notifications.enableEmail")}
            subtitle={t("notifications.enableEmailSubtitle")}
            icon="envelope.fill"
            isEnabled={notifications.emailEnabled}
            onToggle={(value) => updateNotification("emailEnabled", value)}
            iconColor={COLORS.indigo}
            isDark={isDark}
          />
        </SectionContainer>

        {/* Reset Button */}
        <TouchableOpacity
          className="rounded-3xl p-4 items-center shadow-lg"
          style={{
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            shadowColor: COLORS.shadowColor,
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
          onPress={showResetConfirmation}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <IconSymbol
              name="arrow.clockwise"
              size={20}
              color={isDark ? COLORS.textMuted : COLORS.textSecondary}
              className="mr-2"
            />
            <Text
              className="text-lg font-semibold"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              {t("notifications.resetToDefault")}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
