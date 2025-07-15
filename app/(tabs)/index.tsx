import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "@/constants";
import useAuthStore from "@/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Audio } from "expo-av";
import NotificationDropdown from "./Account/dropdownNotification";
import { useTranslation } from "react-i18next";

// Define types for our data
interface Song {
  id: string;
  title: string;
  artist: string;
  coverArt: ImageSourcePropType | { uri: string };
  audioUrl: string;
  duration?: string;
}
interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string; // Changed from 'message' to 'body'
  data: any;
  read: boolean; // Changed from 'isRead' to 'read'
  createdAt: string;
  // Add computed properties for display
  time?: string;
  type?: "like" | "follow" | "comment" | "release" | "offer";
}

// Custom ThemedText component with proper color handling
const ThemedText: React.FC<{
  style?: any;
  children: React.ReactNode;
  type?: "default" | "title" | "subtitle" | "caption" | "link";
  className?: string;
}> = ({ style, children, type = "default", className = "" }) => {
  const colorScheme = useColorScheme();

  const getTextColor = () => {
    const isDark = colorScheme === "dark";
    switch (type) {
      case "title":
        return isDark ? "#FFFFFF" : "#1A1A1A";
      case "subtitle":
        return isDark ? "#E0E0E0" : "#2A2A2A";
      case "caption":
        return isDark ? "#A0A0A0" : "#666666";
      case "link":
        return isDark ? "#4CAF50" : "#2E7D32";
      default:
        return isDark ? "#F0F0F0" : "#333333";
    }
  };

  return (
    <Text className={className} style={[{ color: getTextColor() }, style]}>
      {children}
    </Text>
  );
};

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [greeting, setGreeting] = useState<string>("");
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<string>("0:00");
  const [playbackDuration, setPlaybackDuration] = useState<string>("0:00");
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();

  // Add this useEffect after your existing useEffects to load notifications
  useEffect(() => {
    loadNotifications();
  }, []);
  useEffect(() => {
    fetchTracks();
    return () => {
      // Clean up audio on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Set up interval for updating playback position
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && sound) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          // Format position from milliseconds to MM:SS
          const positionMs = status.positionMillis;
          const durationMs = status.durationMillis || 0;
          setPlaybackPosition(formatTime(positionMs));
          setPlaybackDuration(formatTime(durationMs));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, sound]);

  const formatTime = (milliseconds: number): string => {
    if (!milliseconds) return "0:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const loadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/notification/my-notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Transform server data and get only latest 3
      const transformedNotifications: Notification[] =
        response.data.notifications
          .slice(0, 3) // Get only latest 3 notifications
          .map((notification: any) => ({
            ...notification,
            id: notification.id, // Keep both for compatibility
            message: notification.body, // Map body to message for existing components
            time: getTimeAgo(notification.createdAt),
            type: determineNotificationType(
              notification.title,
              notification.body
            ),
            isRead: notification.read,
           
          }));
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to empty array on error
      setNotifications([]);
    }
  };
  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const determineNotificationType = (
    title: string,
    body: string
  ): "like" | "follow" | "comment" | "release" | "offer" => {
    const titleLower = title.toLowerCase();
    const bodyLower = body.toLowerCase();

    if (titleLower.includes("like") || bodyLower.includes("liked"))
      return "like";
    if (titleLower.includes("follow") || bodyLower.includes("follow"))
      return "follow";
    if (titleLower.includes("comment") || bodyLower.includes("comment"))
      return "comment";
    if (titleLower.includes("release") || bodyLower.includes("released"))
      return "release";
    return "offer"; // Default for offers and other types
  };
  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await axios.get(`${API_BASE_URL}/api/v1/music`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch duration for each track
      const fetchedSongs = await Promise.all(
        response.data.map(async (track) => {
          const duration = await calculateAudioDuration(track.audioFile);
          return {
            id: track._id,
            title: track.title,
            artist: track.user.name || "Unknown Artist",
            audioUrl: track.audioFile,
            coverArt: { uri: track.backgroundImage },
            duration: duration,
          };
        })
      );

      setSongs(fetchedSongs);
    } catch (err) {
      console.error("Error fetching songs:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleNotificationPress = (id: string) => {
    // Mark notification as read and handle navigation
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id || notification._id === id
          ? { ...notification, read: true, isRead: true }
          : notification
      )
    );
    setShowNotifications(false);

    // Optionally, send read status to server
    markNotificationAsRead(id);
  };
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");
      await axios.patch(
        `${API_BASE_URL}/api/v1/notification/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  const handleSeeAllNotifications = () => {
    setShowNotifications(false);
    router.navigate("/(tabs)/Account/notification"); // Navigate to all notifications screen
  };

  const calculateAudioDuration = async (audioUri: string): Promise<string> => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }
      );

      const status = await sound.getStatusAsync();
      await sound.unloadAsync(); // Clean up

      // Format duration from milliseconds to MM:SS
      const totalSeconds = Math.floor((status.durationMillis || 0) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    } catch (error) {
      console.error("Error calculating audio duration:", error);
      return "--:--"; // Return placeholder if duration can't be calculated
    }
  };

  useEffect(() => {
    // Set greeting based on time of day
   const hour = new Date().getHours();
   if (hour < 12) {
     setGreeting(t("home.goodMorning"));
   } else if (hour < 18) {
     setGreeting(t("home.goodAfternoon"));
   } else {
     setGreeting(t("home.goodEvening"));
   }
  }, [t]);

  const playAudio = async (song: Song) => {
    try {
      // Find index of the song in the songs array
      const songIndex = songs.findIndex((s) => s.id === song.id);

      // If we're clicking on the already playing track, toggle pause/play
      if (currentTrack?.id === song.id) {
        if (isPlaying) {
          await sound?.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound?.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Stop any currently playing sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Load and play the new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentTrack(song);
      setCurrentTrackIndex(songIndex);
      setIsPlaying(true);

      // Set up playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          // Auto-play next song if available
          playNextTrack();
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Could not play the audio file");
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const playNextTrack = async () => {
    if (songs.length === 0 || currentTrackIndex === -1) return;

    const nextIndex = (currentTrackIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];

    await playAudio(nextSong);
  };

  const playPreviousTrack = async () => {
    if (songs.length === 0 || currentTrackIndex === -1) return;

    // If current position is more than 3 seconds, restart current song
    // instead of going to previous track
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.positionMillis > 3000) {
        await sound.setPositionAsync(0);
        return;
      }
    }

    const prevIndex = (currentTrackIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];

    await playAudio(prevSong);
  };

  const { width } = Dimensions.get("window");

  const renderFeaturedItem = ({ item }: { item: Song }): React.ReactElement => (
    <TouchableOpacity
      className="rounded-2xl overflow-hidden shadow-lg"
      style={{
        width: width * 0.8,
        height: 220,
        marginRight: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      }}
      onPress={() => playAudio(item)}
    >
      <Image source={item.coverArt} className="w-full h-full" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        className="absolute bottom-0 left-0 right-0 justify-end p-5"
        style={{ height: "60%" }}
      >
        <Text
          className="text-white text-xl font-semibold"
          style={{
            fontFamily: "PoppinsSemiBold",
            textShadowColor: "rgba(0,0,0,0.5)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {item.title}
        </Text>
        <Text
          className="text-white text-base opacity-90 mt-1"
          style={{
            textShadowColor: "rgba(0,0,0,0.5)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {item.artist}
        </Text>
        <Text
          className="text-white text-sm opacity-80 mt-1.5"
          style={{
            textShadowColor: "rgba(0,0,0,0.5)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {item.duration || "--:--"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }: { item: Song }): React.ReactElement => (
    <Animated.View
      entering={FadeInRight.delay(
        Number(item.id?.toString()?.slice(-3)) || 0
      ).duration(600)}
    >
      <TouchableOpacity
        className="flex-row items-center h-20 mb-3 rounded-xl px-3 py-2"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.02)",
        }}
        onPress={() => playAudio(item)}
      >
        <Image source={item.coverArt} className="w-16 h-16 rounded-lg" />
        <View className="flex-1 ml-4 mr-3">
          <ThemedText
            className="text-base font-semibold mb-0.5"
            type="subtitle"
          >
            {item.title}
          </ThemedText>
          <ThemedText className="text-sm mb-0.5" type="caption">
            {item.artist}
          </ThemedText>
          <ThemedText className="text-xs" type="caption">
            {item.duration || "--:--"}
          </ThemedText>
        </View>
        <View
          className="w-10 h-10 rounded-full justify-center items-center"
          style={{
            backgroundColor: isDark
              ? "rgba(76, 175, 80, 0.2)"
              : "rgba(76, 175, 80, 0.1)",
          }}
        >
          <IconSymbol
            name={
              currentTrack?.id === item.id && isPlaying
                ? "pause.fill"
                : "play.fill"
            }
            size={20}
            color="#4CAF50"
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? "#121212" : "#FFFFFF" }}
    >
      <View className="flex-row justify-between items-center px-5 mb-7">
        <View>
          <ThemedText className="text-base opacity-80" type="caption">
            {greeting}
          </ThemedText>
          <ThemedText
            className="text-3xl mt-1"
            type="title"
            style={{ fontFamily: "PoppinsBold" }}
          >
            {t("home.musiclover")}
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => setShowNotifications(!showNotifications)}
        >
          <View
            className="w-11 h-11 rounded-full justify-center items-center"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            }}
          >
            <IconSymbol
              name="bell.fill"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
            {notifications.filter((n) => n.read && n.isRead && !n.received)
              .length > 0 && (
              <View className="absolute -top-0.5 -right-0.5 bg-red-400 rounded-2 px-1 py-0.5 min-w-4 items-center">
                <Text
                  className="text-white text-xs font-semibold"
                  style={{ fontFamily: "PoppinsSemiBold" }}
                >
                  {
                    notifications.filter(
                      (n) => n.read && n.isRead && !n.received
                    ).length
                  }
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[1]} // Dummy data for the main scrollable content
        renderItem={() => (
          <View
            className="flex-grow"
            style={{ paddingBottom: currentTrack ? 130 : 40 }}
          >
            {/* Featured Section */}
            <View className="mb-8">
              <ThemedText
                className="text-2xl ml-5 mb-5"
                type="title"
                style={{ fontFamily: "PoppinsSemiBold" }}
              >
                {t("home.featured")}
              </ThemedText>
              <FlatList
                horizontal
                data={songs}
                renderItem={renderFeaturedItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
              />
            </View>

            {/* Trending Section */}
            <View className="mb-8">
              <ThemedText
                className="text-2xl ml-5 mb-5"
                type="title"
                style={{ fontFamily: "PoppinsSemiBold" }}
              >
                {t("home.trendingNow")}
              </ThemedText>
              <View className="px-5">
                {songs.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderTrendingItem({ item })}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* For Artist Section - only shown to artists */}
            {user?.isArtist && (
              <Animated.View entering={FadeIn.duration(800)} className="mb-8">
                <ThemedText
                  className="text-2xl ml-5 mb-5"
                  type="title"
                  style={{ fontFamily: "PoppinsSemiBold" }}
                >
                  {t("home.yourMusic")}
                </ThemedText>
                <TouchableOpacity
                  className="mx-5 rounded-2xl overflow-hidden shadow-md"
                  style={{
                    elevation: 3,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                  }}
                  onPress={() => router.navigate("/create")}
                >
                  <LinearGradient
                    colors={["#4CAF50", "#2E7D32"]}
                    className="flex-row items-center justify-center p-4.5"
                  >
                    <IconSymbol name="plus" size={24} color="#fff" />
                    <Text
                      className="text-white text-base ml-2.5"
                      style={{ fontFamily: "PoppinsSemiBold" }}
                    >
                      Create New Track
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />

      {showNotifications && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onPress={() => setShowNotifications(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            className="absolute top-10 right-0 z-50"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <NotificationDropdown
              notifications={notifications}
              onNotificationPress={handleNotificationPress}
              onSeeAll={handleSeeAllNotifications}
              isDark={isDark}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Now Playing Bar - only shown when a track is playing */}
      {currentTrack && (
        <View
          className="absolute bottom-5 left-5 right-5 h-22 rounded-2xl flex-row items-center px-4 border z-50"
          style={{
            backgroundColor: isDark
              ? "rgba(20, 20, 20, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          }}
        >
          <Image
            source={currentTrack.coverArt}
            className="w-14 h-14 rounded-lg"
          />
          <View className="flex-1 ml-4 mr-3">
            <ThemedText
              className="text-base font-semibold mb-0.5"
              type="subtitle"
            >
              {currentTrack.title}
            </ThemedText>
            <ThemedText className="text-sm mb-0.5" type="caption">
              {currentTrack.artist}
            </ThemedText>
            <ThemedText className="text-xs" type="caption">
              {playbackPosition} /{" "}
              {playbackDuration || currentTrack.duration || "--:--"}
            </ThemedText>
          </View>
          <View className="flex-row items-center gap-5">
            <TouchableOpacity onPress={playPreviousTrack}>
              <IconSymbol
                name="backward.fill"
                size={24}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-green-500 justify-center items-center shadow-sm"
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
              onPress={() =>
                isPlaying ? pauseAudio() : playAudio(currentTrack)
              }
            >
              <IconSymbol
                name={isPlaying ? "pause.fill" : "play.fill"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={playNextTrack}>
              <IconSymbol
                name="forward.fill"
                size={24}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
