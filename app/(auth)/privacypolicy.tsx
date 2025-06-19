import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface PrivacyPolicyScreenProps {
  onBack?: () => void;
  onAccept?: () => void;
}

export default function PrivacyPolicyScreen({
  onBack,
  onAccept,
}: PrivacyPolicyScreenProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const pulseValue = useSharedValue(1);
  const scaleValue = useSharedValue(0);

  useEffect(() => {
    // Logo pulse animation
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );

    // Initial scale animation
    scaleValue.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
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
    background: colorScheme === "dark" ? "#000000" : "#FAFAFA",
    surface: colorScheme === "dark" ? "#111827" : "#FFFFFF",
    shadow: colorScheme === "dark" ? "#000000" : "#00000020",
  };

  const privacyContent = [
    {
      title: "Information We Collect",
      content:
        "We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This may include your name, email address, and content you upload including music, videos, books, and memorial information.",
    },
    {
      title: "How We Use Your Information",
      content:
        "We use the information we collect to provide, maintain, and improve our services, process transactions, send communications, and personalize your experience with Mudaheranwa.",
    },
    {
      title: "Information Sharing",
      content:
        "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.",
    },
    {
      title: "Data Security",
      content:
        "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    },
    {
      title: "Your Rights",
      content:
        "You have the right to access, update, or delete your personal information. You can also opt out of certain communications and control how your information is used.",
    },
    {
      title: "Updates to Policy",
      content:
        "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Background gradient */}
      <LinearGradient
        colors={[
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.1)"
            : "rgba(114, 183, 233, 0.05)",
          "transparent",
          colorScheme === "dark"
            ? "rgba(114, 183, 233, 0.1)"
            : "rgba(114, 183, 233, 0.05)",
        ]}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <Animated.View
        entering={FadeInUp.duration(1000).springify()}
        style={styles.header}
      >
        <Animated.View
          style={[styles.logoContainer, pulseAnimatedStyle, scaleAnimatedStyle]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.logo}
          >
            <Text style={styles.logoText}>🔒</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.title, { color: colors.text }]}>
          Privacy Policy
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your privacy matters to us
        </Text>
      </Animated.View>

      {/* Content */}
      <Animated.View
        entering={FadeInDown.duration(800).delay(400)}
        style={styles.contentContainer}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, shadowColor: colors.shadow },
            ]}
          >
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
              Last updated: January 2025
            </Text>

            <Text style={[styles.introduction, { color: colors.text }]}>
              At Mudaheranwa, we respect your privacy and are committed to
              protecting your personal information. This Privacy Policy explains
              how we collect, use, and safeguard your data when you use our app.
            </Text>

            {privacyContent.map((section, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(600).delay(index * 100 + 800)}
                style={styles.section}
              >
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionContent, { color: colors.text }]}>
                  {section.content}
                </Text>
              </Animated.View>
            ))}

            <Animated.View
              entering={FadeInUp.duration(600).delay(1400)}
              style={styles.contactSection}
            >
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Contact Us
              </Text>
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                If you have any questions about this Privacy Policy, please
                contact us at privacy@mudaheranwa.com
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInUp.duration(800).delay(1000)}
        style={styles.buttonContainer}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.surface, shadowColor: colors.shadow },
          ]}
          onPress={() => onBack?.() || router.back()}
          activeOpacity={0.8}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>
            <Feather name="arrow-left" size={24}  /> Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptButton, { shadowColor: colors.primary }]}
          onPress={() => onBack?.() || router.back()}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.buttonGradient}
          >
            <Text style={styles.acceptButtonText}>Accept & Continue</Text>
            <Text style={styles.buttonIcon}>✓</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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

  // Header Section
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 0) + 30,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
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
    color: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "500",
  },

  // Content Section
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lastUpdated: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  introduction: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  contactSection: {
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(114, 183, 233, 0.2)",
  },

  // Button Section
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  acceptButton: {
    flex: 2,
    height: 50,
    borderRadius: 25,
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
    gap: 8,
  },
  acceptButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    fontSize: 16,
    color: "white",
  },
});
