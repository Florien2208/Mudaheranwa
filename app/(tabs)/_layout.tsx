import { Tabs } from "expo-router";
import React from "react";
import "../../global.css";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import useAuthStore from "@/store/useAuthStore";
import NotificationHandler from "@/components/notificationHandler";

export default function TabLayout() {
  
  const { user } = useAuthStore();



  return (
    <NotificationHandler userId={user?.id ?? null}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#72b7e9", // Custom color for active tab only
          tabBarInactiveTintColor: "#8E8E93", // Gray color for inactive tabs
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              borderTopColor: "transparent",
              backgroundColor: "rgba(114, 183, 233, 0.1)", // Updated to use #72b7e9 with transparency
            },
            android: {
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
          name="video"
          redirect={user?.role !== "user"}
          options={{
            title: "Videos",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="play.rectangle.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="advideo"
          redirect={user?.role !== "admin"}
          options={{
            title: "Videos",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="play.rectangle.fill" color={color} />
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
          name="Account"
          options={{
            title: "My Account",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </NotificationHandler>
  );
}
