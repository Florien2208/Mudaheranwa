import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { Video } from "expo-av";

// Mock icons
const VideoIcon = () => (
  <View style={styles.icon}>
    <Text style={{ color: "white", fontWeight: "bold" }}>📺</Text>
  </View>
);

const SearchIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Text>🔍</Text>
  </View>
);

const PlayIcon = () => <Text style={{ fontSize: 24 }}>▶️</Text>;

const BackIcon = () => <Text>⬅️</Text>;

// Sample video data
const sampleVideos = [
  {
    id: 1,
    title: "Book Review: The Midnight Library",
    author: "BookTube Central",
    description:
      "A comprehensive review of Matt Haig's thought-provoking novel about life choices and parallel universes.",
    category: "Reviews",
    duration: "12:45",
    views: "156K",
    uploadDate: "2 days ago",
    thumbnailUrl:
      "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Midnight+Library",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: 2,
    title: "How Atomic Habits Changed My Life",
    author: "Productivity Plus",
    description:
      "Personal journey and practical tips from implementing James Clear's atomic habits system.",
    category: "Self-Help",
    duration: "18:32",
    views: "89K",
    uploadDate: "5 days ago",
    thumbnailUrl:
      "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Atomic+Habits",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: 3,
    title: "Money Psychology Explained",
    author: "Finance Focus",
    description:
      "Breaking down the key concepts from Morgan Housel's Psychology of Money.",
    category: "Finance",
    duration: "25:18",
    views: "234K",
    uploadDate: "1 week ago",
    thumbnailUrl:
      "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Money+Psychology",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: 4,
    title: "Sci-Fi Book Recommendations 2024",
    author: "Galaxy Reads",
    description:
      "Top science fiction books you need to read this year, including Project Hail Mary.",
    category: "Recommendations",
    duration: "15:47",
    views: "67K",
    uploadDate: "3 days ago",
    thumbnailUrl:
      "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Sci-Fi+Books",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: 5,
    title: "Author Interview: Kazuo Ishiguro",
    author: "Literary Talks",
    description:
      "Exclusive interview discussing Klara and the Sun and the future of AI in literature.",
    category: "Interviews",
    duration: "42:15",
    views: "312K",
    uploadDate: "2 weeks ago",
    thumbnailUrl:
      "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Ishiguro+Interview",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: 6,
    title: "Reading Challenge 2024",
    author: "Book Lover",
    description:
      "Join me as I tackle 52 books this year with tips on how to read more effectively.",
    category: "Tips",
    duration: "8:23",
    views: "45K",
    uploadDate: "4 days ago",
    thumbnailUrl:
      "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Reading+Challenge",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  },
];

// Main Video App Component
const VideoApp = () => {
  const [videos, setVideos] = useState(sampleVideos);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoPress = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <VideoIcon />
          </View>
          <Text style={styles.appTitle}>BookSpot Videos</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Video List */}
      <VideoList videos={filteredVideos} onVideoPress={handleVideoPress} />

      {/* Video Player Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        onRequestClose={closeVideoModal}
      >
        {selectedVideo && (
          <VideoPlayer video={selectedVideo} onClose={closeVideoModal} />
        )}
      </Modal>
    </SafeAreaView>
  );
};

// Video List Component
const VideoList = ({ videos, onVideoPress }) => {
  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <VideoIcon />
        <Text style={styles.emptyText}>No videos found</Text>
      </View>
    );
  }

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredItem}
      onPress={() => onVideoPress(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.featuredThumbnail}
          resizeMode="cover"
        />
        <View style={styles.playOverlay}>
          <PlayIcon />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.videoAuthor} numberOfLines={1}>
        {item.author}
      </Text>
      <Text style={styles.videoViews} numberOfLines={1}>
        {item.views} views • {item.uploadDate}
      </Text>
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => onVideoPress(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <View style={styles.playOverlay}>
          <Text style={{ fontSize: 16 }}>▶️</Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.videoMeta}>
          <Text style={styles.videoViews}>
            {item.views} views • {item.uploadDate}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      {/* Featured Videos Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Videos</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos.slice(0, 4)}
        renderItem={renderFeaturedItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
      />

      {/* All Videos Section */}
      <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 15 }]}>
        All Videos
      </Text>
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.videoList}
      />
    </ScrollView>
  );
};

// Video Player Component
const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

  return (
    <SafeAreaView style={styles.playerContainer}>
      <StatusBar barStyle="light-content" />

      {/* Back Button */}
      <View style={styles.playerHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <BackIcon />
          <Text style={styles.backText}>Back to videos</Text>
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: video.videoUrl }}
          useNativeControls
          resizeMode="contain"
          isLooping={false}
          onPlaybackStatusUpdate={setStatus}
        />
      </View>

      {/* Video Info */}
      <ScrollView style={styles.videoInfoContainer}>
        <View style={styles.videoDetailCard}>
          <Text style={styles.playerVideoTitle}>{video.title}</Text>

          <View style={styles.videoMetaRow}>
            <Text style={styles.playerVideoAuthor}>{video.author}</Text>
            <View style={styles.playerCategoryBadge}>
              <Text style={styles.categoryText}>{video.category}</Text>
            </View>
          </View>

          <View style={styles.videoStats}>
            <Text style={styles.videoStatsText}>
              {video.views} views • {video.uploadDate}
            </Text>
          </View>

          <Text style={styles.videoDescription}>{video.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#72b7e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    color: "#72b7e9",
    fontSize: 22,
    fontWeight: "bold",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#72b7e9",
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 14,
    padding: 0,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#72b7e9",
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllText: {
    color: "#72b7e9",
    fontSize: 14,
  },
  featuredList: {
    paddingRight: 16,
  },
  featuredItem: {
    width: 200,
    marginRight: 16,
  },
  thumbnailContainer: {
    position: "relative",
  },
  featuredThumbnail: {
    width: 200,
    height: 112,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#72b7e9",
  },
  videoThumbnail: {
    width: 120,
    height: 68,
    borderRadius: 6,
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#72b7e9",
  },
  playOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  videoTitle: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoAuthor: {
    color: "#72b7e9",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  videoViews: {
    color: "#666",
    fontSize: 12,
  },
  videoList: {
    paddingBottom: 20,
  },
  videoItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  videoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: "#72b7e9",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  emptyText: {
    color: "#666",
    marginTop: 12,
    fontSize: 16,
  },
  // Player Styles
  playerContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  playerHeader: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#72b7e9",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: "black",
  },
  video: {
    flex: 1,
  },
  videoInfoContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  videoDetailCard: {
    padding: 16,
  },
  playerVideoTitle: {
    color: "#333",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  videoMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  playerVideoAuthor: {
    color: "#72b7e9",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  playerCategoryBadge: {
    backgroundColor: "#72b7e9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  videoStats: {
    marginBottom: 12,
  },
  videoStatsText: {
    color: "#666",
    fontSize: 14,
  },
  videoDescription: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default VideoApp;
