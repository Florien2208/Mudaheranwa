import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

// FAQ Item Component
const FAQItem = React.memo(
  ({ question, answer, isDark, isExpanded, onToggle }) => {
    const rotateValue = useRef(new Animated.Value(0)).current;
    const heightValue = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.timing(rotateValue, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(heightValue, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isExpanded, rotateValue, heightValue]);

    const rotateInterpolate = rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    return (
      <View
        className="mb-3 rounded-xl overflow-hidden"
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
              elevation: 2,
            },
          }),
        }}
      >
        <TouchableOpacity
          className="flex-row items-center justify-between p-4"
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text
            className="text-base font-medium flex-1 mr-3"
            style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
          >
            {question}
          </Text>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <IconSymbol
              name="chevron.down"
              size={16}
              color={isDark ? COLORS.textMuted : COLORS.textSecondary}
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          style={{
            maxHeight: heightValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
            opacity: heightValue,
          }}
        >
          <View className="px-4 pb-4">
            <Text
              className="text-sm leading-5"
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

// Contact Option Component
const ContactOption = React.memo(
  ({ icon, title, subtitle, onPress, iconColor, isDark }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Haptics?.selectionAsync?.();
      Animated.spring(scaleValue, {
        toValue: 0.98,
        ...ANIMATION_CONFIG.spring,
      }).start();
    }, [scaleValue]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleValue, {
        toValue: 1,
        ...ANIMATION_CONFIG.spring,
      }).start();
    }, [scaleValue]);

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          className="flex-row items-center p-4 mb-3 rounded-xl"
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
                elevation: 2,
              },
            }),
          }}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <View
            className="w-12 h-12 rounded-xl justify-center items-center mr-4"
            style={{ backgroundColor: iconColor }}
          >
            <IconSymbol name={icon} size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-medium mb-1"
              style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
            >
              {title}
            </Text>
            <Text
              className="text-sm"
              style={{
                color: isDark ? COLORS.textMuted : COLORS.textSecondary,
              }}
            >
              {subtitle}
            </Text>
          </View>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={isDark ? COLORS.textMuted : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// Message Form Component
const MessageForm = React.memo(({ isDark, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = useCallback(() => {
    if (!message.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    onSubmit({ message: message.trim(), email: email.trim() });
    setMessage("");
    setEmail("");
  }, [message, email, onSubmit]);

  return (
    <View
      className="rounded-xl p-4 mb-4"
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
            elevation: 2,
          },
        }),
      }}
    >
      <Text
        className="text-lg font-semibold mb-4"
        style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
      >
        Send us a message
      </Text>

      <TextInput
        className="border rounded-lg p-3 mb-3 text-base"
        style={{
          borderColor: isDark ? COLORS.textMuted + "40" : Colors.light.border,
          backgroundColor: isDark ? COLORS.darkBg : "#FFFFFF",
          color: isDark ? "#FFFFFF" : COLORS.textPrimary,
        }}
        placeholder="Your email"
        placeholderTextColor={isDark ? COLORS.textMuted : COLORS.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        className="border rounded-lg p-3 mb-4 text-base"
        style={{
          borderColor: isDark ? COLORS.textMuted + "40" : Colors.light.border,
          backgroundColor: isDark ? COLORS.darkBg : "#FFFFFF",
          color: isDark ? "#FFFFFF" : COLORS.textPrimary,
          minHeight: 100,
          textAlignVertical: "top",
        }}
        placeholder="Describe your issue or question..."
        placeholderTextColor={isDark ? COLORS.textMuted : COLORS.textSecondary}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        className="rounded-lg p-3 items-center"
        style={{ backgroundColor: COLORS.primary }}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text className="text-white text-base font-semibold">Send Message</Text>
      </TouchableOpacity>
    </View>
  );
});

FAQItem.displayName = "FAQItem";
ContactOption.displayName = "ContactOption";
MessageForm.displayName = "MessageForm";

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = useMemo(
    () => [
      {
        id: 1,
        question: "How do I reset my password?",
        answer:
          "Go to the login screen and tap 'Forgot Password'. Enter your email address and we'll send you a reset link.",
      },
      {
        id: 2,
        question: "How can I become a verified artist?",
        answer:
          "Submit your portfolio through the app. Our team reviews applications within 5-7 business days. You'll need at least 5 original artworks and a valid ID.",
      },
      {
        id: 3,
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, PayPal, Apple Pay, and Google Pay. Payments are processed securely through our encrypted payment system.",
      },
      {
        id: 4,
        question: "How do I delete my account?",
        answer:
          "Go to Settings > Privacy Settings > Delete Account. Please note this action is permanent and cannot be undone.",
      },
      {
        id: 5,
        question: "Why can't I upload my artwork?",
        answer:
          "Make sure your image is under 10MB and in JPG or PNG format. Check your internet connection and try again.",
      },
    ],
    []
  );

  const contactOptions = useMemo(
    () => [
      {
        icon: "envelope.fill",
        title: "Email Support",
        subtitle: "Get help within 24 hours",
        iconColor: COLORS.primary,
        onPress: () => Linking.openURL("mailto:support@artapp.com"),
      },
      {
        icon: "phone.fill",
        title: "Phone Support",
        subtitle: "Call us Mon-Fri 9AM-6PM",
        iconColor: COLORS.success,
        onPress: () => Linking.openURL("tel:+1234567890"),
      },
      {
        icon: "message.fill",
        title: "Live Chat",
        subtitle: "Chat with our support team",
        iconColor: COLORS.orange,
        onPress: () =>
          Alert.alert("Live Chat", "Live chat feature coming soon!"),
      },
      {
        icon: "questionmark.circle.fill",
        title: "Community Forum",
        subtitle: "Get help from other users",
        iconColor: COLORS.purple,
        onPress: () => Linking.openURL("https://community.artapp.com"),
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

  const handleMessageSubmit = useCallback(({ message, email }) => {
    // Here you would typically send the message to your backend
    Alert.alert(
      "Message Sent",
      "Thank you for your message. We'll get back to you within 24 hours.",
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
  }, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{
          borderBottomColor: isDark
            ? COLORS.textMuted + "20"
            : Colors.light.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full justify-center items-center"
        >
          <IconSymbol
            name="chevron.left"
            size={20}
            color={isDark ? "#FFFFFF" : COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold"
          style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
        >
          Help & Support
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {/* Contact Options */}
        <Text
          className="text-lg font-semibold mb-4"
          style={{ color: isDark ? "#FFFFFF" : COLORS.textPrimary }}
        >
          Get in Touch
        </Text>

        {contactOptions.map((option, index) => (
          <ContactOption key={index} {...option} isDark={isDark} />
        ))}

        {/* Message Form */}
        <MessageForm isDark={isDark} onSubmit={handleMessageSubmit} />

        {/* FAQ Section */}
        <Text
          className="text-lg font-semibold mb-4 mt-2"
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

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
