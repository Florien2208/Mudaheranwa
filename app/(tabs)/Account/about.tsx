import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Haptics,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

// Header Component
const AboutHeader = React.memo(({ isDark, t }) => (
  <View className="items-center mb-8">
    <View
      className="w-20 h-20 rounded-2xl justify-center items-center mb-4"
      style={{
        backgroundColor: COLORS.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <IconSymbol name="paintbrush.pointed.fill" size={32} color="#FFFFFF" />
    </View>
    <Text
      className="text-3xl font-bold mb-2"
      style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
    >
      ArtNexus
    </Text>
    <Text
      className="text-lg font-medium mb-1"
      style={{ color: COLORS.primary }}
    >
      {t("about.version")} 1.2.0
    </Text>
    <Text
      className="text-sm text-center opacity-70 px-4"
      style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
    >
      {t("about.tagline")}
    </Text>
  </View>
));

// Info Item Component
const InfoItem = React.memo(
  ({
    icon,
    title,
    subtitle,
    onPress,
    colorScheme,
    iconColor,
    isLast,
    isDark,
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      if (!onPress) return;
      Haptics?.selectionAsync?.();

      Animated.spring(scaleValue, {
        toValue: 0.98,
        ...ANIMATION_CONFIG.spring,
      }).start();
    }, [onPress, scaleValue]);

    const handlePressOut = useCallback(() => {
      if (!onPress) return;

      Animated.spring(scaleValue, {
        toValue: 1,
        ...ANIMATION_CONFIG.spring,
      }).start();
    }, [onPress, scaleValue]);

    const Component = onPress ? Pressable : View;

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Component
          className={`flex-row items-center p-4 ${
            !isLast ? "border-b border-gray-200/30" : ""
          }`}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessible={!!onPress}
          accessibilityRole={onPress ? "button" : "text"}
          accessibilityLabel={title}
        >
          <View
            className="w-10 h-10 rounded-lg justify-center items-center mr-3"
            style={{ backgroundColor: iconColor }}
          >
            <IconSymbol name={icon} size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-medium mb-0.5"
              style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
            >
              {title}
            </Text>
            <Text
              className="text-sm opacity-70"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              {subtitle}
            </Text>
          </View>
          {onPress && (
            <Text
              className="text-base"
              style={{ color: Colors[colorScheme].secondaryText }}
            >
              ›
            </Text>
          )}
        </Component>
      </Animated.View>
    );
  }
);

// Section Component
const AboutSection = ({ children, isDark }) => (
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

export default function AboutScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  const handleOpenURL = useCallback(
    async (url) => {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          Haptics?.selectionAsync?.();
        } else {
          Alert.alert(t("common.error"), t("about.cannotOpenLink"));
        }
      } catch (error) {
        console.error("Failed to open URL:", error);
        Alert.alert(t("common.error"), t("about.cannotOpenLink"));
      }
    },
    [t]
  );

  const handleGoBack = useCallback(() => {
    Haptics?.selectionAsync?.();
    router.back();
  }, []);

  const aboutSections = useMemo(
    () => [
      {
        items: [
          {
            title: t("about.buildVersion"),
            subtitle: "1.2.0 (Build 42)",
            icon: "hammer.fill",
            iconColor: COLORS.primary,
          },
          {
            title: t("about.releaseDate"),
            subtitle: "June 2025",
            icon: "calendar",
            iconColor: COLORS.success,
          },
          {
            title: t("about.platform"),
            subtitle: Platform.OS === "ios" ? "iOS" : "Android",
            icon: Platform.OS === "ios" ? "apple.logo" : "android.logo",
            iconColor: COLORS.orange,
          },
        ],
      },
      {
        items: [
          {
            title: t("about.website"),
            subtitle: "www.artnexus.com",
            icon: "globe",
            iconColor: COLORS.primary,
            onPress: () => handleOpenURL("https://www.artnexus.com"),
          },
          {
            title: t("about.privacyPolicy"),
            subtitle: t("about.readPrivacy"),
            icon: "shield.checkered",
            iconColor: COLORS.purple,
            onPress: () => handleOpenURL("https://www.artnexus.com/privacy"),
          },
          {
            title: t("about.termsOfService"),
            subtitle: t("about.readTerms"),
            icon: "doc.text",
            iconColor: COLORS.accent,
            onPress: () => handleOpenURL("https://www.artnexus.com/terms"),
          },
          {
            title: t("about.licenses"),
            subtitle: t("about.thirdParty"),
            icon: "list.bullet.rectangle",
            iconColor: COLORS.textTeal,
            onPress: () => router.push("/Account/Licenses"),
          },
        ],
      },
      {
        items: [
          {
            title: t("about.followTwitter"),
            subtitle: "@ArtNexusApp",
            icon: "at",
            iconColor: "#1DA1F2",
            onPress: () => handleOpenURL("https://twitter.com/ArtNexusApp"),
          },
          {
            title: t("about.rateApp"),
            subtitle: t("about.enjoyingApp"),
            icon: "star.fill",
            iconColor: COLORS.warning,
            onPress: () => {
              const storeUrl = Platform.select({
                ios: "https://apps.apple.com/app/artnexus/id123456789",
                android:
                  "https://play.google.com/store/apps/details?id=com.artnexus.app",
              });
              handleOpenURL(storeUrl);
            },
          },
        ],
      },
    ],
    [t, handleOpenURL]
  );

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 rounded-lg justify-center items-center"
          style={{
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
          }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconSymbol
            name="chevron.left"
            size={20}
            color={isDark ? "#FFFFFF" : COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text
          className="text-xl font-bold"
          style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
        >
          {t("about.title")}
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AboutHeader isDark={isDark} t={t} />

        {aboutSections.map((section, sectionIndex) => (
          <AboutSection key={sectionIndex} isDark={isDark}>
            {section.items.map((item, index) => (
              <InfoItem
                key={`${sectionIndex}-${index}`}
                {...item}
                colorScheme={colorScheme}
                isLast={index === section.items.length - 1}
                isDark={isDark}
              />
            ))}
          </AboutSection>
        ))}

        {/* Footer */}
        <View className="items-center mt-6 mb-4">
          <Text
            className="text-sm text-center opacity-60 mb-2"
            style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
          >
            {t("about.madeWith")} ❤️ {t("about.forArtists")}
          </Text>
          <Text
            className="text-xs text-center opacity-40"
            style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
          >
            © 2025 ArtNexus. {t("about.allRights")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
