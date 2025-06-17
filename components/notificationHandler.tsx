// src/components/NotificationHandler.js
import React, { ReactNode, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";


import useNotifications from "@/hooks/useNotification";
import notificationServices from "@/service/notification.services";
import useAuthStore from "@/store/useAuthStore";

interface NotificationHandlerProps {
  userId: string | null;
  children: ReactNode;
}

const NotificationHandler = ({
  userId,
  children,
}: NotificationHandlerProps) => {
  const { loading } = useNotifications(userId);
  const { user  } = useAuthStore();

  useEffect(() => {
    // Check subscription status and send notifications if needed
    const checkAndNotifySubscriptionStatus = async () => {
      try {
        if (!userId || !user) return;

      
        const isActive = true;

        // If subscription has ended
        if (!isActive) {
          await notificationServices.scheduleLocalNotification(
            "Subscription Ended",
            "Your subscription has ended. Renew now to continue using all features.",
            { type: "subscription_expired", route: "/(tabs)/Account" }
          );
        }
        
        // If subscription is ending in 3 days or less
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkAndNotifySubscriptionStatus();

    // Check subscription status more frequently when close to expiration
    const intervalId = setInterval(
      checkAndNotifySubscriptionStatus,
      30 * 60 * 1000 // Every 30 minutes
    );

    return () => clearInterval(intervalId);
  }, [userId, user]);

  // Only show loading indicator briefly during initial setup
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Always render children even if notifications setup failed
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default NotificationHandler;
