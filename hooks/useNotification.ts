// src/hooks/useNotifications.js
import { useState, useEffect, useRef } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import notificationServices from "@/service/notification.services";
import { API_BASE_URL } from "@/constants";


interface NotificationData {
  type: string;
  messageId?: string;
  announcementId?: string;
  [key: string]: any;
}

interface NotificationContent {
  data: NotificationData;
}

interface NotificationRequest {
  content: NotificationContent;
}

interface NotificationResponse {
  notification: {
    request: NotificationRequest;
  };
}

export default function useNotifications(userId: string | null) {
  const [notification, setNotification] = useState<any>(null);
  const [pushToken, setPushToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const notificationListeners = useRef<any>(null);
  const initializationAttempted = useRef<boolean>(false);



  // Initialize notifications
  useEffect(() => {
    const activeUserId = userId 

    if (activeUserId && !initializationAttempted.current) {
      initializationAttempted.current = true;
      initializeNotifications(activeUserId);
    } else if (!activeUserId && loading) {
      // If no user ID and still loading, stop loading state
      setLoading(false);
    }

    // Clean up notification listeners when component unmounts
    return () => {
      if (notificationListeners.current) {
        notificationServices.removeNotificationListeners(
          notificationListeners.current
        );
      }
    };
  }, [ userId]);
  // Add to useNotifications hook
  useEffect(() => {
    // Only run in development builds and if we have a userId
    const isDev = __DEV__; // React Native's development flag
    const activeUserId = userId ;

    if (
      isDev &&
      activeUserId &&
      pushToken &&
      (pushToken.startsWith("device-") ||
        pushToken.startsWith("fallback-") ||
        pushToken.startsWith("simulator-"))
    ) {
      console.log("Setting up development notification polling");

      // Set up polling for notifications in development mode
      const pollInterval = 15000; // 15 seconds
      let lastPollTime = Date.now();

      const pollTimer = setInterval(async () => {
        try {
          // Avoid excessive polls if app was in background
          const now = Date.now();
          if (now - lastPollTime > pollInterval * 2) {
            console.log("Long time since last poll, possible background state");
          }
          lastPollTime = now;

          // console.log("Polling for notifications...");

          // Get the auth token
          const authToken = await AsyncStorage.getItem("@auth_token");
          if (!authToken) {
            console.log("No auth token found, skipping poll");
            return;
          }

          // Make a request to your backend to check for pending notifications
          const response = await fetch(
            `${API_BASE_URL}/api/v1/notification/check-pending`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ userId: activeUserId }),
            }
          );

          if (!response.ok) {
            console.log(`Error response: ${response.status}`);
            return;
          }

          const data = await response.json();

          // Only log when we find notifications to reduce console spam
          if (data.pendingNotifications?.length > 0) {
            console.log(
              `Found ${data.pendingNotifications.length} pending notifications`
            );

            // Process each notification
            for (const notification of data.pendingNotifications) {
              console.log("Processing notification:", notification);

              await notificationServices.scheduleLocalNotification(
                notification.title,
                notification.body,
                notification.data || {},
                1 // Show after 1 second
              );
            }
          }
        } catch (error) {
          console.log("Error polling for notifications:", error);
        }
      }, pollInterval);

      return () => {
        console.log("Clearing notification poll timer");
        clearInterval(pollTimer);
      };
    }
  }, [userId, pushToken]);
  // Initialize push notifications
  const initializeNotifications = async (activeUserId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Try to setup notification listeners first (this should work even if tokens fail)
      setupNotificationListeners();

      // Then try to get a token (or fallback)
      const token = await notificationServices.registerForPushNotifications();

      if (token) {
        setPushToken(token);

        // Always try to send token to server if we have one
        if (activeUserId) {
          try {
            await notificationServices.sendTokenToServer(token, activeUserId);
            console.log("Token registered with server successfully");
          } catch (tokenError) {
            console.error("Failed to register token with server:", tokenError);
            // Continue anyway - the app should still function
          }
        }
      }
    } catch (error) {
      console.error("Error in notification initialization:", error);
      setError("Notification setup incomplete");
      // Don't show alert, just log the error and continue
    } finally {
      setLoading(false);
    }
  };
  const checkForNotifications = async () => {
    if (!userId || !pushToken) return;

    try {
      console.log("Manually checking for notifications");
      const authToken = await AsyncStorage.getItem("@auth_token");

      const response = await fetch(
        `${API_BASE_URL}/api/v1/notification/check-pending`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (data.pendingNotifications?.length > 0) {
        console.log(
          `Found ${data.pendingNotifications.length} pending notifications`
        );

        for (const notification of data.pendingNotifications) {
          await notificationServices.scheduleLocalNotification(
            notification.title,
            notification.body,
            notification.data || {},
            1
          );
        }

        return data.pendingNotifications.length;
      }

      return 0;
    } catch (error) {
      console.error("Error checking for notifications:", error);
      return 0;
    }
  };

  // Setup notification listeners separately
  const setupNotificationListeners = () => {
    try {
      notificationListeners.current =
        notificationServices.addNotificationListeners(
          // When notification received
          (notification: any) => {
            console.log("Notification received in hook:", notification);
            setNotification(notification);
          },
          // When user taps on notification
          (response: any) => {
            console.log("Notification response in hook:", response);
            try {
              handleNotificationResponse(response);
            } catch (error) {
              console.error("Error handling notification response:", error);
            }
          }
        );
    } catch (error) {
      console.error("Failed to set up notification listeners:", error);
    }
  };

  // Handle notification response (when user taps notification)
  const handleNotificationResponse = (response: NotificationResponse) => {
    try {
      const content = response?.notification?.request?.content;

      if (!content || !content.data) {
        console.log("Invalid notification response format");
        return;
      }

      // Handle based on notification type
      if (content.data.type === "message") {
        // Navigation logic for messages
        console.log("Message notification tapped:", content.data.messageId);
      } else if (content.data.type === "announcement") {
        // Navigation logic for announcements
        console.log(
          "Announcement notification tapped:",
          content.data.announcementId
        );
      } else {
        console.log("Unknown notification type:", content.data.type);
      }
    } catch (error) {
      console.error("Error in handleNotificationResponse:", error);
    }
  };

  // Send test notification (for development)
  const sendTestNotification = async () => {
    try {
      await notificationServices.scheduleLocalNotification(
        "Test Notification",
        "This is a test notification",
        { type: "test" }
      );
      console.log("Test notification scheduled");
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  };

  return {
    pushToken,
    notification,
    loading,
    error,
    sendTestNotification,
    initializeNotifications,
    checkForNotifications,
  };
}
