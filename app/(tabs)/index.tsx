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
} from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/store/AuthContext";
import useAuthStore from "@/store/useAuthStore";

// Define types for our data
interface Song {
  id: string;
  title: string;
  artist: string;
  coverArt: ImageSourcePropType;
}

// interface User {
//   username?: string;
//   isArtist?: boolean;
//   [key: string]: any;
// }

// Mock data for featured and trending songs
const FEATURED_SONGS: Song[] = [
  {
    id: "1",
    title: "Summer Vibes",
    artist: "DJ Harmony",
    coverArt: require("@/assets/images/album1.png"),
  },
  {
    id: "2",
    title: "Midnight Dreams",
    artist: "Luna Kay",
    coverArt: require("@/assets/images/album1.png"),
  },
  {
    id: "3",
    title: "Urban Echoes",
    artist: "City Beats",
    coverArt: require("@/assets/images/album1.png"),
  },
];

const TRENDING_SONGS: Song[] = [
  {
    id: "1",
    title: "Neon Lights",
    artist: "Electro Pulse",
    coverArt: require("@/assets/images/album1.png"),
  },
  {
    id: "2",
    title: "Ocean Waves",
    artist: "Coastal Dreams",
    coverArt: require("@/assets/images/album1.png"),
  },
  {
    id: "3",
    title: "Mountain High",
    artist: "Peak Performance",
    coverArt: require("@/assets/images/album1.png"),
  },
  {
    id: "4",
    title: "Desert Rose",
    artist: "Sandy Tunes",
    coverArt: require("@/assets/images/album1.png"),
  },
];

export default function HomeScreen(): React.ReactElement {
 
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [greeting, setGreeting] = useState<string>("");
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
   const {  user } = useAuthStore();
console.log("USER", user)
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

  const handlePlaySong = (song: Song): void => {
    setCurrentTrack(song);
    // In a real app, you would play the song here
  };

  const renderFeaturedItem = ({ item }: { item: Song }): React.ReactElement => (
    <TouchableOpacity
      style={styles.featuredItem}
      onPress={() => handlePlaySong(item)}
    >
      <Image source={item.coverArt} style={styles.featuredCover} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.featuredGradient}
      >
        <ThemedText style={styles.featuredTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.featuredArtist}>{item.artist}</ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }: { item: Song }): React.ReactElement => (
    <Animated.View
      entering={FadeInRight.delay(parseInt(item.id) * 100).duration(600)}
    >
      <TouchableOpacity
        style={styles.trendingItem}
        onPress={() => handlePlaySong(item)}
      >
        <Image source={item.coverArt} style={styles.trendingCover} />
        <ThemedView style={styles.trendingInfo}>
          <ThemedText style={styles.trendingTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.trendingArtist}>{item.artist}</ThemedText>
        </ThemedView>
        <IconSymbol name="play.fill" size={24} color="#4CAF50" />
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
                data={FEATURED_SONGS}
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
                {TRENDING_SONGS.map((item) => (
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
          </ThemedView>
          <ThemedView style={styles.nowPlayingControls}>
            <TouchableOpacity>
              <IconSymbol
                name="backward.fill"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playPauseButton}>
              <IconSymbol name="pause.fill" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
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
    bottom: 80,
    left: 20,
    right: 20,
    height: 70,
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
