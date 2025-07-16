import { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import "../../global.css";
import { PanResponder, Platform, View } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import useAuthStore from "@/store/useAuthStore";
import NotificationHandler from "@/components/notificationHandler";
import ChatBot from "@/components/chatbot";
import { useLanguage } from "@/hooks/useLanguage";

export default function TabLayout() {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [showChatBot] = useState(true);
  const [chatBotVisible, setChatBotVisible] = useState(true);
  const inactivityTimer = useRef<number | null>(null);

  const resetInactivityTimer = (chatIsOpen = false) => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Show chatbot if it was hidden due to inactivity
    setChatBotVisible(true);

    // Only set timer to hide chatbot if chat is not currently open
    if (!chatIsOpen) {
      inactivityTimer.current = setTimeout(() => {
        setChatBotVisible(false);
      }, 5000);
    }
  };

  // Create PanResponder to detect user interactions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetInactivityTimer(false);
        return false;
      },
      onMoveShouldSetPanResponder: () => {
        resetInactivityTimer(false);
        return false;
      },
    })
  ).current;

  // Initialize chatbot timer when component mounts
  useEffect(() => {
    resetInactivityTimer(false);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);
  return (
    <NotificationHandler userId={user?.id ?? null}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#000000", // Black for active tab
            tabBarInactiveTintColor: "#666666", // Dark gray for inactive tabs
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: "absolute",
                borderTopColor: "transparent",
                backgroundColor: "rgba(255, 255, 255, 0.95)", // White background with slight transparency
              },
              android: {
                borderTopWidth: 0,
                elevation: 0,
                backgroundColor: "#FFFFFF", // Solid white background for Android
              },
            }),
          }}
        >
          <Tabs.Screen
            name="index"
            redirect={user?.role !== "user"}
            options={{
              title: t("tabs.audio"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="house.fill" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="dashboard"
            redirect={user?.role !== "sound prof"}
            options={{
              title: t("tabs.dashboard"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="chart.bar.fill" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="subscribers"
            redirect={user?.role !== "non"}
            options={{
              title: t("tabs.subscribers"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="person.3.fill" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="library"
            redirect={user?.role !== "admin"}
            options={{
              title: t("tabs.audio"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="headphones" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="audio"
            redirect={user?.role !== "admin"}
            options={{
              title: t("tabs.library"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="book.fill" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="client-audio"
            redirect={user?.role !== "user"}
            options={{
              title: t("tabs.books"),
              tabBarIcon: ({ color }) => (
                <IconSymbol
                  size={28}
                  name="books.vertical.fill"
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="video"
            redirect={user?.role !== "user"}
            options={{
              title: t("tabs.videos"),
              tabBarIcon: ({ color }) => (
                <IconSymbol
                  size={28}
                  name="play.rectangle.fill"
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="advideo"
            redirect={user?.role !== "admin"}
            options={{
              title: t("tabs.videos"),
              tabBarIcon: ({ color }) => (
                <IconSymbol
                  size={28}
                  name="play.rectangle.fill"
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="map"
            options={{
              title: t("tabs.map"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="map.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="subscription"
            redirect={user?.role !== "non"}
            options={{
              title: t("tabs.subscription"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="star.fill" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="Account"
            options={{
              title: t("tabs.account"),
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="person.fill" color={color} />
              ),
            }}
          />
        </Tabs>
        {showChatBot && chatBotVisible && (
          <View
            style={{
              position: "absolute",
              top: 900,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "box-none",
            }}
          >
            <ChatBot onInteraction={resetInactivityTimer} />
          </View>
        )}
      </View>
    </NotificationHandler>
  );
}
