import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";

export default function FansSubscribersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState("subscribers");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for subscribers
  const [subscribers, setSubscribers] = useState([
    {
      id: "1",
      name: "Emma Johnson",
      username: "@emmaj",
      imageUrl: null,
      subscribedDate: "Mar 15, 2025",
      tier: "Premium",
      isVerified: true,
    },
    {
      id: "2",
      name: "Michael Chen",
      username: "@mikechen",
      imageUrl: null,
      subscribedDate: "Apr 22, 2025",
      tier: "Standard",
      isVerified: false,
    },
    {
      id: "3",
      name: "Sarah Williams",
      username: "@sarahwms",
      imageUrl: null,
      subscribedDate: "Feb 10, 2025",
      tier: "Premium",
      isVerified: true,
    },
    {
      id: "4",
      name: "James Rodriguez",
      username: "@jamesrod",
      imageUrl: null,
      subscribedDate: "May 2, 2025",
      tier: "Standard",
      isVerified: false,
    },
    {
      id: "5",
      name: "Olivia Parker",
      username: "@oliviap",
      imageUrl: null,
      subscribedDate: "Jan 18, 2025",
      tier: "Premium",
      isVerified: false,
    },
  ]);

  // Mock data for superfans (top subscribers)
  const [superfans, setSuperfans] = useState([
    {
      id: "1",
      name: "Emma Johnson",
      username: "@emmaj",
      imageUrl: null,
      supportAmount: "$245",
      interactions: 126,
    },
    {
      id: "3",
      name: "Sarah Williams",
      username: "@sarahwms",
      imageUrl: null,
      supportAmount: "$178",
      interactions: 93,
    },
    {
      id: "6",
      name: "David Kim",
      username: "@davek",
      imageUrl: null,
      supportAmount: "$122",
      interactions: 87,
    },
  ]);

  // Filtered subscribers based on search
  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats data
  const subscriberStats = {
    total: subscribers.length,
    premium: subscribers.filter((s) => s.tier === "Premium").length,
    standard: subscribers.filter((s) => s.tier === "Standard").length,
    growth: "+12%",
  };

  const tintColor = isDark ? "#2C9CFF" : "#007AFF";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const bgColor = isDark ? "#121212" : "#FFFFFF";
  const cardBgColor = isDark ? "#1E1E1E" : "#F5F5F5";
  const borderColor = isDark ? "#333333" : "#E1E1E1";

  // Simulate loading subscribers (would fetch from API in a real app)
  useEffect(() => {
    if (activeTab === "recent") {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Send message to subscriber
  const sendMessage = (subscriberId) => {
    // In a real app, this would open a messaging interface
    console.log(`Opening message interface for subscriber ID: ${subscriberId}`);
  };

  // Render subscriber item
  const renderSubscriberItem = ({ item }) => (
    <View style={[styles.subscriberCard, { backgroundColor: cardBgColor }]}>
      <View style={styles.subscriberHeader}>
        <View style={styles.subscriberProfile}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.subscriberImage} />
          ) : (
            <View style={[styles.subscriberImagePlaceholder, { backgroundColor: tintColor }]}>
              <Text style={styles.subscriberInitials}>
                {item.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
          )}
          <View style={styles.subscriberInfo}>
            <View style={styles.nameContainer}>
              <Text style={[styles.subscriberName, { color: textColor }]}>
                {item.name}
              </Text>
              {item.isVerified && (
                <IconSymbol name="checkmark.seal.fill" size={14} color={tintColor} />
              )}
            </View>
            <Text style={styles.subscriberUsername}>{item.username}</Text>
          </View>
        </View>
        <View
          style={[
            styles.tierBadge,
            {
              backgroundColor:
                item.tier === "Premium"
                  ? "rgba(255, 195, 0, 0.2)"
                  : "rgba(0, 122, 255, 0.1)",
            },
          ]}
        >
          <Text
            style={[
              styles.tierText,
              {
                color: item.tier === "Premium" ? "#FFC300" : tintColor,
              },
            ]}
          >
            {item.tier}
          </Text>
        </View>
      </View>

      <View style={styles.subscriberFooter}>
        <Text style={styles.subscribedDate}>Subscribed: {item.subscribedDate}</Text>
        <TouchableOpacity
          style={[styles.messageButton, { borderColor: tintColor }]}
          onPress={() => sendMessage(item.id)}
        >
          <IconSymbol name="message" size={14} color={tintColor} />
          <Text style={[styles.messageText, { color: tintColor }]}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render superfan item
  const renderSuperfanItem = ({ item }) => (
    <View style={[styles.superfanCard, { backgroundColor: cardBgColor }]}>
      <View style={styles.superfanProfile}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.superfanImage} />
        ) : (
          <View style={[styles.superfanImagePlaceholder, { backgroundColor: tintColor }]}>
            <Text style={styles.superfanInitials}>
              {item.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
        )}
        <View style={styles.superfanTextInfo}>
          <Text style={[styles.superfanName, { color: textColor }]}>{item.name}</Text>
          <Text style={styles.superfanUsername}>{item.username}</Text>
        </View>
      </View>

      <View style={styles.superfanStats}>
        <View style={styles.superfanStatItem}>
          <Text style={styles.superfanStatLabel}>Support</Text>
          <Text style={[styles.superfanStatValue, { color: textColor }]}>
            {item.supportAmount}
          </Text>
        </View>
        <View style={styles.superfanStatItem}>
          <Text style={styles.superfanStatLabel}>Interactions</Text>
          <Text style={[styles.superfanStatValue, { color: textColor }]}>
            {item.interactions}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.superfanButton, { backgroundColor: tintColor }]}
          onPress={() => sendMessage(item.id)}
        >
          <Text style={styles.superfanButtonText}>Thank</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Your Fans</Text>
          <Text style={styles.headerSubtitle}>
            {subscribers.length} subscribers supporting your music
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <IconSymbol name="bell.fill" size={20} color={tintColor} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "subscribers" && styles.activeTab,
            { borderBottomColor: tintColor },
          ]}
          onPress={() => setActiveTab("subscribers")}
        >
          <IconSymbol
            name="person.2.fill"
            size={18}
            color={activeTab === "subscribers" ? tintColor : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "subscribers" ? tintColor : "#999" },
            ]}
          >
            All Subscribers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "superfans" && styles.activeTab,
            { borderBottomColor: tintColor },
          ]}
          onPress={() => setActiveTab("superfans")}
        >
          <IconSymbol
            name="star.fill"
            size={18}
            color={activeTab === "superfans" ? tintColor : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "superfans" ? tintColor : "#999" },
            ]}
          >
            Superfans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "recent" && styles.activeTab,
            { borderBottomColor: tintColor },
          ]}
          onPress={() => setActiveTab("recent")}
        >
          <IconSymbol
            name="clock.fill"
            size={18}
            color={activeTab === "recent" ? tintColor : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "recent" ? tintColor : "#999" },
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "subscribers" && (
          <>
            {/* Stats Overview */}
            <View style={[styles.statsCard, { backgroundColor: cardBgColor }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {subscriberStats.total}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {subscriberStats.premium}
                </Text>
                <Text style={styles.statLabel}>Premium</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {subscriberStats.standard}
                </Text>
                <Text style={styles.statLabel}>Standard</Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: textColor }]}
                >
                  {subscriberStats.growth}
                </Text>
                <Text style={styles.statLabel}>Growth</Text>
              </View>
            </View>

            {/* Search */}
            <View style={[styles.searchContainer, { backgroundColor: cardBgColor }]}>
              <IconSymbol name="magnifyingglass" size={18} color="#999" />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search subscribers..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <IconSymbol name="xmark.circle.fill" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Subscribers List */}
            <FlatList
              data={filteredSubscribers}
              renderItem={renderSubscriberItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.subscribersList}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {activeTab === "superfans" && (
          <ScrollView style={styles.superfansContainer} showsVerticalScrollIndicator={false}>
            {/* Top Supporters Banner */}
            <View style={[styles.superfansBanner, { backgroundColor: cardBgColor }]}>
              <View style={styles.superfansBannerContent}>
                <IconSymbol name="heart.fill" size={24} color="#FF375F" />
                <View style={styles.superfansBannerText}>
                  <Text style={[styles.superfansBannerTitle, { color: textColor }]}>
                    Your Top Supporters
                  </Text>
                  <Text style={styles.superfansBannerSubtitle}>
                    Fans who contribute the most to your success
                  </Text>
                </View>
              </View>
            </View>

            {/* Fan Engagement Tips */}
            <View style={[styles.tipsCard, { backgroundColor: cardBgColor }]}>
              <Text style={[styles.tipsTitle, { color: textColor }]}>
                Fan Engagement Tips
              </Text>
              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: "rgba(255, 149, 0, 0.1)" }]}>
                  <IconSymbol name="gift.fill" size={14} color="#FF9500" />
                </View>
                <Text style={styles.tipText}>
                  Consider offering exclusive content to your superfans
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: "rgba(88, 86, 214, 0.1)" }]}>
                  <IconSymbol name="mic.fill" size={14} color="#5856D6" />
                </View>
                <Text style={styles.tipText}>
                  Host monthly Q&A sessions with premium subscribers
                </Text>
              </View>
            </View>

            {/* Superfans List */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Your Superfans</Text>
            {superfans.map((fan) => renderSuperfanItem({ item: fan }))}
          </ScrollView>
        )}

        {activeTab === "recent" && (
          <View style={styles.recentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={tintColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Loading recent subscribers...
                </Text>
              </View>
            ) : (
              <View style={styles.recentContent}>
                <View style={[styles.recentHeader, { backgroundColor: cardBgColor }]}>
                  <Text style={[styles.recentTitle, { color: textColor }]}>
                    New Subscribers
                  </Text>
                  <Text style={styles.recentSubtitle}>Last 30 days</Text>
                </View>

                {/* Recent Subscriber List */}
                <View style={[styles.recentStats, { backgroundColor: cardBgColor }]}>
                  <View style={styles.recentStatItem}>
                    <Text style={[styles.recentStatValue, { color: textColor }]}>2</Text>
                    <Text style={styles.recentStatLabel}>This Week</Text>
                  </View>
                  <View style={styles.recentStatDivider} />
                  <View style={styles.recentStatItem}>
                    <Text style={[styles.recentStatValue, { color: textColor }]}>7</Text>
                    <Text style={styles.recentStatLabel}>This Month</Text>
                  </View>
                </View>

                {/* New Subscribers */}
                <View style={[styles.newSubscribersCard, { backgroundColor: cardBgColor }]}>
                  {subscribers
                    .slice(0, 2)
                    .map((subscriber) => (
                      <View key={subscriber.id} style={styles.newSubscriberItem}>
                        {subscriber.imageUrl ? (
                          <Image
                            source={{ uri: subscriber.imageUrl }}
                            style={styles.newSubscriberImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.newSubscriberImagePlaceholder,
                              { backgroundColor: tintColor },
                            ]}
                          >
                            <Text style={styles.newSubscriberInitials}>
                              {subscriber.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </Text>
                          </View>
                        )}
                        <View style={styles.newSubscriberInfo}>
                          <Text style={[styles.newSubscriberName, { color: textColor }]}>
                            {subscriber.name}
                          </Text>
                          <Text style={styles.newSubscriberDate}>
                            Joined {subscriber.subscribedDate}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.welcomeButton, { backgroundColor: tintColor }]}
                          onPress={() => sendMessage(subscriber.id)}
                        >
                          <Text style={styles.welcomeButtonText}>Welcome</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>

                {/* Retention Tips */}
                <View style={[styles.retentionCard, { backgroundColor: cardBgColor }]}>
                  <View style={styles.retentionHeader}>
                    <IconSymbol name="chart.line.uptrend.xyaxis" size={22} color={tintColor} />
                    <Text style={[styles.retentionTitle, { color: textColor }]}>
                      Subscriber Retention
                    </Text>
                  </View>
                  <Text style={styles.retentionText}>
                    Engaging with new subscribers in their first week increases
                    retention by 65%. Consider sending a welcome message or exclusive
                    track.
                  </Text>
                  <TouchableOpacity
                    style={[styles.retentionButton, { borderColor: tintColor }]}
                  >
                    <Text style={[styles.retentionButtonText, { color: tintColor }]}>
                      View Retention Guide
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 12,
    marginRight: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 16,
  },
  subscribersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subscriberCard: {
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  subscriberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subscriberProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  subscriberImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  subscriberInitials: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subscriberInfo: {
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriberName: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 5,
  },
  subscriberUsername: {
    fontSize: 14,
    color: "#999",
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "600",
  },
  subscriberFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  subscribedDate: {
    fontSize: 12,
    color: "#999",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 5,
  },
  // Superfans tab styles
  superfansContainer: {
    flex: 1,
    padding: 20,
  },
  superfansBanner: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  superfansBannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  superfansBannerText: {
    marginLeft: 12,
  },
  superfansBannerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  superfansBannerSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#999",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  superfanCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  superfanProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  superfanImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  superfanImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  superfanInitials: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  superfanTextInfo: {
    marginLeft: 12,
  },
  superfanName: {
    fontSize: 16,
    fontWeight: "600",
  },
  superfanUsername: {
    fontSize: 14,
    color: "#999",
  },
  superfanStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  superfanStatItem: {
    alignItems: "flex-start",
  },
  superfanStatLabel: {
    fontSize: 12,
    color: "#999",
  },
  superfanStatValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  superfanButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
  },
  superfanButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  // Recent tab styles
  recentContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  recentContent: {
    flex: 1,
  },
  recentHeader: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  recentSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  recentStats: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  recentStatItem: {
    flex: 1,
    alignItems: "center",
  },
  recentStatDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(150, 150, 150, 0.2)",
  },
  recentStatValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  recentStatLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  newSubscribersCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  newSubscriberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  newSubscriberImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  newSubscriberImagePlaceholder: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  newSubscriberInitials: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  newSubscriberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  newSubscriberName: {
    fontSize: 15,
    fontWeight: "600",
  },
  newSubscriberDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  welcomeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  welcomeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  retentionCard: {
    borderRadius: 12,
    padding: 15,
  },
  retentionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  retentionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  retentionText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  retentionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  retentionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});