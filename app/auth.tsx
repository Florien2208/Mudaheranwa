import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
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

export default function AuthScreen(): React.ReactElement {
  const [isLogin, setIsLogin] = useState<boolean>(false); // Default to signup
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
  const { login, signup, error, loading, clearError } = useAuthStore();
  const colorScheme = useColorScheme();

  // Show error alerts when they occur
  useEffect(() => {
    if (error) {
      Alert.alert("Authentication Error", error);
      clearError();
    }
  }, [error, clearError]);

  // Revalidate when switching between login/signup
  useEffect(() => {
    setErrors({});
    setTouchedFields({});
  }, [isLogin]);

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

    // Validate email and password for both login and signup
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

    // Additional validations for signup
    if (!isLogin) {
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
    }

    setErrors(newErrors);
    // Mark all fields as touched when submitting
    setTouchedFields({
      email: true,
      password: true,
      ...(isLogin ? {} : { name: true, confirmPassword: true }),
    });

    return isValid;
  };

  const handleAuth = (): void => {
    if (!validateForm()) return;

    if (isLogin) {
      login({
        email,
        password,
      });
    } else {
      signup({
        email,
        password,
        name,
      });
    }
  };

  const toggleMode = (): void => {
    setIsLogin(!isLogin);
  };

  // Color definitions using the specified color strategically
  const primaryColor = "#72b7e9"; // Your specified color for primary elements
  const textColor = colorScheme === "dark" ? "#FFFFFF" : "#1C1C1E";
  const inputBgColor = colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF";
  const containerBgColor = colorScheme === "dark" ? "#000000" : "#F2F2F7";
  const placeholderColor = colorScheme === "dark" ? "#8E8E93" : "#8E8E93";
  const borderColor = colorScheme === "dark" ? "#38383A" : "#C6C6C8";
  const errorColor = "#FF3B30";
  const secondaryTextColor = colorScheme === "dark" ? "#8E8E93" : "#8E8E93";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: containerBgColor }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <>
          <Animated.View
            entering={FadeInDown.duration(800)}
            style={[styles.formContainer, { backgroundColor: inputBgColor }]}
          >
            <ThemedText
              type="title"
              style={[styles.headerText, { color: primaryColor }]}
            >
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </ThemedText>

            {!isLogin && (
              <View style={styles.subheaderContainer}>
                <ThemedText
                  style={[styles.subheaderText, { color: secondaryTextColor }]}
                >
                  Or{" "}
                  <ThemedText
                    style={[
                      styles.subheaderText,
                      styles.linkText,
                      { color: primaryColor },
                    ]}
                    onPress={toggleMode}
                  >
                    sign in
                  </ThemedText>{" "}
                  to your existing account
                </ThemedText>
              </View>
            )}

            {!isLogin && (
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Full Name
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBgColor,
                      color: textColor,
                      borderColor:
                        touchedFields.name && errors.name
                          ? errorColor
                          : borderColor,
                    },
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor={placeholderColor}
                  value={name}
                  onChangeText={(value) => {
                    setFullName(value);
                    if (touchedFields.name) {
                      validateField("name");
                    }
                  }}
                  onBlur={() => handleBlur("name")}
                />
                {touchedFields.name && errors.name && (
                  <ThemedText style={[styles.errorText, { color: errorColor }]}>
                    {errors.name}
                  </ThemedText>
                )}
              </View>
            )}

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
                  // Also validate confirm password if it's been touched
                  if (touchedFields.confirmPassword) {
                    validateField("confirmPassword");
                  }
                }}
                onBlur={() => handleBlur("password")}
                secureTextEntry
              />
              {touchedFields.password && errors.password && (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {errors.password}
                </ThemedText>
              )}
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Confirm Password
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBgColor,
                      color: textColor,
                      borderColor:
                        touchedFields.confirmPassword && errors.confirmPassword
                          ? errorColor
                          : borderColor,
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={placeholderColor}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (touchedFields.confirmPassword) {
                      validateField("confirmPassword");
                    }
                  }}
                  onBlur={() => handleBlur("confirmPassword")}
                  secureTextEntry
                />
                {touchedFields.confirmPassword && errors.confirmPassword && (
                  <ThemedText style={[styles.errorText, { color: errorColor }]}>
                    {errors.confirmPassword}
                  </ThemedText>
                )}
              </View>
            )}

            {!isLogin && (
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    {
                      borderColor: agreeToTerms ? primaryColor : borderColor,
                      backgroundColor: agreeToTerms
                        ? primaryColor
                        : "transparent",
                    },
                  ]}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  {agreeToTerms && (
                    <ThemedText
                      style={[
                        styles.checkMark,
                        {
                          color: "white",
                        },
                      ]}
                    >
                      ✓
                    </ThemedText>
                  )}
                </TouchableOpacity>
                <ThemedText
                  style={[styles.termsText, { color: secondaryTextColor }]}
                >
                  I agree to the{" "}
                  <ThemedText
                    style={[styles.linkText, { color: primaryColor }]}
                  >
                    Terms of Service
                  </ThemedText>{" "}
                  and{" "}
                  <ThemedText
                    style={[styles.linkText, { color: primaryColor }]}
                  >
                    Privacy Policy
                  </ThemedText>
                </ThemedText>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: primaryColor },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleAuth}
              disabled={loading}
            >
              <ThemedText style={styles.buttonText}>
                {isLogin
                  ? loading
                    ? "Signing in..."
                    : "Sign in"
                  : loading
                  ? "Creating account..."
                  : "Create account"}
              </ThemedText>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleMode}
              >
                <ThemedText
                  style={[styles.toggleText, { color: secondaryTextColor }]}
                >
                  Don&apos;t have an account?{" "}
                  <ThemedText
                    style={[styles.linkText, { color: primaryColor }]}
                  >
                    Sign up
                  </ThemedText>
                </ThemedText>
              </TouchableOpacity>
            )}
          </Animated.View>
        </>
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
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  subheaderContainer: {
    marginBottom: 24,
  },
  subheaderText: {
    fontSize: 14,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    fontSize: 12,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    fontWeight: "500",
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
});
