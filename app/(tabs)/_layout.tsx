import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();

  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            borderTopColor: "transparent",
            backgroundColor: "rgba(0, 245, 255, 0.1)", // soft glow effect
          },
          android: {
            backgroundColor: theme.background,
            borderTopWidth: 0,
            elevation: 0,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        redirect={user?.role !== "user"}
        options={{
          title: "Audio",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="headphones" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        redirect={user?.role !== "admin"}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="subscribers"
        redirect={user?.role !== "non"}
        options={{
          title: "Subscribers",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.3.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="library"
        redirect={user?.role !== "admin"}
        options={{
          title: "Audio",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="headphones" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="audio"
        redirect={user?.role !== "admin"}
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="client-audio"
        redirect={user?.role !== "user"}
        options={{
          title: "Books",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="books.vertical.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription"
        redirect={user?.role !== "non"}
        options={{
          title: "Subscription",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="star.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "My Account",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
