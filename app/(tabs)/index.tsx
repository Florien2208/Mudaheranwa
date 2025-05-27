import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  Text,
} from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/store/AuthContext";
import useAuthStore from "@/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@/constants";
import { Audio } from "expo-av";

// Define types for our data
interface Song {
  id: string;
  title: string;
  artist: string;
  coverArt: ImageSourcePropType | { uri: string };
  audioUrl: string;
  duration?: string;
}

// Custom ThemedText component with proper color handling
const ThemedText: React.FC<{
  style?: any;
  children: React.ReactNode;
  type?: "default" | "title" | "subtitle" | "caption" | "link";
}> = ({ style, children, type = "default" }) => {
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

  return <Text style={[{ color: getTextColor() }, style]}>{children}</Text>;
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

  const isDark = colorScheme === "dark";

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
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

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

  const renderFeaturedItem = ({ item }: { item: Song }): React.ReactElement => (
    <TouchableOpacity
      style={styles.featuredItem}
      onPress={() => playAudio(item)}
    >
      <Image source={item.coverArt} style={styles.featuredCover} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.featuredGradient}
      >
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredArtist}>{item.artist}</Text>
        <Text style={styles.featuredDuration}>{item.duration || "--:--"}</Text>
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
        style={[
          styles.trendingItem,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.02)",
          },
        ]}
        onPress={() => playAudio(item)}
      >
        <Image source={item.coverArt} style={styles.trendingCover} />
        <View style={styles.trendingInfo}>
          <ThemedText style={styles.trendingTitle} type="subtitle">
            {item.title}
          </ThemedText>
          <ThemedText style={styles.trendingArtist} type="caption">
            {item.artist}
          </ThemedText>
          <ThemedText style={styles.trendingDuration} type="caption">
            {item.duration || "--:--"}
          </ThemedText>
        </View>
        <View
          style={[
            styles.playButtonContainer,
            {
              backgroundColor: isDark
                ? "rgba(76, 175, 80, 0.2)"
                : "rgba(76, 175, 80, 0.1)",
            },
          ]}
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
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#FFFFFF" },
      ]}
    >
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting} type="caption">
            {greeting}
          </ThemedText>
          <ThemedText style={styles.username} type="title">
            {user?.username || "Music Lover"}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.navigate("/")}>
          <View
            style={[
              styles.iconButton,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            ]}
          >
            <IconSymbol
              name="bell.fill"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[1]} // Dummy data for the main scrollable content
        renderItem={() => (
          <View style={styles.content}>
            {/* Featured Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type="title">
                Featured
              </ThemedText>
              <FlatList
                horizontal
                data={songs}
                renderItem={renderFeaturedItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                style={styles.featuredList}
              />
            </View>

            {/* Trending Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type="title">
                Trending Now
              </ThemedText>
              <View style={styles.trendingList}>
                {songs.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderTrendingItem({ item })}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* For Artist Section - only shown to artists */}
            {user?.isArtist && (
              <Animated.View
                entering={FadeIn.duration(800)}
                style={styles.section}
              >
                <ThemedText style={styles.sectionTitle} type="title">
                  Your Music
                </ThemedText>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.navigate("/create")}
                >
                  <LinearGradient
                    colors={["#4CAF50", "#2E7D32"]}
                    style={styles.createButtonGradient}
                  >
                    <IconSymbol name="plus" size={24} color="#fff" />
                    <Text style={styles.createButtonText}>
                      Create New Track
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}
      />

      {/* Now Playing Bar - only shown when a track is playing */}
      {currentTrack && (
        <View
          style={[
            styles.nowPlaying,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
            },
          ]}
        >
          <Image
            source={currentTrack.coverArt}
            style={styles.nowPlayingCover}
          />
          <View style={styles.nowPlayingInfo}>
            <ThemedText style={styles.nowPlayingTitle} type="subtitle">
              {currentTrack.title}
            </ThemedText>
            <ThemedText style={styles.nowPlayingArtist} type="caption">
              {currentTrack.artist}
            </ThemedText>
            <ThemedText style={styles.nowPlayingDuration} type="caption">
              {playbackPosition} /{" "}
              {playbackDuration || currentTrack.duration || "--:--"}
            </ThemedText>
          </View>
          <View style={styles.nowPlayingControls}>
            <TouchableOpacity onPress={playPreviousTrack}>
              <IconSymbol
                name="backward.fill"
                size={24}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playPauseButton}
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
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.8,
  },
  username: {
    fontSize: 28,
    fontFamily: "PoppinsBold",
    marginTop: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "PoppinsSemiBold",
    marginLeft: 20,
    marginBottom: 20,
  },
  featuredList: {
    paddingLeft: 20,
  },
  featuredItem: {
    width: width * 0.8,
    height: 220,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  featuredCover: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
    padding: 20,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredArtist: {
    color: "#FFFFFF",
    fontSize: 15,
    opacity: 0.9,
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredDuration: {
    color: "#FFFFFF",
    fontSize: 13,
    opacity: 0.8,
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trendingList: {
    paddingHorizontal: 20,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trendingCover: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  trendingTitle: {
    fontSize: 17,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 2,
  },
  trendingArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  trendingDuration: {
    fontSize: 12,
  },
  playButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "PoppinsSemiBold",
    marginLeft: 10,
  },
  nowPlaying: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 90,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  nowPlayingCover: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  nowPlayingInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 2,
  },
  nowPlayingArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  nowPlayingDuration: {
    fontSize: 12,
  },
  nowPlayingControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  playPauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
