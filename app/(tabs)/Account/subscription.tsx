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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Haptics,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
} as const;

// Subscription plans data
const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    color: COLORS.secondary,
    features: [
      "Browse artworks",
      "Basic search",
      "Save favorites (up to 10)",
      "Community access",
    ],
    limitations: [
      "Limited artwork uploads (2 per month)",
      "No premium features",
      "Basic support only",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    period: "month",
    color: COLORS.primary,
    popular: true,
    features: [
      "Unlimited artwork uploads",
      "Advanced analytics",
      "Priority support",
      "Exclusive content access",
      "Advanced search filters",
      "HD artwork downloads",
      "Remove watermarks",
    ],
    limitations: [],
  },
  {
    id: "artist_pro",
    name: "Artist Pro",
    price: "$19.99",
    period: "month",
    color: COLORS.accent,
    features: [
      "Everything in Premium",
      "Commission marketplace access",
      "Portfolio website builder",
      "Advanced sales analytics",
      "Custom branding options",
      "Direct client messaging",
      "Exhibition opportunities",
      "NFT minting tools",
    ],
    limitations: [],
    badge: "Best for Artists",
  },
];

// Current Subscription Card Component
const CurrentSubscriptionCard = React.memo(
  ({ subscription, colorScheme, isDark, onManage }) => {
    const currentPlan =
      SUBSCRIPTION_PLANS.find((plan) => plan.id === subscription.planId) ||
      SUBSCRIPTION_PLANS[0];

    return (
      <View
        style={[
          styles.currentSubscriptionCard,
          {
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            shadowColor: COLORS.shadowColor,
          },
        ]}
      >
        <View style={styles.currentSubscriptionHeader}>
          <View style={styles.currentPlanInfo}>
            <Text
              style={[
                styles.currentPlanTitle,
                {
                  color: isDark
                    ? COLORS.textDarkSecondary
                    : COLORS.textSecondary,
                },
              ]}
            >
              Current Plan
            </Text>
            <View style={styles.currentPlanNameContainer}>
              <Text
                style={[styles.currentPlanName, { color: currentPlan.color }]}
              >
                {currentPlan.name}
              </Text>
              {currentPlan.popular && (
                <View
                  style={[
                    styles.popularBadge,
                    { backgroundColor: COLORS.primary },
                  ]}
                >
                  <Text style={styles.popularBadgeText}>Popular</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.currentPlanDetails,
                {
                  color: isDark
                    ? COLORS.textDarkSecondary
                    : COLORS.textSecondary,
                },
              ]}
            >
              {currentPlan.price}/{currentPlan.period}
            </Text>
          </View>
          <View
            style={[
              styles.planIcon,
              { backgroundColor: currentPlan.color + "20" },
            ]}
          >
            <IconSymbol
              name={
                currentPlan.id === "free"
                  ? "person.circle"
                  : currentPlan.id === "premium"
                  ? "star.fill"
                  : "crown.fill"
              }
              size={24}
              color={currentPlan.color}
            />
          </View>
        </View>

        {subscription.status && (
          <View style={styles.subscriptionStatus}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    subscription.status === "active"
                      ? COLORS.success
                      : COLORS.warning,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </Text>
            </View>
            {subscription.nextBillingDate && (
              <Text
                style={[
                  styles.billingInfo,
                  {
                    color: isDark
                      ? COLORS.textDarkSecondary
                      : COLORS.textSecondary,
                  },
                ]}
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
          style={[
            styles.manageButton,
            {
              backgroundColor: isDark
                ? COLORS.primary + "20"
                : COLORS.primary + "15",
              borderColor: COLORS.primary + "40",
            },
          ]}
          onPress={onManage}
          accessibilityLabel="Manage subscription"
          accessibilityRole="button"
        >
          <IconSymbol name="gear" size={16} color={COLORS.primary} />
          <Text style={[styles.manageButtonText, { color: COLORS.primary }]}>
            Manage Subscription
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

// Subscription Plan Card Component
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
        style={[
          styles.subscriptionPlanCard,
          {
            backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
            shadowColor: COLORS.shadowColor,
            borderColor: isCurrentPlan ? plan.color + "60" : "transparent",
            borderWidth: isCurrentPlan ? 2 : 0,
          },
          plan.popular && styles.popularCard,
        ]}
        onPress={handleSelect}
        disabled={isCurrentPlan}
        accessibilityLabel={`${plan.name} subscription plan`}
        accessibilityRole="button"
        accessibilityState={{ selected: isCurrentPlan }}
      >
        {plan.popular && (
          <View
            style={[styles.popularLabel, { backgroundColor: COLORS.primary }]}
          >
            <Text style={styles.popularLabelText}>Most Popular</Text>
          </View>
        )}

        {plan.badge && (
          <View style={[styles.planBadge, { backgroundColor: plan.color }]}>
            <Text style={styles.planBadgeText}>{plan.badge}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View
            style={[
              styles.planIconContainer,
              { backgroundColor: plan.color + "20" },
            ]}
          >
            <IconSymbol
              name={
                plan.id === "free"
                  ? "person.circle"
                  : plan.id === "premium"
                  ? "star.fill"
                  : "crown.fill"
              }
              size={28}
              color={plan.color}
            />
          </View>
          <Text
            style={[
              styles.planName,
              { color: isDark ? COLORS.textDarkPrimary : COLORS.textPrimary },
            ]}
          >
            {plan.name}
          </Text>
          <View style={styles.planPricing}>
            <Text style={[styles.planPrice, { color: plan.color }]}>
              {plan.price}
            </Text>
            <Text
              style={[
                styles.planPeriod,
                {
                  color: isDark
                    ? COLORS.textDarkSecondary
                    : COLORS.textSecondary,
                },
              ]}
            >
              /{plan.period}
            </Text>
          </View>
        </View>

        <View style={styles.planFeatures}>
          <Text
            style={[
              styles.featuresTitle,
              { color: isDark ? COLORS.textDarkPrimary : COLORS.textPrimary },
            ]}
          >
            Features:
          </Text>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={16}
                color={COLORS.success}
              />
              <Text
                style={[
                  styles.featureText,
                  {
                    color: isDark ? COLORS.textDarkPrimary : COLORS.textPrimary,
                  },
                ]}
              >
                {feature}
              </Text>
            </View>
          ))}

          {plan.limitations.length > 0 && (
            <>
              <Text
                style={[
                  styles.limitationsTitle,
                  {
                    color: isDark
                      ? COLORS.textDarkSecondary
                      : COLORS.textSecondary,
                  },
                ]}
              >
                Limitations:
              </Text>
              {plan.limitations.map((limitation, index) => (
                <View key={index} style={styles.limitationItem}>
                  <IconSymbol
                    name="xmark.circle"
                    size={16}
                    color={COLORS.error}
                  />
                  <Text
                    style={[
                      styles.limitationText,
                      {
                        color: isDark
                          ? COLORS.textDarkSecondary
                          : COLORS.textSecondary,
                      },
                    ]}
                  >
                    {limitation}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.planFooter}>
          <TouchableOpacity
            style={[
              styles.selectButton,
              isCurrentPlan
                ? {
                    backgroundColor:
                      (isDark
                        ? COLORS.textDarkSecondary
                        : COLORS.textSecondary) + "20",
                  }
                : { backgroundColor: plan.color },
            ]}
            onPress={handleSelect}
            disabled={isCurrentPlan}
            accessibilityLabel={
              isCurrentPlan ? "Current plan" : `Select ${plan.name} plan`
            }
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.selectButtonText,
                {
                  color: isCurrentPlan
                    ? isDark
                      ? COLORS.textDarkSecondary
                      : COLORS.textSecondary
                    : "#FFFFFF",
                },
              ]}
            >
              {isCurrentPlan ? "Current Plan" : `Choose ${plan.name}`}
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
      `Would you like to upgrade to ${plan.name} for ${plan.price}/${plan.period}?`,
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
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation && navigation.goBack && navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconSymbol name="chevron.left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: COLORS.primary }]}>
            Subscription
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: isDark ? COLORS.textDarkSecondary : COLORS.textSecondary,
              },
            ]}
          >
            Manage your subscription and billing
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Subscription */}
        <CurrentSubscriptionCard
          subscription={currentSubscription}
          colorScheme={colorScheme}
          isDark={isDark}
          onManage={handleManageSubscription}
        />

        {/* Available Plans */}
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? COLORS.textDarkPrimary : COLORS.textPrimary },
          ]}
        >
          Available Plans
        </Text>

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

        {/* Additional Info */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight },
          ]}
        >
          <IconSymbol name="info.circle" size={20} color={COLORS.primary} />
          <Text
            style={[
              styles.infoText,
              {
                color: isDark ? COLORS.textDarkSecondary : COLORS.textSecondary,
              },
            ]}
          >
            You can upgrade, downgrade, or cancel your subscription at any time.
            Changes will take effect at the next billing cycle.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
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
  currentSubscriptionCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
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
  currentSubscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanTitle: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
    marginBottom: 4,
  },
  currentPlanNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  currentPlanDetails: {
    fontSize: 16,
    opacity: 0.7,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  subscriptionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  billingInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  subscriptionPlanCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    position: "relative",
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
  popularCard: {
    borderWidth: 2,
    borderColor: COLORS.primary + "40",
  },
  popularLabel: {
    position: "absolute",
    top: -1,
    left: 20,
    right: 20,
    paddingVertical: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  popularLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  planBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  planHeader: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  planPricing: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
  },
  planPeriod: {
    fontSize: 16,
    opacity: 0.7,
  },
  planFeatures: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  limitationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },
  limitationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  limitationText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    opacity: 0.7,
  },
  planFooter: {
    alignItems: "center",
  },
  selectButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
