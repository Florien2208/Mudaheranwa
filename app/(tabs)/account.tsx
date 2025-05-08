import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { useFocusEffect } from "@react-navigation/native";

// Extract menu item component for better organization
const MenuItem = ({ icon, title, onPress, colorScheme }) => (
  <Pressable
    style={({ pressed }) => [
      styles.menuItem,
      pressed && styles.menuItemPressed,
    ]}
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityHint={`Navigate to ${title}`}
  >
    <IconSymbol
      name={icon}
      size={22}
      color={Colors[colorScheme].text}
      style={styles.menuIcon}
    />
    <Text
      style={[styles.menuItemText, { color: Colors[colorScheme].text }]}
      numberOfLines={1}
    >
      {title}
    </Text>
    <IconSymbol
      name="chevron.right"
      size={16}
      color={Colors[colorScheme].secondaryText}
      style={styles.chevron}
    />
  </Pressable>
);

export default function AccountScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuthStore();
  const isArtist = user?.isArtist;
  const insets = useSafeAreaInsets();

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Could refresh user data here
      return () => {};
    }, [])
  );

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login or home screen after logout
      navigation.navigate("Login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Could show an error toast here
    }
  };

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  const menuItems = [
    {
      title: "Edit Profile",
      icon: "person.crop.circle",
      onPress: () => navigateTo("EditProfile"),
    },
    {
      title: "Payment Methods",
      icon: "creditcard",
      onPress: () => navigateTo("PaymentMethods"),
    },
    {
      title: "Notification Settings",
      icon: "bell.fill",
      onPress: () => navigateTo("NotificationSettings"),
    },
    {
      title: "Privacy Settings",
      icon: "lock.fill",
      onPress: () => navigateTo("PrivacySettings"),
    },
    {
      title: "Help & Support",
      icon: "questionmark.circle",
      onPress: () => navigateTo("Support"),
    },
    {
      title: "About",
      icon: "info.circle",
      onPress: () => navigateTo("About"),
    },
  ];

  // Add artist-specific options if user is an artist
  const allMenuItems = [...menuItems];
  if (isArtist) {
    allMenuItems.splice(2, 0, {
      title: "Payout Settings",
      icon: "dollarsign.circle",
      onPress: () => navigateTo("PayoutSettings"),
    });
  }

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View
        style={[
          styles.header,
          { borderBottomColor: Colors[colorScheme].border },
          { paddingTop: insets.top || 20 },
        ]}
      >
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          {isArtist ? "Artist Account" : "My Account"}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User info section */}
        <View
          style={[
            styles.profileSection,
            { borderBottomColor: Colors[colorScheme].border },
          ]}
        >
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.initials}>
              {getInitials(user?.displayName)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text
              style={[styles.userName, { color: Colors[colorScheme].text }]}
              numberOfLines={1}
            >
              {user?.name || "User Name"}
            </Text>
            <Text
              style={[
                styles.userEmail,
                { color: Colors[colorScheme].secondaryText },
              ]}
              numberOfLines={1}
            >
              {user?.email || "user@example.com"}
            </Text>
            {isArtist && (
              <View style={styles.badgeContainer}>
                <Text style={styles.artistBadge}>Artist</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigateTo("EditProfile")}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View
          style={[
            styles.menuSection,
            { borderColor: Colors[colorScheme].border },
          ]}
        >
          {allMenuItems.map((item, index) => (
            <MenuItem
              key={`menu-item-${index}`}
              {...item}
              colorScheme={colorScheme}
            />
          ))}
        </View>

        {/* Sign out button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={handleLogout}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sign out from account"
          accessibilityHint="Logs you out of your account"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text
          style={[
            styles.versionText,
            { color: Colors[colorScheme].secondaryText },
          ]}
        >
          Version 1.0.3
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  initials: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  badgeContainer: {
    marginTop: 6,
  },
  artistBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#007AFF",
    color: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  menuSection: {
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        backgroundColor: "#F2F2F7",
      },
      android: {
        backgroundColor: "#FFFFFF",
        elevation: 2,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E1E1E1",
    backgroundColor: "transparent",
  },
  menuItemPressed: {
    backgroundColor: "#EFEFEF",
  },
  menuIcon: {
    marginRight: 4,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  signOutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    alignItems: "center",
  },
  signOutButtonPressed: {
    backgroundColor: "#E0352C",
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
  },
});
