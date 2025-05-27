import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Haptics,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import MtnIcon from "../../../assets/images/mtn.png"; // Ensure you have the correct path to your images
import AirtelIcon from "../../../assets/images/aitel.png"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#72b7e9",
  primaryLight: "#8fc5ed",
  primaryDark: "#5ca8d8",
  success: "#34c759",
  warning: "#ff9500",
  error: "#ff3b30",
  lightBg: "#f8fbff",
  darkBg: "#0a1a24",
  cardLight: "#ffffff",
  cardDark: "#1a2832",
  shadowColor: "#000",
  mtnYellow: "#FFCC00",
} as const;

const PAYMENT_METHODS = [
  {
    id: "mtn_mobile_money",
    name: "MTN Mobile Money",
    icon: "creditcard.fill",
    color: COLORS.mtnYellow,
    image: MtnIcon, // add this
    selected: true,
  },
  {
    id: "airtel_money",
    name: "Airtel Money",
    icon: "creditcard.fill",
    color: "#E60012",
    image: AirtelIcon,
    selected: false,
  },
  // {
  //   id: "card",
  //   name: "Credit/Debit Card",
  //   icon: "creditcard",
  //   color: COLORS.primary,
  //   selected: false,
  // },
];

export default function PaymentScreen({ navigation, route }) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  // Get plan details from route params (passed from subscription screen)
  const { plan, amount = "2,000 RWF" } = route?.params || {
    plan: { name: "Premium", price: "$9.99" },
    amount: "2,000 RWF",
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("mtn_mobile_money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodSelect = useCallback((methodId) => {
    Haptics?.selectionAsync?.();
    setSelectedPaymentMethod(methodId);
  }, []);

  const handlePhoneNumberChange = useCallback((text) => {
    // Format phone number and remove non-digits
    const cleaned = text.replace(/[^\d]/g, "");
    setPhoneNumber(cleaned);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    setIsProcessing(true);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Payment Initiated",
        `Please check your phone (${phoneNumber}) and enter your Mobile Money PIN to complete the payment of ${amount}.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to subscription screen or success screen
              navigation?.goBack?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Payment Failed", "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [phoneNumber, amount, navigation]);

  const selectedMethod = PAYMENT_METHODS.find(
    (m) => m.id === selectedPaymentMethod
  );

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconSymbol name="chevron.left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text
            style={[styles.headerTitle, { color: Colors[colorScheme].text }]}
          >
            Complete Payment
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Upgrade to {plan.name}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Payment Amount Card */}
        <View
          style={[
            styles.amountCard,
            { backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight },
          ]}
        >
          <Text
            style={[
              styles.amountLabel,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Total Amount
          </Text>
          <Text style={[styles.amountText, { color: COLORS.primary }]}>
            {amount}
          </Text>
          <Text
            style={[
              styles.planDetails,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            {plan.name} subscription - Monthly billing
          </Text>
        </View>

        {/* Payment Method Selection */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
        >
          How would you like to pay?
        </Text>

        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodCard,
              {
                backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight,
                borderColor:
                  selectedPaymentMethod === method.id
                    ? COLORS.primary
                    : "transparent",
                borderWidth: selectedPaymentMethod === method.id ? 2 : 0,
              },
            ]}
            onPress={() => handlePaymentMethodSelect(method.id)}
            accessibilityLabel={`Select ${method.name}`}
            accessibilityRole="radio"
            accessibilityState={{
              selected: selectedPaymentMethod === method.id,
            }}
          >
            <View style={styles.paymentMethodContent}>
              <View
                style={[
                  styles.paymentMethodIcon,
                  { backgroundColor: method.color + "20" },
                ]}
              >
                {method.image ? (
                  <Image
                    source={method.image}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                ) : (
                  <IconSymbol
                    name={method.icon}
                    size={24}
                    color={method.color}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.paymentMethodName,
                  { color: Colors[colorScheme].text },
                ]}
              >
                {method.name}
              </Text>
            </View>
            <View
              style={[
                styles.radioButton,
                {
                  borderColor:
                    selectedPaymentMethod === method.id
                      ? COLORS.primary
                      : Colors[colorScheme].secondaryText,
                },
              ]}
            >
              {selectedPaymentMethod === method.id && (
                <View
                  style={[
                    styles.radioButtonInner,
                    { backgroundColor: COLORS.primary },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Mobile Money Payment Details */}
        {selectedPaymentMethod === "mtn_mobile_money" && (
          <View
            style={[
              styles.paymentDetailsCard,
              { backgroundColor: isDark ? COLORS.cardDark : COLORS.cardLight },
            ]}
          >
            <Text
              style={[
                styles.paymentDetailsTitle,
                { color: Colors[colorScheme].text },
              ]}
            >
              Dial this on your MTN phone to pay:
            </Text>

            <View style={styles.ussdCodeContainer}>
              <View
                style={[
                  styles.ussdCodeBox,
                  { backgroundColor: COLORS.mtnYellow + "20" },
                ]}
              >
                <IconSymbol
                  name="phone.fill"
                  size={20}
                  color={COLORS.mtnYellow}
                />
                <Text style={[styles.ussdCode, { color: COLORS.mtnYellow }]}>
                  *182*3*7*2031006246#
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.orText,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Or just enter your MTN momo phone number to pay
            </Text>

            <View style={styles.phoneInputContainer}>
              <TextInput
                style={[
                  styles.phoneInput,
                  {
                    backgroundColor: isDark
                      ? COLORS.darkBg + "80"
                      : COLORS.lightBg + "80",
                    color: Colors[colorScheme].text,
                    borderColor: Colors[colorScheme].secondaryText + "30",
                  },
                ]}
                placeholder="ex. 0780000000"
                placeholderTextColor={Colors[colorScheme].secondaryText + "60"}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                maxLength={10}
                accessibilityLabel="Phone number input"
              />
            </View>
          </View>
        )}

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            {
              backgroundColor:
                phoneNumber.length >= 10 && !isProcessing
                  ? COLORS.success
                  : Colors[colorScheme].secondaryText + "40",
            },
          ]}
          onPress={handlePayment}
          disabled={phoneNumber.length < 10 || isProcessing}
          accessibilityLabel={`Pay ${amount}`}
          accessibilityRole="button"
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>Pay {amount}</Text>
          )}
        </TouchableOpacity>

        {/* Payment Info */}
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
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            After you press pay, you will be prompted to submit your Mobile
            Money PIN on your phone to complete the payment.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: "bold",
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
  amountCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
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
  amountLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  planDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentDetailsCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  paymentDetailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  ussdCodeContainer: {
    marginBottom: 20,
  },
  ussdCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  ussdCode: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    letterSpacing: 1,
  },
  orText: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  phoneInputContainer: {
    marginBottom: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  payButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
