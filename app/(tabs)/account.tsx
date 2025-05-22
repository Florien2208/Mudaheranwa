import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import { useFocusEffect } from "@react-navigation/native";

// Available languages
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
];

// Extract menu item component for better organization
const MenuItem = ({ icon, title, onPress, colorScheme, rightContent }) => (
  <Pressable
    style={({ pressed }) => [
      styles.menuItem,
      pressed && styles.menuItemPressed,
      { borderBottomColor: Colors[colorScheme].border },
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
      color={Colors[colorScheme].icon}
      style={styles.menuIcon}
    />
    <Text
      style={[styles.menuItemText, { color: Colors[colorScheme].text }]}
      numberOfLines={1}
    >
      {title}
    </Text>
    {rightContent || (
      <IconSymbol
        name="chevron.right"
        size={16}
        color={Colors[colorScheme].secondaryText}
        style={styles.chevron}
      />
    )}
  </Pressable>
);

export default function AccountScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuthStore();
  const isArtist = user?.isArtist;
  const insets = useSafeAreaInsets();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");

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
    } catch (error) {
      console.error("Logout failed:", error);
      // Could show an error toast here
    }
  };

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleLanguageSelect = (language) => {
    setCurrentLanguage(language.name);
    setLanguageModalVisible(false);
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
      title: "Language",
      icon: "globe",
      onPress: () => setLanguageModalVisible(true),
      rightContent: (
        <Text
          style={{ color: Colors[colorScheme].secondaryText, fontSize: 14 }}
        >
          {currentLanguage}
        </Text>
      ),
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
          <View
            style={[
              styles.profileImagePlaceholder,
              { backgroundColor: Colors[colorScheme].tint },
            ]}
          >
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
              <View
                style={[
                  styles.badgeContainer,
                  { backgroundColor: Colors[colorScheme].tint },
                ]}
              >
                <Text
                  style={[
                    styles.artistBadge,
                    { color: colorScheme === "dark" ? "#0b1c26" : "#FFFFFF" },
                  ]}
                >
                  Artist
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: colorScheme === "dark" ? "#143544" : "#d0f0f5",
              },
            ]}
            onPress={() => navigateTo("EditProfile")}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.editButtonText,
                { color: Colors[colorScheme].tint },
              ]}
            >
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View
          style={[
            styles.menuSection,
            {
              borderColor: Colors[colorScheme].border,
              backgroundColor: colorScheme === "dark" ? "#143544" : "#d0f0f5",
            },
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
            { backgroundColor: colorScheme === "dark" ? "#143544" : "#d0f0f5" },
          ]}
          onPress={handleLogout}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sign out from account"
          accessibilityHint="Logs you out of your account"
        >
          <Text style={[styles.signOutText, { color: "#FF3B30" }]}>
            Sign Out
          </Text>
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

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#143544" : "#d0f0f5",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: Colors[colorScheme].text }]}
              >
                Select Language
              </Text>
              <TouchableOpacity
                onPress={() => setLanguageModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={Colors[colorScheme].text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    currentLanguage === language.name && {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(158, 255, 255, 0.2)"
                          : "rgba(0, 188, 212, 0.2)",
                    },
                  ]}
                  onPress={() => handleLanguageSelect(language)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {language.name}
                  </Text>
                  {currentLanguage === language.name && (
                    <IconSymbol
                      name="checkmark"
                      size={18}
                      color={Colors[colorScheme].tint}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  artistBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    padding: 8,
    borderRadius: 16,
  },
  editButtonText: {
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
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
    backgroundColor: "transparent",
  },
  menuItemPressed: {
    opacity: 0.7,
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
    borderRadius: 12,
    alignItems: "center",
  },
  signOutButtonPressed: {
    opacity: 0.7,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E1E1E1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E1E1E1",
  },
  languageText: {
    fontSize: 16,
  },
});
