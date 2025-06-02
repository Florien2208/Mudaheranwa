import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface Notification {
  id: string;
  type: "like" | "follow" | "comment" | "release";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationPress: (id: string) => void;
  onSeeAll: () => void;
  isDark: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onNotificationPress,
  onSeeAll,
  isDark,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "heart.fill";
      case "follow":
        return "person.badge.plus";
      case "comment":
        return "message.fill";
      case "release":
        return "music.note";
      default:
        return "bell.fill";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "like":
        return "#FF6B6B";
      case "follow":
        return "#4ECDC4";
      case "comment":
        return "#45B7D1";
      case "release":
        return "#4CAF50";
      default:
        return "#666";
    }
  };

  return (
    <View
      style={[
        styles.dropdown,
        {
          backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          borderColor: isDark ? "#333" : "#E0E0E0",
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? "#FFFFFF" : "#000000" },
          ]}
        >
          Notifications
        </Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="bell.slash"
              size={32}
              color={isDark ? "#666" : "#999"}
            />
            <Text
              style={[styles.emptyText, { color: isDark ? "#666" : "#999" }]}
            >
              No notifications yet
            </Text>
          </View>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                {
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : isDark
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(76, 175, 80, 0.05)",
                },
              ]}
              onPress={() => onNotificationPress(notification.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      getNotificationColor(notification.type) + "20",
                  },
                ]}
              >
                <IconSymbol
                  name={getNotificationIcon(notification.type)}
                  size={16}
                  color={getNotificationColor(notification.type)}
                />
              </View>

              <View style={styles.notificationContent}>
                <Text
                  style={[
                    styles.notificationTitle,
                    { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>
                <Text
                  style={[
                    styles.notificationMessage,
                    { color: isDark ? "#CCCCCC" : "#666666" },
                  ]}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>
                <Text
                  style={[
                    styles.notificationTime,
                    { color: isDark ? "#999999" : "#888888" },
                  ]}
                >
                  {notification.time}
                </Text>
              </View>

              {!notification.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 320,
    maxHeight: 400,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
  },
  seeAllText: {
    color: "#4CAF50",
    fontSize: 14,
    fontFamily: "PoppinsMedium",
  },
  notificationsList: {
    maxHeight: 320,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "PoppinsRegular",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: "PoppinsRegular",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: "PoppinsRegular",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationDropdown;
