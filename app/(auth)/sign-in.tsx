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

  // Color definitions
  const primaryColor = "#72b7e9";
  const textColor = colorScheme === "dark" ? "#FFFFFF" : "#1C1C1E";
  const inputBgColor = colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF";
  const containerBgColor = colorScheme === "dark" ? "#000000" : "#F2F2F7";
  const placeholderColor = colorScheme === "dark" ? "#8E8E93" : "#8E8E93";
  const borderColor = colorScheme === "dark" ? "#38383A" : "#C6C6C8";
  const errorColor = "#FF3B30";
  const secondaryTextColor = colorScheme === "dark" ? "#8E8E93" : "#8E8E93";

  const isDisabled = loading || isAuthenticating;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: containerBgColor }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={[styles.formContainer, { backgroundColor: inputBgColor }]}
        >
          <ThemedText
            type="title"
            style={[styles.headerText, { color: primaryColor }]}
          >
            Sign in to your account
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>
              Email address
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBgColor,
                  color: textColor,
                  borderColor:
                    touchedFields.email && errors.email
                      ? errorColor
                      : borderColor,
                  opacity: isDisabled ? 0.7 : 1,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={placeholderColor}
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
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {errors.email}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>
              Password
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBgColor,
                  color: textColor,
                  borderColor:
                    touchedFields.password && errors.password
                      ? errorColor
                      : borderColor,
                  opacity: isDisabled ? 0.7 : 1,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={placeholderColor}
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
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {errors.password}
              </ThemedText>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: primaryColor },
              isDisabled && { opacity: 0.6 },
            ]}
            onPress={handleAuth}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>
              {isDisabled ? "Signing in..." : "Sign in"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, isDisabled && { opacity: 0.6 }]}
            onPress={() => router.push("/(auth)/sign-up")}
            disabled={isDisabled}
          >
            <ThemedText
              style={[styles.toggleText, { color: secondaryTextColor }]}
            >
              Don&apos;t have an account?{" "}
              <ThemedText style={[styles.linkText, { color: primaryColor }]}>
                Sign up
              </ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 450,
    borderRadius: 8,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    height: 50,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    marginTop: 15,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
  },
  linkText: {
    fontWeight: "500",
  },
});
