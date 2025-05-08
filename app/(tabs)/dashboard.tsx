import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";

// Mock data for demonstration
const mockStats = {
  totalPlays: 12450,
  monthlyPlays: 2340,
  totalFollowers: 487,
  newFollowers: 24,
  revenue: 582.4,
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Summary cards */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Plays"
            value={mockStats.totalPlays.toLocaleString()}
            icon="play.fill"
            colorScheme={colorScheme}
          />
          <StatsCard
            title="Monthly Plays"
            value={mockStats.monthlyPlays.toLocaleString()}
            icon="calendar"
            colorScheme={colorScheme}
          />
          <StatsCard
            title="Followers"
            value={mockStats.totalFollowers.toLocaleString()}
            secondaryValue={`+${mockStats.newFollowers} this month`}
            icon="person.2.fill"
            colorScheme={colorScheme}
          />
          <StatsCard
            title="Revenue"
            value={`$${mockStats.revenue.toFixed(2)}`}
            icon="dollarsign.circle.fill"
            colorScheme={colorScheme}
          />
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <ActionButton
              title="Upload Music"
              icon="arrow.up.circle"
              onPress={() => console.log("Navigate to Upload")}
              colorScheme={colorScheme}
            />
            <ActionButton
              title="Analytics"
              icon="chart.bar.fill"
              onPress={() => console.log("Navigate to Analytics")}
              colorScheme={colorScheme}
            />
            <ActionButton
              title="Payouts"
              icon="dollarsign.square"
              onPress={() => console.log("Navigate to Payouts")}
              colorScheme={colorScheme}
            />
            <ActionButton
              title="Promote"
              icon="megaphone.fill"
              onPress={() => console.log("Navigate to Promotion")}
              colorScheme={colorScheme}
            />
          </View>
        </View>

        {/* Recent activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <ActivityItem
              title="New subscriber: John D."
              time="2 hours ago"
              icon="person.badge.plus"
              colorScheme={colorScheme}
            />
            <ActivityItem
              title="Payment received: $42.50"
              time="Yesterday"
              icon="dollarsign.circle"
              colorScheme={colorScheme}
            />
            <ActivityItem
              title="'Summer Vibes' reached 1,000 plays"
              time="2 days ago"
              icon="music.note"
              colorScheme={colorScheme}
            />
            <ActivityItem
              title="New comment on 'Late Night'"
              time="3 days ago"
              icon="text.bubble"
              colorScheme={colorScheme}
            />
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Activity</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Component for statistics cards
function StatsCard({ title, value, secondaryValue, icon, colorScheme }) {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsIconContainer}>
        <IconSymbol name={icon} size={24} color={Colors[colorScheme].tint} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      {secondaryValue && (
        <Text style={styles.statsSecondaryValue}>{secondaryValue}</Text>
      )}
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );
}

// Component for action buttons
function ActionButton({ title, icon, onPress, colorScheme }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: Colors[colorScheme].tint },
        ]}
      >
        <IconSymbol name={icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

// Component for activity items
function ActivityItem({ title, time, icon, colorScheme }) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <IconSymbol name={icon} size={18} color={Colors[colorScheme].tint} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  statsCard: {
    width: "50%",
    padding: 10,
  },
  statsIconContainer: {
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statsSecondaryValue: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 2,
  },
  statsTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  actionButton: {
    width: "25%",
    alignItems: "center",
    padding: 5,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  actionButtonText: {
    fontSize: 12,
    textAlign: "center",
  },
  activityList: {
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  viewAllText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
