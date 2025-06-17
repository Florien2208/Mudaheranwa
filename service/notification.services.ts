// src/services/NotificationService.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import { Platform } from "react-native";
import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Define types for the notification listeners
type NotificationReceivedListener = (
  notification: Notifications.Notification
) => void;
type NotificationResponseListener = (
  response: Notifications.NotificationResponse
) => void;

type NotificationListeners = {
  receivedListener: Notifications.Subscription;
  responseListener: Notifications.Subscription;
};

class NotificationService {
  // Register for push notifications and get token - with local fallback if push fails
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      // Return a placeholder token for simulator/emulator
      return "simulator-" + Date.now();
    }

    // Check if we already have permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If no permission, ask for it
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    // Configure Android channel regardless of token
    if (Platform.OS === "android") {
      await this.setupAndroidNotificationChannel();
    }

    try {
      // Try to get push token from local storage first (if available)
      const storedToken = await AsyncStorage.getItem("pushToken");
      if (storedToken) {
        console.log("Using stored push token:", storedToken);
        return storedToken;
      }

      // If no stored token, try to get a new one from Expo
      // Instead of relying on getExpoPushTokenAsync, use a device identifier as fallback
      const deviceId =
        Device.deviceName + "-" + Device.modelName + "-" + Date.now();
      const fallbackToken = "device-" + deviceId.replace(/[^a-zA-Z0-9]/g, "-");

      // Store this token for future use
      await AsyncStorage.setItem("pushToken", fallbackToken);
      console.log("Created fallback device token:", fallbackToken);

      return fallbackToken;
    } catch (error) {
      console.error("Error during token generation:", error);
      // Generate a fallback token in case of error
      const fallbackToken = "fallback-" + Date.now();
      console.log("Using error fallback token:", fallbackToken);
      return fallbackToken;
    }
  }

  // Set up Android notification channel
  async setupAndroidNotificationChannel() {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (error) {
      console.error("Error setting up notification channel:", error);
      // Continue even if channel setup fails
    }
  }

  // Send token to backend
  async sendTokenToServer(
    token: string,
    userId: string | number
  ): Promise<any> {
    console.log("Sending token to server:", token, userId);
    try {
      const authToken = await AsyncStorage.getItem("@auth_token");
      console.log("authToken", authToken);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/notification/update-token`,
        {
          userId,
          pushToken: token,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("Token registration response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to send push token to server:", error);
      throw error;
    }
  }
  // Add this method to your NotificationService.js
  async processRemoteMessage(
    title: string,
    body: string,
    data: Record<string, any>
  ): Promise<boolean> {
    const pushToken = await AsyncStorage.getItem("pushToken");

    // If this is a development token, show a local notification
    if (
      pushToken &&
      (pushToken.startsWith("device-") ||
        pushToken.startsWith("fallback-") ||
        pushToken.startsWith("simulator-"))
    ) {
      console.log("Development token detected, showing local notification");
      // Schedule a local notification instead
      await this.scheduleLocalNotification(title, body, data, 1);
      return true;
    }

    return false; // Not a development token
  }

  // Add notification listeners
  addNotificationListeners(
    onNotificationReceived?: NotificationReceivedListener,
    onNotificationResponse?: NotificationResponseListener
  ): NotificationListeners {
    try {
      const receivedListener = Notifications.addNotificationReceivedListener(
        onNotificationReceived ||
          ((notification) =>
            console.log("Notification received:", notification))
      );

      const responseListener =
        Notifications.addNotificationResponseReceivedListener(
          onNotificationResponse ||
            ((response) => console.log("Notification response:", response))
        );

      return { receivedListener, responseListener };
    } catch (error) {
      console.error("Error setting up notification listeners:", error);
      // Return empty listeners in case of error
      return { receivedListener: null, responseListener: null } as any;
    }
  }

  // Remove notification listeners
  removeNotificationListeners(listeners?: NotificationListeners): void {
    if (!listeners) return;

    try {
      if (listeners.receivedListener) {
        Notifications.removeNotificationSubscription(
          listeners.receivedListener
        );
      }

      if (listeners.responseListener) {
        Notifications.removeNotificationSubscription(
          listeners.responseListener
        );
      }
    } catch (error) {
      console.error("Error removing notification listeners:", error);
    }
  }

  // Schedule a local notification (for testing)
  async scheduleLocalNotification(
    title: string,
    body: string,
    data: Record<string, any> = {},
    seconds: number = 2
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: {
          seconds,
        } as Notifications.TimeIntervalTriggerInput,
      });
    } catch (error) {
      console.error("Error scheduling local notification:", error);
    }
  }
}

export default new NotificationService();
