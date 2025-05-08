import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import useAuthStore from "@/store/useAuthStore";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function AuthScreen(): React.ReactElement {
  const [isLogin, setIsLogin] = useState<boolean>(false); // Default to signup
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setFullName] = useState<string>("");
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

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

  const handleAuth = (): void => {
    if (isLogin) {
      login({
        email,
        password,
      });
    } else {
      if (password !== confirmPassword) {
        // Add password matching validation
        Alert.alert("Validation Error", "Passwords don't match");
        return;
      }

      if (!agreeToTerms) {
        // Terms validation
        Alert.alert(
          "Terms Agreement",
          "You must agree to the Terms of Service and Privacy Policy"
        );
        return;
      }

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

  const primaryColor = "#FF6347"; // Coral/orange color from the image
  const inputBgColor = "#FFFFFF";
  const textColor = "#333333";
  const placeholderColor = "#999999";
  const borderColor = "#EEEEEE";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.formWrapper}>
          <Animated.View
            entering={FadeInDown.duration(800)}
            style={styles.formContainer}
          >
            <ThemedText type="title" style={styles.headerText}>
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </ThemedText>

            {!isLogin && (
              <View style={styles.subheaderContainer}>
                <ThemedText style={styles.subheaderText}>
                  Or{" "}
                  <ThemedText
                    style={[styles.subheaderText, styles.linkText]}
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
                <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBgColor,
                      color: textColor,
                      borderColor: borderColor,
                    },
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor={placeholderColor}
                  value={name}
                  onChangeText={setFullName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Email address</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBgColor,
                    color: textColor,
                    borderColor: borderColor,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBgColor,
                    color: textColor,
                    borderColor: borderColor,
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>
                  Confirm Password
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBgColor,
                      color: textColor,
                      borderColor: borderColor,
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={placeholderColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}

            {!isLogin && (
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  {agreeToTerms && (
                    <View style={styles.checkboxChecked}>
                      <ThemedText style={styles.checkMark}>✓</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
                <ThemedText style={styles.termsText}>
                  I agree to the{" "}
                  <ThemedText style={styles.linkText}>
                    Terms of Service
                  </ThemedText>{" "}
                  and{" "}
                  <ThemedText style={styles.linkText}>
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
                <ThemedText style={styles.toggleText}>
                  Don't have an account?{" "}
                  <ThemedText style={styles.linkText}>Sign up</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
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
    backgroundColor: "#FFFFFF",
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
    color: "#333333",
  },
  subheaderContainer: {
    marginBottom: 24,
  },
  subheaderText: {
    fontSize: 14,
    color: "#666666",
  },
  inputGroup: {
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333333",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FF6347",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  linkText: {
    color: "#FF6347",
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
    color: "#666666",
  },
});
