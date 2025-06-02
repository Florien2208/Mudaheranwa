import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Notification {
  id: string;
  type: "like" | "follow" | "comment" | "release";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  date: string;
}

const AllNotificationsScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Mock data - replace with actual API call
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Mock notifications - replace with actual API call
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "like",
        title: "New Like",
        message: "Sarah Connor liked your track 'Midnight Dreams'",
        time: "2 minutes ago",
        date: "Today",
        isRead: false,
      },
      {
        id: "2",
        type: "follow",
        title: "New Follower",
        message: "John Doe started following you",
        time: "15 minutes ago",
        date: "Today",
        isRead: false,
      },
      {
        id: "3",
        type: "comment",
        title: "New Comment",
        message: "Alex wrote: 'Amazing beat! Can't stop listening to this'",
        time: "1 hour ago",
        date: "Today",
        isRead: true,
      },
      {
        id: "4",
        type: "release",
        title: "Track Published",
        message: "Your track 'Summer Vibes' has been successfully published",
        time: "3 hours ago",
        date: "Today",
        isRead: true,
      },
      {
        id: "5",
        type: "like",
        title: "Track Milestone",
        message: "Your track 'Night Drive' reached 100 likes!",
        time: "Yesterday",
        date: "Yesterday",
        isRead: true,
      },
      {
        id: "6",
        type: "follow",
        title: "New Follower",
        message: "Emma Watson started following you",
        time: "Yesterday",
        date: "Yesterday",
        isRead: true,
      },
    ];
    setNotifications(mockNotifications);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

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

  const filteredNotifications = notifications.filter((notification) =>
    filter === "all" ? true : !notification.isRead
  );

  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const date = notification.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    },
    {} as Record<string, Notification[]>
  );

  const renderNotificationItem = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.isRead
              ? "transparent"
              : isDark
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(76, 175, 80, 0.05)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          },
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: getNotificationColor(item.type) + "20",
            },
          ]}
        >
          <IconSymbol
            name={getNotificationIcon(item.type)}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>

        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationTitle,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.notificationMessage,
              { color: isDark ? "#CCCCCC" : "#666666" },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.notificationTime,
              { color: isDark ? "#999999" : "#888888" },
            ]}
          >
            {item.time}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSection = ({ item }: { item: [string, Notification[]] }) => {
    const [date, sectionNotifications] = item;
    return (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? "#FFFFFF" : "#000000" },
          ]}
        >
          {date}
        </Text>
        {sectionNotifications.map((notification, index) =>
          renderNotificationItem({ item: notification, index })
        )}
      </View>
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#FFFFFF" },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            },
          ]}
        >
          <IconSymbol
            name="chevron.left"
            size={24}
            color={isDark ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={markAllAsRead} disabled={unreadCount === 0}>
          <Text
            style={[
              styles.markAllRead,
              {
                color: unreadCount > 0 ? "#4CAF50" : isDark ? "#666" : "#999",
              },
            ]}
          >
            Mark All Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && styles.activeFilterTab,
            {
              backgroundColor:
                filter === "all"
                  ? "#4CAF50"
                  : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
            },
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "all" ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000",
              },
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "unread" && styles.activeFilterTab,
            {
              backgroundColor:
                filter === "unread"
                  ? "#4CAF50"
                  : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
            },
          ]}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "unread"
                    ? "#FFFFFF"
                    : isDark
                    ? "#FFFFFF"
                    : "#000000",
              },
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={Object.entries(groupedNotifications)}
        renderItem={renderSection}
        keyExtractor={(item) => item[0]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <IconSymbol
              name="bell.slash"
              size={48}
              color={isDark ? "#666" : "#999"}
            />
            <Text
              style={[styles.emptyText, { color: isDark ? "#666" : "#999" }]}
            >
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </Text>
            <Text
              style={[styles.emptySubtext, { color: isDark ? "#555" : "#BBB" }]}
            >
              We'll notify you when something happens
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
  },
  badge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },
  markAllRead: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  activeFilterTab: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
  },
  listContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    marginLeft: 20,
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginLeft: 12,
    marginTop: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    marginTop: 8,
    textAlign: "center",
  },
});

export default AllNotificationsScreen;
