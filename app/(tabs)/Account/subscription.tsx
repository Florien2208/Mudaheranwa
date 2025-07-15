import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback, useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Haptics,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  primary: "#2563eb", // Rich blue
  primaryLight: "#3b82f6", // Lighter blue
  primaryDark: "#1d4ed8", // Darker blue
  secondary: "#64748b", // Slate gray
  accent: "#6366f1", // Indigo
  success: "#10b981", // Emerald
  warning: "#f59e0b", // Amber
  error: "#ef4444", // Red
  lightBg: "#f8fafc", // Very light blue-gray
  darkBg: "#0f172a", // Dark slate
  cardLight: "#ffffff",
  cardDark: "#1e293b", // Dark slate
  shadowColor: "#000",
  overlay: "rgba(0, 0, 0, 0.6)",
  gold: "#f59e0b", // Amber instead of gold
  platinum: "#94a3b8", // Slate gray
  textPrimary: "#1e293b", // Dark slate for light mode
  textSecondary: "#64748b", // Medium slate
  textDarkPrimary: "#f1f5f9", // Light for dark mode
  textDarkSecondary: "#94a3b8", // Medium slate for dark mode
  gradient: {
    primary: ["#2563eb", "#3b82f6"],
    secondary: ["#64748b", "#475569"],
    accent: ["#6366f1", "#8b5cf6"],
    success: ["#10b981", "#059669"],
    premium: ["#f59e0b", "#d97706"],
  },
} as const;

// Subscription plans data with RWF pricing
const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    currency: "RWF",
    period: "forever",
    color: COLORS.secondary,
    gradient: COLORS.gradient.secondary,
    features: [
      "Browse artworks",
      "Basic search functionality",
      "Save favorites (up to 10)",
      "Community access",
      "Basic profile creation",
    ],
    limitations: [
      "Limited artwork uploads (2 per month)",
      "No premium features access",
      "Basic support only",
      "Watermarked downloads",
    ],
    icon: "person.circle",
  },
  {
    id: "premium",
    name: "Premium",
    price: "12,500",
    currency: "RWF",
    period: "month",
    color: COLORS.primary,
    gradient: COLORS.gradient.primary,
    popular: true,
    features: [
      "Unlimited artwork uploads",
      "Advanced analytics dashboard",
      "Priority customer support",
      "Exclusive content access",
      "Advanced search filters",
      "HD artwork downloads",
      "Remove all watermarks",
      "Custom artwork collections",
      "Export portfolio as PDF",
    ],
    limitations: [],
    icon: "star.fill",
    savings: "Save 15% vs monthly",
  },
  {
    id: "artist_pro",
    name: "Artist Pro",
    price: "25,000",
    currency: "RWF",
    period: "month",
    color: COLORS.accent,
    gradient: COLORS.gradient.accent,
    features: [
      "Everything in Premium",
      "Commission marketplace access",
      "Portfolio website builder",
      "Advanced sales analytics",
      "Custom branding options",
      "Direct client messaging",
      "Exhibition opportunities",
      "NFT minting tools",
      "Revenue tracking",
      "Tax report generation",
      "API access for integrations",
    ],
    limitations: [],
    badge: "Best for Artists",
    icon: "crown.fill",
    savings: "Most comprehensive",
  },
];

// Enhanced Current Subscription Card Component
const CurrentSubscriptionCard = React.memo(
  ({ subscription, colorScheme, isDark, onManage }) => {
    const currentPlan =
      SUBSCRIPTION_PLANS.find((plan) => plan.id === subscription.planId) ||
      SUBSCRIPTION_PLANS[0];

    return (
      <View
        className={`${isDark ? "bg-slate-800/90" : "bg-white"} rounded-2xl p-5 mb-6 shadow-lg border ${isDark ? "border-slate-700" : "border-slate-200"}`}
        style={{
          shadowColor: COLORS.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text
              className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Current Plan
            </Text>
            <View className="flex-row items-center mb-2">
              <Text
                className="text-xl font-bold mr-3"
                style={{ color: currentPlan.color }}
              >
                {currentPlan.name}
              </Text>
              {currentPlan.popular && (
                <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">Popular</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-baseline">
              <Text
                className="text-lg font-bold"
                style={{ color: currentPlan.color }}
              >
                {currentPlan.price === "0"
                  ? "Free"
                  : `${currentPlan.price} ${currentPlan.currency}`}
              </Text>
              {currentPlan.price !== "0" && (
                <Text
                  className={`text-sm ml-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  /{currentPlan.period}
                </Text>
              )}
            </View>
          </View>
          <View
            className="w-14 h-14 rounded-2xl justify-center items-center"
            style={{ backgroundColor: currentPlan.color + "20" }}
          >
            <IconSymbol
              name={currentPlan.icon}
              size={24}
              color={currentPlan.color}
            />
          </View>
        </View>

        {subscription.status && (
          <View className="flex-row items-center justify-between mb-4">
            <View
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  subscription.status === "active"
                    ? COLORS.success
                    : subscription.status === "canceled"
                      ? COLORS.warning
                      : COLORS.error,
              }}
            >
              <Text className="text-white text-xs font-bold">
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </Text>
            </View>
            {subscription.nextBillingDate && (
              <Text
                className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {subscription.status === "active"
                  ? "Next billing: "
                  : "Expires: "}
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          className={`flex-row items-center justify-center p-4 rounded-xl border-2 ${
            isDark
              ? "bg-blue-600/10 border-blue-600/30"
              : "bg-blue-50 border-blue-200"
          }`}
          onPress={onManage}
          accessibilityLabel="Manage subscription"
          accessibilityRole="button"
        >
          <IconSymbol name="gear" size={16} color={COLORS.primary} />
          <Text className="text-blue-600 text-sm font-bold ml-2">
            Manage Subscription
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

// Enhanced Subscription Plan Card Component
const SubscriptionPlanCard = React.memo(
  ({ plan, colorScheme, isDark, isCurrentPlan, onSelect }) => {
    const handleSelect = useCallback(() => {
      if (!isCurrentPlan) {
        Haptics?.selectionAsync?.();
        onSelect(plan);
      }
    }, [plan, isCurrentPlan, onSelect]);

    return (
      <TouchableOpacity
        className={`relative rounded-2xl p-6 mb-4 ${
          isDark ? "bg-slate-800/90" : "bg-white"
        } ${isCurrentPlan ? "border-2" : "border"} ${
          isDark ? "border-slate-700" : "border-slate-200"
        }`}
        style={{
          borderColor: isCurrentPlan ? plan.color : undefined,
          shadowColor: COLORS.shadowColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
        onPress={handleSelect}
        disabled={isCurrentPlan}
        accessibilityLabel={`${plan.name} subscription plan`}
        accessibilityRole="button"
        accessibilityState={{ selected: isCurrentPlan }}
      >
        {plan.popular && (
          <View className="absolute -top-px left-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 py-2 rounded-t-2xl items-center">
            <Text className="text-white text-xs font-bold">
              🔥 Most Popular
            </Text>
          </View>
        )}

        {plan.badge && (
          <View
            className="absolute top-4 right-4 px-3 py-1 rounded-full"
            style={{ backgroundColor: plan.color }}
          >
            <Text className="text-white text-xs font-bold">{plan.badge}</Text>
          </View>
        )}

        <View className={`items-center mb-6 ${plan.popular ? "mt-4" : ""}`}>
          <View
            className="w-16 h-16 rounded-2xl justify-center items-center mb-3"
            style={{ backgroundColor: plan.color + "20" }}
          >
            <IconSymbol name={plan.icon} size={28} color={plan.color} />
          </View>
          <Text
            className={`text-xl font-bold mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}
          >
            {plan.name}
          </Text>
          <View className="flex-row items-baseline mb-2">
            <Text className="text-3xl font-bold" style={{ color: plan.color }}>
              {plan.price === "0" ? "Free" : plan.price}
            </Text>
            {plan.price !== "0" && (
              <>
                <Text
                  className={`text-sm ml-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  {plan.currency}
                </Text>
                <Text
                  className={`text-sm ml-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  /{plan.period}
                </Text>
              </>
            )}
          </View>
          {plan.savings && (
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-800 text-xs font-semibold">
                {plan.savings}
              </Text>
            </View>
          )}
        </View>

        <View className="mb-6">
          <Text
            className={`text-sm font-bold mb-3 ${isDark ? "text-slate-100" : "text-slate-900"}`}
          >
            ✨ Features:
          </Text>
          {plan.features.map((feature, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View className="w-5 h-5 rounded-full bg-green-100 items-center justify-center mr-3">
                <IconSymbol name="checkmark" size={12} color={COLORS.success} />
              </View>
              <Text
                className={`text-sm flex-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}
              >
                {feature}
              </Text>
            </View>
          ))}

          {plan.limitations.length > 0 && (
            <>
              <Text
                className={`text-sm font-bold mb-3 mt-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                ⚠️ Limitations:
              </Text>
              {plan.limitations.map((limitation, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <View className="w-5 h-5 rounded-full bg-red-100 items-center justify-center mr-3">
                    <IconSymbol name="xmark" size={12} color={COLORS.error} />
                  </View>
                  <Text
                    className={`text-sm flex-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {limitation}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View className="items-center">
          <TouchableOpacity
            className={`w-full py-4 rounded-xl items-center ${
              isCurrentPlan
                ? `${isDark ? "bg-slate-600/20" : "bg-slate-100"}`
                : ""
            }`}
            style={{
              backgroundColor: isCurrentPlan ? undefined : plan.color,
            }}
            onPress={handleSelect}
            disabled={isCurrentPlan}
            accessibilityLabel={
              isCurrentPlan ? "Current plan" : `Select ${plan.name} plan`
            }
            accessibilityRole="button"
          >
            <Text
              className={`text-base font-bold ${
                isCurrentPlan
                  ? `${isDark ? "text-slate-400" : "text-slate-600"}`
                  : "text-white"
              }`}
            >
              {isCurrentPlan ? "✅ Current Plan" : `Choose ${plan.name}`}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);

// Main Component
export default function SubscriptionScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  // Mock subscription data - replace with actual data from your store/API
  const [currentSubscription] = useState({
    planId: "free", // or "premium", "artist_pro"
    status: "active", // "active", "canceled", "expired"
    nextBillingDate: "2024-07-15T00:00:00Z",
  });

  const handlePlanSelect = useCallback((plan) => {
    Alert.alert(
      "Upgrade Subscription",
      `Would you like to upgrade to ${plan.name} for ${plan.price} ${plan.currency}/${plan.period}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            router.push("/Account/payment");
          },
        },
      ]
    );
  }, []);

  const handleManageSubscription = useCallback(() => {
    Alert.alert("Manage Subscription", "Choose an action:", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Update Payment",
        onPress: () => {
          console.log("Update payment method");
          // navigation.navigate("PaymentMethods");
        },
      },
      {
        text: "Cancel Subscription",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Cancel Subscription",
            "Are you sure you want to cancel your subscription? You'll lose access to premium features.",
            [
              { text: "Keep Subscription", style: "cancel" },
              {
                text: "Cancel",
                style: "destructive",
                onPress: () => {
                  console.log("Subscription canceled");
                  Alert.alert(
                    "Subscription Canceled",
                    "Your subscription has been canceled."
                  );
                },
              },
            ]
          );
        },
      },
    ]);
  }, []);

  return (
    <View className={`flex-1 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Enhanced Header */}
      <View
        className={`${isDark ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-lg`}
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 mr-4 rounded-full"
            style={{ backgroundColor: COLORS.primary + "20" }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <IconSymbol name="chevron.left" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-blue-600">
              💎 Subscription
            </Text>
            <Text
              className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Choose the perfect plan for your needs
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        {/* Current Subscription */}
        <CurrentSubscriptionCard
          subscription={currentSubscription}
          colorScheme={colorScheme}
          isDark={isDark}
          onManage={handleManageSubscription}
        />

        {/* Available Plans */}
        <View className="mb-4">
          <Text
            className={`text-2xl font-bold mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}
          >
            🚀 Available Plans
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
          >
            Unlock your creative potential with our premium features
          </Text>
        </View>

        {SUBSCRIPTION_PLANS.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            colorScheme={colorScheme}
            isDark={isDark}
            isCurrentPlan={currentSubscription.planId === plan.id}
            onSelect={handlePlanSelect}
          />
        ))}

        {/* Enhanced Additional Info */}
        <View
          className={`p-5 rounded-2xl mt-4 border ${
            isDark
              ? "bg-slate-800/90 border-slate-700"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
              <IconSymbol name="info.circle" size={20} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`}
              >
                💡 Subscription Benefits
              </Text>
              <Text
                className={`text-sm leading-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                • Upgrade, downgrade, or cancel anytime{"\n"}• Changes take
                effect at next billing cycle{"\n"}• All prices are in Rwandan
                Francs (RWF){"\n"}• Secure payment processing{"\n"}• 30-day
                money-back guarantee
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Indicators */}
        <View className="flex-row justify-center items-center mt-6 space-x-6">
          <View className="items-center">
            <IconSymbol
              name="shield.checkered"
              size={24}
              color={COLORS.success}
            />
            <Text
              className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Secure
            </Text>
          </View>
          <View className="items-center">
            <IconSymbol
              name="arrow.clockwise"
              size={24}
              color={COLORS.primary}
            />
            <Text
              className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Cancel Anytime
            </Text>
          </View>
          <View className="items-center">
            <IconSymbol
              name="checkmark.seal"
              size={24}
              color={COLORS.warning}
            />
            <Text
              className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Guaranteed
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
