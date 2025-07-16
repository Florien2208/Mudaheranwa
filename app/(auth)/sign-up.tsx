import { ThemedText } from "@/components/ThemedText";

import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Validation constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
}

interface SignUpScreenProps {
  onNavigateToSignIn?: () => void;
}

export default function SignUpScreen({
  onNavigateToSignIn,
}: SignUpScreenProps): React.ReactElement {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setFullName] = useState<string>("");
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );

  // Use Zustand store instead of context
  const { signup, error, loading, clearError } = useAuthStore();
  const colorScheme = useColorScheme();

  // Define colors based on the reference image
  const colors = {
    background: colorScheme === "dark" ? "#000000" : "#FFFFFF",
    cardBackground: colorScheme === "dark" ? "#111111" : "#FFFFFF",
    text: colorScheme === "dark" ? "#FFFFFF" : "#333333",
    secondaryText: colorScheme === "dark" ? "#CCCCCC" : "#666666",
    inputBackground: colorScheme === "dark" ? "#1A1A1A" : "#F5F5F5",
    inputBorder: colorScheme === "dark" ? "#333333" : "#E0E0E0",
    inputBorderFocus: colorScheme === "dark" ? "#666666" : "#CCCCCC",
    buttonBackground: colorScheme === "dark" ? "#FFFFFF" : "#2C2C2C",
    buttonText: colorScheme === "dark" ? "#000000" : "#FFFFFF",
    linkText: colorScheme === "dark" ? "#FFFFFF" : "#2C2C2C",
    errorText: "#FF4444",
    errorBorder: "#FF4444",
    accent: "#4A90E2", // Blue accent color from the logo
    cardBorder: colorScheme === "dark" ? "#333333" : "#F0F0F0",
    placeholder: colorScheme === "dark" ? "#888888" : "#999999",
  };

  // Show error alerts when they occur
  useEffect(() => {
    if (error) {
      Alert.alert("Authentication Error", error);
      clearError();
    }
  }, [error, clearError]);

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < PASSWORD_MIN_LENGTH)
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    return undefined;
  };

  const validateName = (value: string): string | undefined => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name is too short";
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return "Name contains invalid characters";
    return undefined;
  };

  const validateConfirmPassword = (
    value: string,
    passwordValue: string
  ): string | undefined => {
    if (!value) return "Please confirm your password";
    if (value !== passwordValue) return "Passwords don't match";
    return undefined;
  };

  const handleBlur = (field: string): void => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string): void => {
    let fieldError: string | undefined;

    switch (field) {
      case "email":
        fieldError = validateEmail(email);
        break;
      case "password":
        fieldError = validatePassword(password);
        break;
      case "confirmPassword":
        fieldError = validateConfirmPassword(confirmPassword, password);
        break;
      case "name":
        fieldError = validateName(name);
        break;
      default:
        return;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate email and password
    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    const nameError = validateName(name);
    if (nameError) {
      newErrors.name = nameError;
      isValid = false;
    }

    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
      isValid = false;
    }

    if (!agreeToTerms) {
      Alert.alert(
        "Terms Agreement",
        "You must agree to the Terms of Service and Privacy Policy"
      );
      isValid = false;
    }

    setErrors(newErrors);
    // Mark all fields as touched when submitting
    setTouchedFields({
      email: true,
      password: true,
      name: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleAuth = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      await signup({
        email,
        password,
        name,
      });
    } catch (authError) {
      // Handle authentication error without resetting form
      console.log("Authentication failed:", authError);
      // Form state remains intact
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={{
            width: "100%",
            maxWidth: 400,
            alignSelf: "center",
            backgroundColor: colors.cardBackground,
            borderRadius: 8,
            padding: 32,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}
        >
          <ThemedText
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Create Account
          </ThemedText>

          <ThemedText
            style={{
              color: colors.secondaryText,
              textAlign: "center",
              marginBottom: 32,
              fontSize: 16,
            }}
          >
            Or{" "}
            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
              style={{ display: "inline" }}
            >
              <ThemedText
                style={{
                  color: colors.linkText,
                  fontWeight: "500",
                }}
              >
                sign in
              </ThemedText>
            </TouchableOpacity>{" "}
            to your existing account
          </ThemedText>

          <View style={{ marginBottom: 24 }}>
            <ThemedText
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Full Name
            </ThemedText>
            <TextInput
              style={{
                height: 48,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 16,
                fontSize: 16,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor:
                  touchedFields.name && errors.name
                    ? colors.errorBorder
                    : colors.inputBorder,
                opacity: loading ? 0.7 : 1,
              }}
              placeholder="Enter your full name"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={(value) => {
                setFullName(value);
                if (touchedFields.name) {
                  validateField("name");
                }
              }}
              onBlur={() => handleBlur("name")}
              editable={!loading}
            />
            {touchedFields.name && errors.name && (
              <ThemedText
                style={{
                  color: colors.errorText,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {errors.name}
              </ThemedText>
            )}
          </View>

          <View style={{ marginBottom: 24 }}>
            <ThemedText
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Email Address
            </ThemedText>
            <TextInput
              style={{
                height: 48,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 16,
                fontSize: 16,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor:
                  touchedFields.email && errors.email
                    ? colors.errorBorder
                    : colors.inputBorder,
                opacity: loading ? 0.7 : 1,
              }}
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (touchedFields.email) {
                  validateField("email");
                }
              }}
              onBlur={() => handleBlur("email")}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            {touchedFields.email && errors.email && (
              <ThemedText
                style={{
                  color: colors.errorText,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {errors.email}
              </ThemedText>
            )}
          </View>

          <View style={{ marginBottom: 24 }}>
            <ThemedText
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Password
            </ThemedText>
            <TextInput
              style={{
                height: 48,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 16,
                fontSize: 16,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor:
                  touchedFields.password && errors.password
                    ? colors.errorBorder
                    : colors.inputBorder,
                opacity: loading ? 0.7 : 1,
              }}
              placeholder="Enter your password"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (touchedFields.password) {
                  validateField("password");
                }
                // Also validate confirm password if it's been touched
                if (touchedFields.confirmPassword) {
                  validateField("confirmPassword");
                }
              }}
              onBlur={() => handleBlur("password")}
              secureTextEntry
              editable={!loading}
            />
            {touchedFields.password && errors.password && (
              <ThemedText
                style={{
                  color: colors.errorText,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {errors.password}
              </ThemedText>
            )}
          </View>

          <View style={{ marginBottom: 24 }}>
            <ThemedText
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Confirm Password
            </ThemedText>
            <TextInput
              style={{
                height: 48,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 16,
                fontSize: 16,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor:
                  touchedFields.confirmPassword && errors.confirmPassword
                    ? colors.errorBorder
                    : colors.inputBorder,
                opacity: loading ? 0.7 : 1,
              }}
              placeholder="Confirm your password"
              placeholderTextColor={colors.placeholder}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (touchedFields.confirmPassword) {
                  validateField("confirmPassword");
                }
              }}
              onBlur={() => handleBlur("confirmPassword")}
              secureTextEntry
              editable={!loading}
            />
            {touchedFields.confirmPassword && errors.confirmPassword && (
              <ThemedText
                style={{
                  color: colors.errorText,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {errors.confirmPassword}
              </ThemedText>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              style={{
                width: 20,
                height: 20,
                borderWidth: 2,
                borderRadius: 4,
                marginRight: 12,
                marginTop: 2,
                justifyContent: "center",
                alignItems: "center",
                borderColor: agreeToTerms
                  ? colors.buttonBackground
                  : colors.inputBorder,
                backgroundColor: agreeToTerms
                  ? colors.buttonBackground
                  : "transparent",
              }}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              disabled={loading}
            >
              {agreeToTerms && (
                <ThemedText
                  style={{
                    color: colors.buttonText,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </ThemedText>
              )}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{
                  color: colors.secondaryText,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                I agree to the{" "}
                <TouchableOpacity
                  onPress={() => router.push("/termsandcondition")}
                  style={{ display: "inline" }}
                  disabled={loading}
                >
                  <ThemedText
                    style={{
                      color: colors.linkText,
                      fontWeight: "500",
                    }}
                  >
                    Terms of Service
                  </ThemedText>
                </TouchableOpacity>{" "}
                and{" "}
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/privacypolicy")}
                  style={{ display: "inline" }}
                  disabled={loading}
                >
                  <ThemedText
                    style={{
                      color: colors.linkText,
                      fontWeight: "500",
                    }}
                  >
                    Privacy Policy
                  </ThemedText>
                </TouchableOpacity>
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={{
              height: 48,
              backgroundColor: colors.buttonBackground,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              opacity: loading ? 0.6 : 1,
            }}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            <ThemedText
              style={{
                color: colors.buttonText,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
