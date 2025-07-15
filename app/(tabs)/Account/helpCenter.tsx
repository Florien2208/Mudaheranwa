import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Haptics,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enhanced color palette
const COLORS = {
  primary: "#007AFF",
  primaryLight: "#40A9FF",
  secondary: "#F0F8FF",
  accent: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  purple: "#AF52DE",
  orange: "#FF8C42",
  textPrimary: "#000000",
  textSecondary: "#8E8E93",
  textMuted: "#C7C7CC",
  lightBg: "#F2F2F7",
  darkBg: "#000000",
  cardLight: "#FFFFFF",
  cardDark: "#1C1C1E",
  borderLight: "#E5E5EA",
  borderDark: "#38383A",
} as const;

// Quick Action Button Component
const QuickActionButton = React.memo(
  ({ icon, title, onPress, color, isDark }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 20,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          className="items-center p-4 rounded-2xl flex-1 mx-1"
          style={{
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            borderWidth: 1,
            borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
          }}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View
            className="w-12 h-12 rounded-2xl justify-center items-center mb-2"
            style={{ backgroundColor: color }}
          >
            <IconSymbol name={icon} size={24} color="#FFFFFF" />
          </View>
          <Text
            className="text-sm font-medium text-center"
            style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
          >
            {title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// Enhanced FAQ Item Component
const FAQItem = React.memo(
  ({ question, answer, isDark, isExpanded, onToggle }) => {
    const rotateValue = useRef(new Animated.Value(0)).current;
    const heightValue = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(rotateValue, {
          toValue: isExpanded ? 1 : 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(heightValue, {
          toValue: isExpanded ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }, [isExpanded]);

    const rotateInterpolate = rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    return (
      <View
        className="mb-3 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
          borderWidth: 1,
          borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
        }}
      >
        <TouchableOpacity
          className="flex-row items-center justify-between p-4"
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text
            className="text-base font-semibold flex-1 mr-3"
            style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
          >
            {question}
          </Text>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <IconSymbol
              name="chevron.down"
              size={18}
              color={isDark ? COLORS.textMuted : COLORS.textSecondary}
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          style={{
            maxHeight: heightValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300],
            }),
            opacity: heightValue,
          }}
        >
          <View className="px-4 pb-4">
            <Text
              className="text-sm leading-6"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              {answer}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }
);

// Contact Support Card Component
const ContactSupportCard = React.memo(({ isDark }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!email.trim() || !message.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    Alert.alert(
      "Message Sent",
      "Thank you for contacting us. We'll respond within 24 hours.",
      [
        {
          text: "OK",
          onPress: () =>
            Haptics?.notificationAsync?.(
              Haptics.NotificationFeedbackType.Success
            ),
        },
      ]
    );

    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  }, [email, message]);

  return (
    <View
      className="rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
        borderWidth: 1,
        borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
      }}
    >
      <View className="flex-row items-center mb-4">
        <View
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
          style={{ backgroundColor: COLORS.primary }}
        >
          <IconSymbol name="envelope.fill" size={18} color="#FFFFFF" />
        </View>
        <Text
          className="text-lg font-bold"
          style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
        >
          Contact Support
        </Text>
      </View>

      <Text
        className="text-sm mb-4"
        style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
      >
        Can't find what you're looking for? Send us a message and we'll help you
        out.
      </Text>

      <TextInput
        className="border rounded-xl p-4 mb-3 text-base"
        style={{
          borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
          backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg,
          color: isDark ? "#FFFFFF" : COLORS.textPrimary,
        }}
        placeholder="Your email address"
        placeholderTextColor={isDark ? COLORS.textMuted : COLORS.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isSubmitting}
      />

      <TextInput
        className="border rounded-xl p-4 mb-4 text-base"
        style={{
          borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
          backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg,
          color: isDark ? "#FFFFFF" : COLORS.textPrimary,
          minHeight: 120,
          textAlignVertical: "top",
        }}
        placeholder="Describe your issue or question..."
        placeholderTextColor={isDark ? COLORS.textMuted : COLORS.textSecondary}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
        editable={!isSubmitting}
      />

      <TouchableOpacity
        className="rounded-xl p-4 items-center"
        style={{
          backgroundColor: isSubmitting ? COLORS.textMuted : COLORS.primary,
          opacity: isSubmitting ? 0.6 : 1,
        }}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text className="text-white text-base font-semibold">
          {isSubmitting ? "Sending..." : "Send Message"}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

// Main Component
export default function HelpSupportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Most important support features
  const quickActions = useMemo(
    () => [
      {
        icon: "phone.fill",
        title: "Call Support",
        color: COLORS.success,
        onPress: () => {
          Alert.alert(
            "Call Support",
            "Call our support team at +250 787 537 524 \nAvailable Mon-Fri 9AM-6PM",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Call Now",
                onPress: () => Linking.openURL("tel:+250787537524"),
              },
            ]
          );
        },
      },
      {
        icon: "message.fill",
        title: "Live Chat",
        color: COLORS.primary,
        onPress: () => {
          Alert.alert("Live Chat", "Redirecting to live chat...");
          // In a real app, this would open a chat interface
        },
      },
      {
        icon: "arrow.clockwise",
        title: "Reset Password",
        color: COLORS.orange,
        onPress: () => {
          Alert.alert(
            "Reset Password",
            "Go to login screen and tap 'Forgot Password' to reset your password.",
            [
              { text: "OK" },
              { text: "Go to Login", onPress: () => router.push("/(auth)/sign-in") },
            ]
          );
        },
      },
      {
        icon: "questionmark.circle.fill",
        title: "FAQ",
        color: COLORS.purple,
        onPress: () => {
          // Scroll to FAQ section
          Alert.alert("FAQ", "Scroll down to see frequently asked questions.");
        },
      },
    ],
    []
  );

  // Essential FAQs only
  const faqData = useMemo(
    () => [
      {
        id: 1,
        question: "How do I reset my password?",
        answer:
          "Tap 'Forgot Password' on the login screen, enter your email, and follow the instructions in the reset email we send you.",
      },
      {
        id: 2,
        question: "How do I become a verified artist?",
        answer:
          "Go to Profile → Settings → Verification. Submit your portfolio with at least 5 original works and a valid ID. Reviews take 3-5 business days.",
      },
      {
        id: 3,
        question: "What payment methods are accepted?",
        answer:
          "We accept all major credit cards, PayPal, Apple Pay, and Google Pay. All transactions are secured with bank-level encryption.",
      },
      {
        id: 4,
        question: "How do I report inappropriate content?",
        answer:
          "Tap the three dots (⋯) on any post, then select 'Report'. Choose the reason and we'll review it within 24 hours.",
      },
      {
        id: 5,
        question: "How do I delete my account?",
        answer:
          "Go to Settings → Privacy → Delete Account. This action is permanent and cannot be undone. All your data will be permanently removed.",
      },
    ],
    []
  );

  const handleFAQToggle = useCallback(
    (id) => {
      setExpandedFAQ(expandedFAQ === id ? null : id);
    },
    [expandedFAQ]
  );

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  }, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Enhanced Header */}
      <View
        className="flex-row items-center justify-between px-4 py-4"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: isDark ? COLORS.borderDark : COLORS.borderLight,
          backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
        }}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center"
          style={{
            backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg,
          }}
          onPress={handleGoBack}
        >
          <IconSymbol
            name="chevron.left"
            size={20}
            color={isDark ? "#FFFFFF" : COLORS.textPrimary}
          />
        </TouchableOpacity>

        <View className="items-center">
          <Text
            className="text-xl font-bold"
            style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
          >
            Help & Support
          </Text>
          <Text
            className="text-sm"
            style={{ color: isDark ? COLORS.textMuted : COLORS.textSecondary }}
          >
            We're here to help
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Quick Actions */}
        <View className="px-4 py-6">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
          >
            Quick Actions
          </Text>
          <View className="flex-row">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                icon={action.icon}
                title={action.title}
                color={action.color}
                onPress={action.onPress}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        {/* Contact Support */}
        <View className="px-4">
          <ContactSupportCard isDark={isDark} />
        </View>

        {/* FAQ Section */}
        <View className="px-4">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
          >
            Frequently Asked Questions
          </Text>

          {faqData.map((faq) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isDark={isDark}
              isExpanded={expandedFAQ === faq.id}
              onToggle={() => handleFAQToggle(faq.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
