import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
}

interface SignInScreenProps {
  onNavigateToSignUp?: () => void;
}

export default function SignInScreen({
  onNavigateToSignUp,
}: SignInScreenProps): React.ReactElement {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const hasShownErrorRef = useRef<boolean>(false);

  // Use Zustand store
  const { login, error, loading, clearError, isAuthenticating } =
    useAuthStore();
  const colorScheme = useColorScheme();

  // Show error alerts only once when they occur
  useEffect(() => {
    if (error && !hasShownErrorRef.current) {
      hasShownErrorRef.current = true;
      Alert.alert("Authentication Error", error, [
        {
          text: "OK",
          onPress: () => {
            clearError();
            hasShownErrorRef.current = false;
          },
        },
      ]);
    } else if (!error) {
      hasShownErrorRef.current = false;
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

    setErrors(newErrors);
    // Mark all fields as touched when submitting
    setTouchedFields({
      email: true,
      password: true,
    });

    return isValid;
  };

  const handleAuth = async (): Promise<void> => {
    // Prevent multiple simultaneous requests
    if (loading || isAuthenticating) return;

    if (!validateForm()) return;

    // Clear any previous errors
    clearError();
    hasShownErrorRef.current = false;

    try {
      await login({
        email: email.trim(),
        password,
      });
      // Success navigation is handled by the auth store
    } catch (authError) {
      // Error handling is managed by the store and useEffect
      console.log("Authentication failed:", authError);
    }
  };

  const handleForgotPassword = (): void => {
    // Navigate to forgot password screen or show modal
    router.push("/(auth)/forgot-password");
  };

  const isDisabled = loading || isAuthenticating;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
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
            backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
            borderRadius: 8,
            padding: 32,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            borderWidth: 1,
            borderColor: colorScheme === "dark" ? "#333333" : "#E5E5E5",
          }}
        >
          <ThemedText
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Sign In
          </ThemedText>

          <ThemedText
            style={{
              color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
              textAlign: "center",
              marginBottom: 32,
              fontSize: 16,
            }}
          >
            Welcome back! Please sign in to your account
          </ThemedText>

          <View style={{ marginBottom: 24 }}>
            <ThemedText
              style={{
                color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
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
                backgroundColor: colorScheme === "dark" ? "#111111" : "#F9F9F9",
                color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                borderColor:
                  touchedFields.email && errors.email
                    ? "#FF0000"
                    : colorScheme === "dark"
                      ? "#333333"
                      : "#CCCCCC",
                opacity: isDisabled ? 0.7 : 1,
              }}
              placeholder="Enter your email"
              placeholderTextColor={
                colorScheme === "dark" ? "#888888" : "#999999"
              }
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
              editable={!isDisabled}
            />
            {touchedFields.email && errors.email && (
              <ThemedText
                style={{
                  color: "#FF0000",
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
                color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
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
                backgroundColor: colorScheme === "dark" ? "#111111" : "#F9F9F9",
                color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                borderColor:
                  touchedFields.password && errors.password
                    ? "#FF0000"
                    : colorScheme === "dark"
                      ? "#333333"
                      : "#CCCCCC",
                opacity: isDisabled ? 0.7 : 1,
              }}
              placeholder="Enter your password"
              placeholderTextColor={
                colorScheme === "dark" ? "#888888" : "#999999"
              }
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (touchedFields.password) {
                  validateField("password");
                }
              }}
              onBlur={() => handleBlur("password")}
              secureTextEntry
              editable={!isDisabled}
            />
            {touchedFields.password && errors.password && (
              <ThemedText
                style={{
                  color: "#FF0000",
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {errors.password}
              </ThemedText>
            )}
          </View>

          <TouchableOpacity
            style={{
              alignItems: "flex-end",
              marginBottom: 24,
            }}
            onPress={handleForgotPassword}
            disabled={isDisabled}
          >
            <ThemedText
              style={{
                color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              height: 48,
              backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              opacity: isDisabled ? 0.6 : 1,
            }}
            onPress={handleAuth}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            <ThemedText
              style={{
                color: colorScheme === "dark" ? "#000000" : "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {isDisabled ? "Signing In..." : "Sign In"}
            </ThemedText>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <ThemedText
              style={{
                color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
                fontSize: 14,
              }}
            >
              Don&apos;t have an account?{" "}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              disabled={isDisabled}
            >
              <ThemedText
                style={{
                  color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Sign Up
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
