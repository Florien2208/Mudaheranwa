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
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Mock icons
const VideoIcon = () => (
  <View style={styles.icon}>
    <Text style={{ color: "black", fontWeight: "bold" }}>📺</Text>
  </View>
);

const PlayIcon = ({ size = 24, color = "white" }) => (
  <View style={[styles.playIconContainer, { width: size, height: size }]}>
    <View
      style={[
        styles.playTriangle,
        {
          borderLeftColor: color,
          borderLeftWidth: size * 0.4,
          borderTopWidth: size * 0.25,
          borderBottomWidth: size * 0.25,
        },
      ]}
    />
  </View>
);

const BackIcon = () => <AntDesign name="arrowleft" size={24} color="black" />;

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
    uploadDate: "2 days ago",
    thumbnailUrl:
      "https://media.gettyimages.com/id/1426606619/video/library-background-learning-books-and-studying-at-school-university-and-college-for-exam-test.jpg?s=640x640&k=20&c=9x81CDaZaN3Qa-2pyy__23F6WiO2wCguVAGH9hCswe4=",
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
    uploadDate: "5 days ago",
    thumbnailUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPVN3J79akqUsYHdk_rih-G0dMeth_1w9h2Q&s",
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
    uploadDate: "1 week ago",
    thumbnailUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSatECxe411KYZjMCvGhqoatpIxU1d10Rxqrg&s",
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
    uploadDate: "3 days ago",
    thumbnailUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv_X4GwkuTABwd40Ke0oB5tlHJcg5Fm5rmUw&s",
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
    uploadDate: "2 weeks ago",
    thumbnailUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv_X4GwkuTABwd40Ke0oB5tlHJcg5Fm5rmUw&s",
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
    uploadDate: "4 days ago",
    thumbnailUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp7VwsH6-PAlG_A2DeIKTtXLFBZ-LZW6ID_g&s",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  },
  {
    id: 7,
    title: "Classic Literature Deep Dive",
    author: "BookTube Central",
    description:
      "Exploring the timeless themes in classic literature and why they still matter today.",
    category: "Reviews",
    duration: "22:30",
    uploadDate: "1 week ago",
    thumbnailUrl:
      "https://media.gettyimages.com/id/1426606619/video/library-background-learning-books-and-studying-at-school-university-and-college-for-exam-test.jpg?s=640x640&k=20&c=9x81CDaZaN3Qa-2pyy__23F6WiO2wCguVAGH9hCswe4=",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: 8,
    title: "Building Better Habits",
    author: "Productivity Plus",
    description:
      "Advanced strategies for habit formation and breaking bad habits permanently.",
    category: "Self-Help",
    duration: "16:45",
    uploadDate: "3 days ago",
    thumbnailUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPVN3J79akqUsYHdk_rih-G0dMeth_1w9h2Q&s",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
];

// Main Video App Component
const VideoApp = () => {
  const { t } = useTranslation();
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

  // Function to get related videos
  const getRelatedVideos = (currentVideo) => {
    return videos
      .filter((video) => video.id !== currentVideo.id)
      .filter(
        (video) =>
          video.category === currentVideo.category ||
          video.author === currentVideo.author
      )
      .slice(0, 4);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <VideoIcon />
          </View>
          <Text style={styles.appTitle}>{t("videos.title")}</Text>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("videos.searchPlaceholder")}
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Video List */}
      <VideoList
        videos={filteredVideos}
        onVideoPress={handleVideoPress}
        t={t}
      />

      {/* Video Player Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        onRequestClose={closeVideoModal}
      >
        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={closeVideoModal}
            t={t}
            relatedVideos={getRelatedVideos(selectedVideo)}
            onRelatedVideoPress={handleVideoPress}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

// Video List Component
const VideoList = ({ videos, onVideoPress, t }) => {
  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <VideoIcon />
        <Text style={styles.emptyText}>{t("videos.noVideosFound")}</Text>
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
        {item.uploadDate}
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
          <PlayIcon size={16} color="white" />
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
          <Text style={styles.videoViews}>{item.uploadDate}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("videos.featuredVideos")}</Text>
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
        {t("videos.allVideos")}
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

// Related Videos Component
const RelatedVideos = ({ videos, onVideoPress, t }) => {
  if (videos.length === 0) {
    return null;
  }

  const renderRelatedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedVideoItem}
      onPress={() => onVideoPress(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.relatedThumbnail}
          resizeMode="cover"
        />
        <View style={styles.playOverlay}>
          <PlayIcon size={14} color="white" />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.relatedVideoInfo}>
        <Text style={styles.relatedVideoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.relatedVideoAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.relatedVideoMeta}>
          <Text style={styles.relatedVideoViews}>{item.uploadDate}</Text>
          <View style={styles.relatedCategoryBadge}>
            <Text style={styles.relatedCategoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.relatedVideosContainer}>
      <Text style={styles.relatedVideosTitle}>
        {t("videos.relatedVideos") || "Related Videos"}
      </Text>
      <FlatList
        data={videos}
        renderItem={renderRelatedItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.relatedVideosList}
      />
    </View>
  );
};

// Video Player Component
const VideoPlayer = ({
  video,
  onClose,
  t,
  relatedVideos,
  onRelatedVideoPress,
}) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

  return (
    <SafeAreaView style={styles.playerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Back Button */}
      <View style={styles.playerHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <BackIcon />
          <Text style={styles.backText}>{t("videos.backToVideos")}</Text>
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
          t={t}
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
            <Text style={styles.videoStatsText}>{video.uploadDate}</Text>
          </View>

          <Text style={styles.videoDescription}>{video.description}</Text>
        </View>

        {/* Related Videos Section */}
        <RelatedVideos
          videos={relatedVideos}
          onVideoPress={onRelatedVideoPress}
          t={t}
        />
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
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    color: "black",
    fontSize: 22,
    fontWeight: "bold",
  },
  searchInput: {
    flex: 1,
    color: "black",
    fontSize: 16,
    padding: 0,
    marginLeft: 12,
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
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  playIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "white",
    marginLeft: 2,
  },
  playOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllText: {
    color: "black",
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
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  videoThumbnail: {
    width: 120,
    height: 68,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoAuthor: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  videoViews: {
    color: "#999",
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
    backgroundColor: "black",
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
    color: "black",
    marginTop: 12,
    fontSize: 16,
  },
  // Player Styles
  playerContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  playerHeader: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "black",
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
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  playerVideoTitle: {
    color: "black",
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
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  playerCategoryBadge: {
    backgroundColor: "black",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  videoStats: {
    marginBottom: 12,
  },
  videoStatsText: {
    color: "#999",
    fontSize: 14,
  },
  videoDescription: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  // Related Videos Styles
  relatedVideosContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  relatedVideosTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  relatedVideosList: {
    paddingBottom: 20,
  },
  relatedVideoItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  relatedThumbnail: {
    width: 100,
    height: 56,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  relatedVideoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  relatedVideoTitle: {
    color: "black",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  relatedVideoAuthor: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  relatedVideoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  relatedVideoViews: {
    color: "#999",
    fontSize: 10,
  },
  relatedCategoryBadge: {
    backgroundColor: "black",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  relatedCategoryText: {
    color: "white",
    fontSize: 8,
    fontWeight: "500",
  },
});

export default VideoApp;
