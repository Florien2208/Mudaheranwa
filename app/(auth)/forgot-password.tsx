import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
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
import axios from "axios";
import { API_BASE_URL } from "@/constants";



// Validation constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const PASSWORD_MIN_LENGTH = 6;

interface ValidationErrors {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
}

type ForgotPasswordStep = "email" | "otp" | "password";

export default function ForgotPasswordScreen(): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [otpToken, setOtpToken] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);

  const colorScheme = useColorScheme();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resendTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address";
    return undefined;
  };

  const validateOtp = (value: string): string | undefined => {
    if (!value.trim()) return "OTP is required";
    if (value.length !== OTP_LENGTH) return `OTP must be ${OTP_LENGTH} digits`;
    if (!/^\d+$/.test(value)) return "OTP must contain only numbers";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < PASSWORD_MIN_LENGTH)
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
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
      case "otp":
        fieldError = validateOtp(otp);
        break;
      case "password":
        fieldError = validatePassword(password);
        break;
      case "confirmPassword":
        fieldError = validateConfirmPassword(confirmPassword);
        break;
      default:
        return;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const handleSendOtp = async (): Promise<void> => {
    if (loading) return;

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      setTouchedFields({ email: true });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/forgot-password`,
        {
          email: email.trim(),
        }
      );
console.log("response",response.status)
      if (response.status===200) {
        setOtpToken(response.data.token); // Store the token for OTP verification
        setCurrentStep("otp");
        setResendTimer(60); // Start 60 second timer
        Alert.alert(
          "OTP Sent",
          "A verification code has been sent to your email address.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    if (loading) return;

    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      setTouchedFields({ otp: true });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        email: email.trim(),
        otp: otp.trim(),
        token: otpToken,
      });

      if (response.status===200) {
        setCurrentStep("password");
        Alert.alert("OTP Verified", "Please enter your new password.", [
          { text: "OK" },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (): Promise<void> => {
    if (loading) return;

    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      setTouchedFields({
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/reset-password/${otp}`, {
        email: email.trim(),
        password: password,
        otp: otp.trim(),
        token: otpToken,
      });

      if (response.status===200) {
        Alert.alert(
          "Password Reset Successful",
          "Your password has been reset successfully. Please sign in with your new password.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/sign-in"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to reset password"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    if (loading || resendTimer > 0) return;
    await handleSendOtp();
  };

  const renderEmailStep = () => (
    <View>
      <ThemedText
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Forgot Password
      </ThemedText>

      <ThemedText
        style={{
          color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
          textAlign: "center",
          marginBottom: 32,
          fontSize: 16,
        }}
      >
        Enter your email address and we&apos;ll send you a verification code
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
            opacity: loading ? 0.7 : 1,
          }}
          placeholder="Enter your email"
          placeholderTextColor={colorScheme === "dark" ? "#888888" : "#999999"}
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
              color: "#FF0000",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            {errors.email}
          </ThemedText>
        )}
      </View>

      <TouchableOpacity
        style={{
          height: 48,
          backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
          opacity: loading ? 0.6 : 1,
        }}
        onPress={handleSendOtp}
        disabled={loading}
        activeOpacity={0.8}
      >
        <ThemedText
          style={{
            color: colorScheme === "dark" ? "#000000" : "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {loading ? "Sending..." : "Send Verification Code"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View>
      <ThemedText
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Verify Code
      </ThemedText>

      <ThemedText
        style={{
          color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
          textAlign: "center",
          marginBottom: 32,
          fontSize: 16,
        }}
      >
        Enter the 6-digit code sent to {email}
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
          Verification Code
        </ThemedText>
        <TextInput
          style={{
            height: 48,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 16,
            fontSize: 18,
            backgroundColor: colorScheme === "dark" ? "#111111" : "#F9F9F9",
            color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
            borderColor:
              touchedFields.otp && errors.otp
                ? "#FF0000"
                : colorScheme === "dark"
                  ? "#333333"
                  : "#CCCCCC",
            opacity: loading ? 0.7 : 1,
            textAlign: "center",
            letterSpacing: 4,
          }}
          placeholder="000000"
          placeholderTextColor={colorScheme === "dark" ? "#888888" : "#999999"}
          value={otp}
          onChangeText={(value) => {
            const numericValue = value
              .replace(/[^0-9]/g, "")
              .slice(0, OTP_LENGTH);
            setOtp(numericValue);
            if (touchedFields.otp) {
              validateField("otp");
            }
          }}
          onBlur={() => handleBlur("otp")}
          keyboardType="numeric"
          maxLength={OTP_LENGTH}
          editable={!loading}
        />
        {touchedFields.otp && errors.otp && (
          <ThemedText
            style={{
              color: "#FF0000",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            {errors.otp}
          </ThemedText>
        )}
      </View>

      <TouchableOpacity
        style={{
          height: 48,
          backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
          opacity: loading ? 0.6 : 1,
        }}
        onPress={handleVerifyOtp}
        disabled={loading}
        activeOpacity={0.8}
      >
        <ThemedText
          style={{
            color: colorScheme === "dark" ? "#000000" : "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          alignItems: "center",
          marginBottom: 24,
        }}
        onPress={handleResendOtp}
        disabled={loading || resendTimer > 0}
      >
        <ThemedText
          style={{
            color:
              resendTimer > 0
                ? colorScheme === "dark"
                  ? "#666666"
                  : "#CCCCCC"
                : colorScheme === "dark"
                  ? "#FFFFFF"
                  : "#000000",
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <View>
      <ThemedText
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Reset Password
      </ThemedText>

      <ThemedText
        style={{
          color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
          textAlign: "center",
          marginBottom: 32,
          fontSize: 16,
        }}
      >
        Enter your new password
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
          New Password
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
            opacity: loading ? 0.7 : 1,
          }}
          placeholder="Enter new password"
          placeholderTextColor={colorScheme === "dark" ? "#888888" : "#999999"}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (touchedFields.password) {
              validateField("password");
            }
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
              color: "#FF0000",
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
            color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
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
            backgroundColor: colorScheme === "dark" ? "#111111" : "#F9F9F9",
            color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
            borderColor:
              touchedFields.confirmPassword && errors.confirmPassword
                ? "#FF0000"
                : colorScheme === "dark"
                  ? "#333333"
                  : "#CCCCCC",
            opacity: loading ? 0.7 : 1,
          }}
          placeholder="Confirm new password"
          placeholderTextColor={colorScheme === "dark" ? "#888888" : "#999999"}
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
              color: "#FF0000",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            {errors.confirmPassword}
          </ThemedText>
        )}
      </View>

      <TouchableOpacity
        style={{
          height: 48,
          backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
          opacity: loading ? 0.6 : 1,
        }}
        onPress={handleResetPassword}
        disabled={loading}
        activeOpacity={0.8}
      >
        <ThemedText
          style={{
            color: colorScheme === "dark" ? "#000000" : "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "email":
        return renderEmailStep();
      case "otp":
        return renderOtpStep();
      case "password":
        return renderPasswordStep();
      default:
        return renderEmailStep();
    }
  };

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
          {renderCurrentStep()}

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
              Remember your password?{" "}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              disabled={loading}
            >
              <ThemedText
                style={{
                  color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Sign In
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
