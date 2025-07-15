import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
  Platform,
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
import MtnIcon from "../../../assets/images/mtn.png";
import AirtelIcon from "../../../assets/images/aitel.png";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  image?: any;
  selected: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "mtn_mobile_money",
    name: "MTN Mobile Money",
    icon: "creditcard.fill",
    color: "#FFCC00",
    image: MtnIcon,
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
];

interface PaymentScreenProps {
  navigation: any;
  route: any;
}

export default function PaymentScreen({
  navigation,
  route,
}: PaymentScreenProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  // Get plan details from route params
  const { plan, amount = "2,000 RWF" } = route?.params || {
    plan: { name: "Premium", price: "$9.99" },
    amount: "2,000 RWF",
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("mtn_mobile_money");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handlePaymentMethodSelect = useCallback((methodId: string) => {
    Haptics?.selectionAsync?.();
    setSelectedPaymentMethod(methodId);
  }, []);

  const handlePhoneNumberChange = useCallback((text: string) => {
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
      className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ paddingTop: insets.top }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          className="mr-4"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <View
            className={`w-10 h-10 rounded-full justify-center items-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
          >
            <IconSymbol
              name="chevron.left"
              size={20}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </View>
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-black"}`}
          >
            Complete Payment
          </Text>
          <Text
            className={`text-base font-medium mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Upgrade to {plan.name}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Payment Amount Card */}
        <View
          className={`rounded-3xl p-8 mb-8 items-center border ${
            isDark
              ? "bg-gray-900 border-gray-700 shadow-lg"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <Text
            className={`text-base font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Total Amount
          </Text>
          <Text
            className={`text-4xl font-extrabold mb-2 tracking-tight ${isDark ? "text-white" : "text-black"}`}
          >
            {amount}
          </Text>
          <Text
            className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {plan.name} subscription • Monthly billing
          </Text>
        </View>

        {/* Payment Method Selection */}
        <Text
          className={`text-xl font-bold mb-5 tracking-tight ${isDark ? "text-white" : "text-black"}`}
        >
          Select Payment Method
        </Text>

        <View className="mb-6">
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center justify-between rounded-2xl p-5 mb-4 border-2 ${
                selectedPaymentMethod === method.id
                  ? isDark
                    ? "bg-gray-900 border-white"
                    : "bg-white border-black"
                  : isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
              } ${Platform.OS === "ios" ? "shadow-sm" : "elevation-1"}`}
              onPress={() => handlePaymentMethodSelect(method.id)}
              accessibilityLabel={`Select ${method.name}`}
              accessibilityRole="radio"
              accessibilityState={{
                selected: selectedPaymentMethod === method.id,
              }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-13 h-13 rounded-full justify-center items-center mr-4 ${
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  {method.image ? (
                    <Image
                      source={method.image}
                      className="w-7 h-7"
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
                  className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  {method.name}
                </Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                  selectedPaymentMethod === method.id
                    ? isDark
                      ? "border-white"
                      : "border-black"
                    : isDark
                      ? "border-gray-400"
                      : "border-gray-600"
                }`}
              >
                {selectedPaymentMethod === method.id && (
                  <View
                    className={`w-3 h-3 rounded-full ${isDark ? "bg-white" : "bg-black"}`}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mobile Money Payment Details */}
        {selectedPaymentMethod === "mtn_mobile_money" && (
          <View
            className={`rounded-2xl p-6 mb-8 border ${
              isDark
                ? "bg-gray-900 border-gray-700 shadow-lg"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <Text
              className={`text-lg font-bold mb-5 ${isDark ? "text-white" : "text-black"}`}
            >
              Quick Payment Options
            </Text>

            <View className="mb-6">
              <View
                className={`flex-row items-center justify-center p-5 rounded-2xl border ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <IconSymbol
                  name="phone.fill"
                  size={20}
                  color={isDark ? "#FFFFFF" : "#000000"}
                />
                <Text
                  className={`text-lg font-bold ml-3 tracking-wide ${isDark ? "text-white" : "text-black"}`}
                >
                  *182*3*7*2031006246#
                </Text>
              </View>
              <Text
                className={`text-sm font-medium mt-3 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Dial this code on your MTN phone
              </Text>
            </View>

            <View className="flex-row items-center mb-6">
              <View
                className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
              />
              <Text
                className={`text-sm font-semibold px-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                OR
              </Text>
              <View
                className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
              />
            </View>

            <Text
              className={`text-base font-semibold mb-3 ${isDark ? "text-white" : "text-black"}`}
            >
              Enter your MTN Mobile Money number
            </Text>

            <View className="mb-2">
              <TextInput
                className={`border rounded-2xl p-4 text-base font-semibold ${
                  isDark
                    ? "bg-black text-white border-gray-700"
                    : "bg-gray-50 text-black border-gray-200"
                }`}
                placeholder="078 000 0000"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
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
          className={`rounded-2xl py-5 items-center mb-6 ${
            phoneNumber.length >= 10 && !isProcessing
              ? isDark
                ? "bg-white shadow-lg"
                : "bg-black shadow-lg"
              : isDark
                ? "bg-gray-800"
                : "bg-gray-300"
          } ${Platform.OS === "ios" ? "shadow-lg" : "elevation-2"}`}
          onPress={handlePayment}
          disabled={phoneNumber.length < 10 || isProcessing}
          accessibilityLabel={`Pay ${amount}`}
          accessibilityRole="button"
        >
          {isProcessing ? (
            <View className="flex-row items-center">
              <Text
                className={`text-lg font-bold tracking-tight ${
                  isDark ? "text-black" : "text-white"
                }`}
              >
                Processing...
              </Text>
            </View>
          ) : (
            <Text
              className={`text-lg font-bold tracking-tight ${
                phoneNumber.length >= 10
                  ? isDark
                    ? "text-black"
                    : "text-white"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-600"
              }`}
            >
              Pay {amount}
            </Text>
          )}
        </TouchableOpacity>

        {/* Payment Info */}
        <View
          className={`flex-row p-5 rounded-2xl items-start border ${
            isDark
              ? "bg-gray-900 border-gray-700 shadow-lg"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <IconSymbol
            name="info.circle"
            size={20}
            color={isDark ? "#FFFFFF" : "#000000"}
          />
          <Text
            className={`text-sm font-medium ml-3 flex-1 leading-5 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            You'll receive a payment prompt on your phone. Enter your Mobile
            Money PIN to complete the transaction securely.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
