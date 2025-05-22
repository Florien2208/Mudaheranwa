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
} from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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
        <ThemedText style={styles.featuredTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.featuredArtist}>{item.artist}</ThemedText>
        <ThemedText style={styles.featuredDuration}>
          {item.duration || "--:--"}
        </ThemedText>
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
        style={styles.trendingItem}
        onPress={() => playAudio(item)}
      >
        <Image source={item.coverArt} style={styles.trendingCover} />
        <ThemedView style={styles.trendingInfo}>
          <ThemedText style={styles.trendingTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.trendingArtist}>{item.artist}</ThemedText>
          <ThemedText style={styles.trendingDuration}>
            {item.duration || "--:--"}
          </ThemedText>
        </ThemedView>
        <IconSymbol
          name={
            currentTrack?.id === item.id && isPlaying
              ? "pause.fill"
              : "play.fill"
          }
          size={24}
          color="#4CAF50"
        />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView>
          <ThemedText style={styles.greeting}>{greeting}</ThemedText>
          <ThemedText style={styles.username}>
            {user?.username || "Music Lover"}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity onPress={() => router.navigate("/")}>
          <ThemedView style={styles.iconButton}>
            <IconSymbol
              name="bell.fill"
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={[1]} // Dummy data for the main scrollable content
        renderItem={() => (
          <ThemedView style={styles.content}>
            {/* Featured Section */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Featured</ThemedText>
              <FlatList
                horizontal
                data={songs}
                renderItem={renderFeaturedItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                style={styles.featuredList}
              />
            </ThemedView>

            {/* Trending Section */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Trending Now</ThemedText>
              <ThemedView style={styles.trendingList}>
                {songs.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderTrendingItem({ item })}
                  </React.Fragment>
                ))}
              </ThemedView>
            </ThemedView>

            {/* For Artist Section - only shown to artists */}
            {user?.isArtist && (
              <Animated.View
                entering={FadeIn.duration(800)}
                style={styles.section}
              >
                <ThemedText style={styles.sectionTitle}>Your Music</ThemedText>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.navigate("/create")}
                >
                  <LinearGradient
                    colors={["#4CAF50", "#2E7D32"]}
                    style={styles.createButtonGradient}
                  >
                    <IconSymbol name="plus" size={24} color="#fff" />
                    <ThemedText style={styles.createButtonText}>
                      Create New Track
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </ThemedView>
        )}
      />

      {/* Now Playing Bar - only shown when a track is playing */}
      {currentTrack && (
        <ThemedView style={styles.nowPlaying}>
          <Image
            source={currentTrack.coverArt}
            style={styles.nowPlayingCover}
          />
          <ThemedView style={styles.nowPlayingInfo}>
            <ThemedText style={styles.nowPlayingTitle}>
              {currentTrack.title}
            </ThemedText>
            <ThemedText style={styles.nowPlayingArtist}>
              {currentTrack.artist}
            </ThemedText>
            <ThemedText style={styles.nowPlayingDuration}>
              {playbackPosition} /{" "}
              {playbackDuration || currentTrack.duration || "--:--"}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.nowPlayingControls}>
            <TouchableOpacity onPress={playPreviousTrack}>
              <IconSymbol
                name="backward.fill"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
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
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  username: {
    fontSize: 24,
    fontFamily: "PoppinsBold",
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(200, 200, 200, 0.2)",
  },
  content: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    marginLeft: 20,
    marginBottom: 16,
  },
  featuredList: {
    paddingLeft: 20,
  },
  featuredItem: {
    width: width * 0.8,
    height: 200,
    marginRight: 15,
    borderRadius: 12,
    overflow: "hidden",
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
    height: "50%",
    justifyContent: "flex-end",
    padding: 15,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
  },
  featuredArtist: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  featuredDuration: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  trendingList: {
    paddingHorizontal: 20,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 70,
    marginBottom: 12,
  },
  trendingCover: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trendingTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
  },
  trendingArtist: {
    fontSize: 14,
    opacity: 0.7,
  },
  trendingDuration: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  createButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    marginLeft: 8,
  },
  nowPlaying: {
    position: "absolute",
    bottom: 5,
    left: 20,
    right: 20,
    height: 80, // Increased height to accommodate duration
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "rgba(200, 200, 200, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(200, 200, 200, 0.3)",
  },
  nowPlayingCover: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  nowPlayingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
  },
  nowPlayingArtist: {
    fontSize: 14,
    opacity: 0.7,
  },
  nowPlayingDuration: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  nowPlayingControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playPauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
});
