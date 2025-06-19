import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

const { width, height } = Dimensions.get("window");

// Design tokens for consistent styling
const DESIGN_TOKENS = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 36,
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
    extraBold: "800",
  },
};

const termsData = [
  {
    id: 1,
    title: "Acceptance of Terms",
    content:
      "By accessing and using Mudaheranwa Artist, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use the service.",
    icon: "📋",
  },
  {
    id: 2,
    title: "Use License",
    content:
      "Permission is granted to temporarily download one copy of the materials on Mudaheranwa Artist for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.",
    icon: "📄",
  },
  {
    id: 3,
    title: "Content Guidelines",
    content:
      "All content shared through our platform must respect cultural values and artistic integrity. Users are responsible for ensuring their contributions are respectful and appropriate for our community.",
    icon: "🎨",
  },
  {
    id: 4,
    title: "User Responsibilities",
    content:
      "Users must provide accurate information, maintain the security of their account, and use the service in compliance with all applicable laws and regulations.",
    icon: "👤",
  },
  {
    id: 5,
    title: "Intellectual Property",
    content:
      "All artistic works, music, videos, and written content are protected by copyright. Users must respect the intellectual property rights of artists and creators.",
    icon: "🔒",
  },
  {
    id: 6,
    title: "Memorial Content",
    content:
      "Memorial and historical content is provided for educational and remembrance purposes. Users must treat such content with appropriate respect and dignity.",
    icon: "🕊️",
  },
  {
    id: 7,
    title: "Service Modifications",
    content:
      "We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will provide reasonable notice of significant changes.",
    icon: "⚙️",
  },
  {
    id: 8,
    title: "Contact Information",
    content:
      "For questions about these Terms and Conditions, please contact us through the official channels provided within the application.",
    icon: "📞",
  },
];

interface TermsConditionsScreenProps {
  onBack?: () => void;
  onAccept?: () => void;
}

export default function TermsConditionsScreen({
  onBack,
  onAccept,
}: TermsConditionsScreenProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const pulseValue = useSharedValue(1);
  const floatingValue = useSharedValue(0);
  const scaleValue = useSharedValue(0);
  const navigation = useNavigation();

  useEffect(() => {
    // Enhanced pulse animation for the logo
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 3000 }),
      -1,
      true
    );

    // Subtle floating animation
    floatingValue.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );

    // Initial scale animation
    scaleValue.value = withDelay(300, withSpring(1, { damping: 15 }));
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const floatingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(floatingValue.value, [0, 1], [0, -4]),
      },
    ],
  }));

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  // Enhanced color system
  const colors = {
    primary: "#72b7e9",
    primaryDark: "#4a9ce8",
    text: colorScheme === "dark" ? "#FFFFFF" : "#1C1C1E",
    textSecondary: colorScheme === "dark" ? "#A1A1AA" : "#6B7280",
    textTertiary: colorScheme === "dark" ? "#71717A" : "#9CA3AF",
    background: colorScheme === "dark" ? "#000000" : "#FAFAFA",
    surface: colorScheme === "dark" ? "#111827" : "#FFFFFF",
    surfaceElevated: colorScheme === "dark" ? "#1F2937" : "#FFFFFF",
    border: colorScheme === "dark" ? "#374151" : "#E5E7EB",
    shadow: colorScheme === "dark" ? "#000000" : "#00000020",
  };

  const TermsCard = ({
    term,
    index,
  }: {
    term: (typeof termsData)[0];
    index: number;
  }) => (
    <Animated.View
      entering={FadeInLeft.duration(800).delay(index * 100)}
      style={[floatingAnimatedStyle, styles.termCardContainer]}
    >
      <View
        style={[
          styles.termCard,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.termCardContent}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.termIconContainer}
          >
            <Text style={styles.termIcon}>{term.icon}</Text>
          </LinearGradient>

          <View style={styles.termTextContainer}>
            <Text style={[styles.termTitle, { color: colors.text }]}>
              {term.title}
            </Text>
            <Text style={[styles.termContent, { color: colors.textSecondary }]}>
              {term.content}
            </Text>
          </View>
        </View>

        <View
          style={[styles.cardHighlight, { backgroundColor: colors.primary }]}
        />
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Enhanced background with multiple gradients */}
      <LinearGradient
        colors={[
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.15)"
            : "rgba(114, 183, 233, 0.08)",
          "transparent",
          "transparent",
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.10)"
            : "rgba(114, 183, 233, 0.05)",
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.backgroundGradient}
      />

      {/* Header with back button */}
      <Animated.View
        entering={FadeInUp.duration(800)}
        style={[styles.header, { borderBottomColor: colors.border }]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.surfaceElevated },
          ]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            <Feather name="arrow-left" size={24} />
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Terms & Conditions
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Enhanced Header Section */}
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={styles.headerSection}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              pulseAnimatedStyle,
              scaleAnimatedStyle,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>📜</Text>
            </LinearGradient>

            <View
              style={[styles.logoRing, { borderColor: colors.primary + "30" }]}
            />
          </Animated.View>

          <View style={styles.titleContainer}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>
              Terms & Conditions
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Please read these terms carefully before using our services
            </Text>
          </View>

          <View style={styles.decorativeContainer}>
            <View style={styles.decorativeLine}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientLine}
              />
            </View>
          </View>
        </Animated.View>

        {/* Terms Content Section */}
        <Animated.View
          entering={FadeInDown.duration(1000).delay(400)}
          style={styles.termsSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>
              Last updated: June 2025
            </Text>
          </View>

          <View style={styles.termsGrid}>
            {termsData.map((term, index) => (
              <TermsCard key={term.id} term={term} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.duration(1200).delay(800)}
          style={styles.actionSection}
        >
          <TouchableOpacity
            style={[styles.acceptButton, { shadowColor: colors.primary }]}
            onPress={() => onBack?.() || router.back()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>I Accept</Text>
              <Text style={styles.buttonIcon}>✓</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => onBack?.() || router.back()}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: colors.textSecondary },
              ]}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.duration(1000).delay(1200)}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Mudaheranwa Artist • Legal Terms
          </Text>
          <View style={styles.footerDivider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingTop:
      Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: DESIGN_TOKENS.spacing.md,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: DESIGN_TOKENS.fontWeight.bold,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: DESIGN_TOKENS.fontWeight.semiBold,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: DESIGN_TOKENS.spacing.xxl,
  },

  // Header Section
  headerSection: {
    alignItems: "center",
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingTop: DESIGN_TOKENS.spacing.xl,
    paddingBottom: DESIGN_TOKENS.spacing.lg,
  },
  logoContainer: {
    marginBottom: DESIGN_TOKENS.spacing.lg,
    position: "relative",
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 32,
  },
  logoRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    top: -10,
    left: -10,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  pageTitle: {
    fontSize: DESIGN_TOKENS.fontSize.xl + 2,
    fontWeight: DESIGN_TOKENS.fontWeight.bold,
    textAlign: "center",
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  subtitle: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
  },
  decorativeContainer: {
    alignItems: "center",
  },
  decorativeLine: {
    width: 100,
    height: 3,
    borderRadius: DESIGN_TOKENS.borderRadius.sm,
    overflow: "hidden",
  },
  gradientLine: {
    flex: 1,
  },

  // Terms Section
  termsSection: {
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingVertical: DESIGN_TOKENS.spacing.lg,
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: DESIGN_TOKENS.spacing.xl,
  },
  lastUpdated: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    fontStyle: "italic",
  },
  termsGrid: {
    gap: DESIGN_TOKENS.spacing.md,
  },
  termCardContainer: {
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  termCard: {
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    position: "relative",
  },
  termCardContent: {
    flexDirection: "row",
    padding: DESIGN_TOKENS.spacing.lg,
    alignItems: "flex-start",
  },
  termIconContainer: {
    width: 50,
    height: 50,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: DESIGN_TOKENS.spacing.md,
    flexShrink: 0,
  },
  termIcon: {
    fontSize: 20,
  },
  termTextContainer: {
    flex: 1,
  },
  termTitle: {
    fontSize: DESIGN_TOKENS.fontSize.md + 1,
    fontWeight: DESIGN_TOKENS.fontWeight.semiBold,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    lineHeight: 22,
  },
  termContent: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    lineHeight: 20,
    fontWeight: DESIGN_TOKENS.fontWeight.regular,
  },
  cardHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 3,
    height: "100%",
    opacity: 0.8,
  },

  // Action Section
  actionSection: {
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingVertical: DESIGN_TOKENS.spacing.xl,
    gap: DESIGN_TOKENS.spacing.md,
  },
  acceptButton: {
    height: 56,
    borderRadius: DESIGN_TOKENS.borderRadius.xl,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: DESIGN_TOKENS.spacing.sm,
  },
  buttonText: {
    color: "white",
    fontSize: DESIGN_TOKENS.fontSize.md + 1,
    fontWeight: DESIGN_TOKENS.fontWeight.semiBold,
  },
  buttonIcon: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: "white",
  },
  secondaryButton: {
    height: 56,
    borderRadius: DESIGN_TOKENS.borderRadius.xl,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: DESIGN_TOKENS.fontSize.md + 1,
    fontWeight: DESIGN_TOKENS.fontWeight.medium,
  },

  // Footer
  footer: {
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingVertical: DESIGN_TOKENS.spacing.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    textAlign: "center",
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  footerDivider: {
    width: 60,
  },
  dividerLine: {
    height: 1,
    opacity: 0.3,
  },
});
