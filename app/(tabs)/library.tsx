import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_BASE_URL } from "@/constants";
import { useColorScheme } from "@/hooks/useColorScheme";
import useAuthStore from "@/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ArtistDashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState("published");
  const [modalVisible, setModalVisible] = useState(false);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackGenre, setTrackGenre] = useState("");
  const [trackDescription, setTrackDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  // Mock data for all tracks
  useEffect(() => {
    fetchTracks();
  }, []);
  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/music/user/mymusic`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("API Response----:", response.data); // Log the API response for debugging
      // Transform the API response to match our app's data structure if needed
      const formattedTracks = response.data.map((track) => ({
        id: track._id,
        title: track.title,
        plays: track.play_count || 0,
        likes: track.like_count || 0,
        coverUrl: track.backgroundImage,
        date: formatDate(track.createdAt),
        isPublic: track.is_public,
        status: track.is_public ? "published" : "in-process",
      }));

      setTracks(formattedTracks);
      setError(null);
    } catch (err) {
      console.error("Error fetching tracks:", err);
      setError("Failed to load tracks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };
  const publishedTracks = tracks.filter(
    (track) => track.status === "published"
  );
  const inProcessTracks = tracks.filter(
    (track) => track.status === "in-process"
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const pickAudio = async () => {
    try {
      // Use document picker to select audio files
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      console.log("Audio file selection result:", result);

      if (result.assets && result.assets.length > 0) {
        // For newer versions of expo-document-picker
        const asset = result.assets[0];
        console.log("Audio file selected:", asset.uri);
        console.log("Audio file details:", asset);
        setAudioFile(asset.uri);
        Alert.alert("Success", `Audio file selected: ${asset.name}`);
      } else if (result.type === "success") {
        // For older versions of expo-document-picker
        console.log("Audio file selected:", result.uri);
        console.log("Audio file details:", result);
        setAudioFile(result.uri);
        Alert.alert("Success", `Audio file selected: ${result.name}`);
      } else {
        console.log("Document picking cancelled or failed");
      }
    } catch (err) {
      console.error("Error picking audio file:", err);
      Alert.alert("Error", "Failed to select audio file");
    }
  };

  const uploadTrack = async () => {
    if (!trackTitle) {
      Alert.alert("Error", "Please enter a track title");
      return;
    }

    if (!audioFile) {
      Alert.alert("Error", "Please select an audio file");
      return;
    }

    setIsUploading(true);

    try {
      // Prepare form data for multipart upload
      const formData = new FormData();
      formData.append("title", trackTitle);
      formData.append("genre", trackGenre);
      formData.append("description", trackDescription);
      formData.append("is_public", isPublic);

      // Add audio file
     if (audioFile) {
       try {
         // Get file info
         const fileInfo = await FileSystem.getInfoAsync(audioFile);

         if (!fileInfo.exists) {
           console.error(`Audio file doesn't exist at path: ${audioFile}`);
           Alert.alert(
             "Error",
             "The selected audio file cannot be found. Please select again."
           );
           return;
         }

         console.log("Audio file exists:", fileInfo);

         // Get file extension from uri or use default
         const fileExtension = audioFile.split(".").pop() || "mp3";
         const mimeType =
           fileExtension === "mp3" ? "audio/mpeg" : `audio/${fileExtension}`;

         formData.append("audio_file", {
           uri:
             Platform.OS === "android"
               ? audioFile
               : audioFile.replace("file://", ""),
           name: `track_${Date.now()}.${fileExtension}`,
           type: mimeType,
         });
       } catch (fileError) {
         console.error("Error processing audio file:", fileError);
         Alert.alert(
           "Error",
           "Failed to process the audio file. Please try selecting it again."
         );
         return;
       }
     } else {
       Alert.alert("Error", "Please select an audio file");
       return;
     }

      // Add cover image if it exists
      if (coverImage) {
        formData.append("cover_image", {
          uri: coverImage,
          name: `cover_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }
      const token = await AsyncStorage.getItem("auth_token");
      console.log("Token from formData:", formData); // Log the token for debugging
      // Make API request
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/music`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get the newly created track from response
      const newTrack = {
        id: response.data.id,
        title: trackTitle,
        plays: 0,
        likes: 0,
        coverUrl: coverImage,
        date: "Just now",
        isPublic: isPublic,
        status: isPublic ? "published" : "in-process",
      };

      // Update local state
      setTracks([newTrack, ...tracks]);

      // Reset form
      resetForm();
      setModalVisible(false);

      // Show success message
      Alert.alert(
        "Success",
        "Your track has been " +
          (isPublic ? "published" : "saved as draft") +
          "!"
      );
    } catch (err) {
      console.error("Error uploading track:", err);
      Alert.alert(
        "Upload Failed",
        "There was a problem uploading your track. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishTrack = async (trackId) => {
    try {
      // API call to publish the track
      await axios.put(
        `${API_BASE_URL}/tracks/${trackId}`,
        { is_public: true },
        { headers: { Authorization: "Bearer YOUR_AUTH_TOKEN" } }
      );

      // Update local state
      setTracks(
        tracks.map((track) =>
          track.id === trackId
            ? { ...track, isPublic: true, status: "published" }
            : track
        )
      );

      Alert.alert("Success", "Track has been published!");
    } catch (err) {
      console.error("Error publishing track:", err);
      Alert.alert(
        "Publishing Failed",
        "There was a problem publishing your track. Please try again."
      );
    }
  };
  const handleDeleteTrack = async (trackId) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        "Delete Track",
        "Are you sure you want to delete this track? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              // API call to delete the track
              await axios.delete(`${API_URL}/tracks/${trackId}`, {
                headers: { Authorization: "Bearer YOUR_AUTH_TOKEN" },
              });

              // Update local state
              setTracks(tracks.filter((track) => track.id !== trackId));

              Alert.alert("Success", "Track has been deleted.");
            },
          },
        ]
      );
    } catch (err) {
      console.error("Error deleting track:", err);
      Alert.alert(
        "Deletion Failed",
        "There was a problem deleting your track. Please try again."
      );
    }
  };

  {
    isLoading && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading tracks...
        </Text>
      </View>
    );
  }

  {
    error && (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={36} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTracks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const resetForm = () => {
    setTrackTitle("");
    setTrackGenre("");
    setTrackDescription("");
    setCoverImage(null);
    setAudioFile(null);
    setIsPublic(true);
    setModalVisible(false);
  };

  const tintColor = isDark ? "#2C9CFF" : "#007AFF";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const bgColor = isDark ? "#121212" : "#FFFFFF";
  const cardBgColor = isDark ? "#1E1E1E" : "#F5F5F5";
  const borderColor = isDark ? "#333333" : "#E1E1E1";

  const renderTrackCard = (track, showPublishButton = false) => (
    <View
      key={track.id}
      style={[styles.trackCard, { backgroundColor: cardBgColor }]}
    >
      <View style={styles.trackImageContainer}>
        {track.coverUrl ? (
          <Image source={{ uri: track.coverUrl }} style={styles.trackImage} />
        ) : (
          <View
            style={[
              styles.trackImagePlaceholder,
              { backgroundColor: tintColor },
            ]}
          >
            <IconSymbol name="music.note" size={24} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: textColor }]}>
          {track.title}
        </Text>
        <Text style={styles.trackMeta}>{track.date}</Text>

        <View style={styles.trackStats}>
          {track.status === "published" && (
            <>
              <View style={styles.trackStatItem}>
                <IconSymbol name="play.fill" size={12} color="#999" />
                <Text style={styles.trackStatText}>
                  {track.plays.toLocaleString()}
                </Text>
              </View>
              <View style={styles.trackStatItem}>
                <IconSymbol name="heart.fill" size={12} color="#999" />
                <Text style={styles.trackStatText}>
                  {track.likes.toLocaleString()}
                </Text>
              </View>
            </>
          )}
          {track.status === "in-process" && (
            <Text style={styles.draftLabel}>Draft</Text>
          )}
        </View>
      </View>

      <View style={styles.trackActions}>
        {showPublishButton && (
          <TouchableOpacity
            style={[styles.publishButton, { backgroundColor: tintColor }]}
            onPress={() => handlePublishTrack(track.id)}
          >
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.trackOptionsButton}
          onPress={() => handleDeleteTrack(track.id)}
        >
          <IconSymbol name="trash" size={20} color="#FF3B30" />
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
          <Text style={[styles.headerTitle, { color: textColor }]}>
            My Music
          </Text>
          <Text style={styles.headerSubtitle}>
            Manage your music collection
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "published" && styles.activeTab,
            { borderBottomColor: tintColor },
          ]}
          onPress={() => setActiveTab("published")}
        >
          <IconSymbol
            name="music.note.list"
            size={18}
            color={activeTab === "published" ? tintColor : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "published" ? tintColor : "#999" },
            ]}
          >
            Published
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "in-process" && styles.activeTab,
            { borderBottomColor: tintColor },
          ]}
          onPress={() => setActiveTab("in-process")}
        >
          <IconSymbol
            name="doc.text"
            size={18}
            color={activeTab === "in-process" ? tintColor : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "in-process" ? tintColor : "#999" },
            ]}
          >
            In Process
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "insights" && styles.activeTab,
            { borderBottomColor: tintColor },
          ]}
          onPress={() => setActiveTab("insights")}
        >
          <IconSymbol
            name="chart.bar"
            size={18}
            color={activeTab === "insights" ? tintColor : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "insights" ? tintColor : "#999" },
            ]}
          >
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "published" && (
          <View style={styles.musicContainer}>
            {/* Stats Overview */}
            <View style={[styles.statsCard, { backgroundColor: cardBgColor }]}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{publishedTracks.length}</Text>
                <Text style={styles.statLabel}>Published</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>18.2K</Text>
                <Text style={styles.statLabel}>Total Plays</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2.1K</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>

            {/* Add New Track Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={() => setModalVisible(true)}
            >
              <IconSymbol name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add New Track</Text>
            </TouchableOpacity>

            {/* Published Tracks List */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Published Tracks
            </Text>

            {publishedTracks.length === 0 ? (
              <View
                style={[styles.emptyState, { backgroundColor: cardBgColor }]}
              >
                <IconSymbol name="music.note" size={36} color="#999" />
                <Text style={[styles.emptyStateText, { color: textColor }]}>
                  No published tracks yet
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Your published tracks will appear here
                </Text>
              </View>
            ) : (
              publishedTracks.map((track) => renderTrackCard(track))
            )}
          </View>
        )}

        {activeTab === "in-process" && (
          <View style={styles.musicContainer}>
            {/* Stats Overview */}
            <View style={[styles.statsCard, { backgroundColor: cardBgColor }]}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inProcessTracks.length}</Text>
                <Text style={styles.statLabel}>In Process</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Not Public</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>

            {/* Add New Track Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={() => setModalVisible(true)}
            >
              <IconSymbol name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add New Track</Text>
            </TouchableOpacity>

            {/* In Process Tracks List */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Tracks In Process
            </Text>

            {inProcessTracks.length === 0 ? (
              <View
                style={[styles.emptyState, { backgroundColor: cardBgColor }]}
              >
                <IconSymbol name="doc.text" size={36} color="#999" />
                <Text style={[styles.emptyStateText, { color: textColor }]}>
                  No tracks in process
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Your drafts and unpublished tracks will appear here
                </Text>
              </View>
            ) : (
              inProcessTracks.map((track) => renderTrackCard(track, true))
            )}
          </View>
        )}

        {activeTab === "insights" && (
          <View style={styles.insightsContainer}>
            {/* Insights Summary */}
            <View
              style={[styles.insightCard, { backgroundColor: cardBgColor }]}
            >
              <Text style={[styles.insightCardTitle, { color: textColor }]}>
                Audience Growth
              </Text>
              <View style={styles.graphPlaceholder}>
                <Text style={styles.graphPlaceholderText}>+24% this month</Text>
              </View>
            </View>

            {/* Top Tracks */}
            <View
              style={[styles.insightCard, { backgroundColor: cardBgColor }]}
            >
              <Text style={[styles.insightCardTitle, { color: textColor }]}>
                Top Performing Tracks
              </Text>
              <View style={styles.topTrackItem}>
                <Text style={[styles.topTrackTitle, { color: textColor }]}>
                  1. Midnight Groove
                </Text>
                <Text style={styles.topTrackStats}>12.4K plays</Text>
              </View>
              <View style={styles.topTrackItem}>
                <Text style={[styles.topTrackTitle, { color: textColor }]}>
                  2. Urban Echo
                </Text>
                <Text style={styles.topTrackStats}>5.6K plays</Text>
              </View>
            </View>

            {/* Audience Demographics */}
            <View
              style={[styles.insightCard, { backgroundColor: cardBgColor }]}
            >
              <Text style={[styles.insightCardTitle, { color: textColor }]}>
                Audience Demographics
              </Text>
              <View style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>Top Locations</Text>
                <Text style={[styles.demographicValue, { color: textColor }]}>
                  New York, London, Tokyo
                </Text>
              </View>
              <View style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>Age Group</Text>
                <Text style={[styles.demographicValue, { color: textColor }]}>
                  18-34 (68%)
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Add New Track
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(!modalVisible);
                  resetForm();
                }}
              >
                <IconSymbol name="xmark" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Cover Image Selector */}
              <TouchableOpacity
                style={[
                  styles.coverSelector,
                  { backgroundColor: cardBgColor, borderColor: borderColor },
                ]}
                onPress={pickImage}
              >
                {coverImage ? (
                  <Image
                    source={{ uri: coverImage }}
                    style={styles.coverPreview}
                  />
                ) : (
                  <>
                    <IconSymbol name="photo" size={32} color={tintColor} />
                    <Text
                      style={[styles.coverSelectorText, { color: textColor }]}
                    >
                      Select Cover Art
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Track Details Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>
                    Title *
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: cardBgColor,
                        color: textColor,
                        borderColor: borderColor,
                      },
                    ]}
                    placeholder="Enter track title"
                    placeholderTextColor="#999"
                    value={trackTitle}
                    onChangeText={setTrackTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>
                    Genre
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: cardBgColor,
                        color: textColor,
                        borderColor: borderColor,
                      },
                    ]}
                    placeholder="Enter genre (e.g., Hip-Hop, R&B)"
                    placeholderTextColor="#999"
                    value={trackGenre}
                    onChangeText={setTrackGenre}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>
                    Description
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: cardBgColor,
                        color: textColor,
                        borderColor: borderColor,
                      },
                    ]}
                    placeholder="Add a description for your track"
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={4}
                    value={trackDescription}
                    onChangeText={setTrackDescription}
                  />
                </View>

                {/* Audio File Selector */}
                <TouchableOpacity
                  style={[
                    styles.audioSelector,
                    { backgroundColor: cardBgColor, borderColor: borderColor },
                  ]}
                  onPress={pickAudio}
                >
                  <IconSymbol name="music.note" size={24} color={tintColor} />
                  <Text
                    style={[styles.audioSelectorText, { color: textColor }]}
                  >
                    {audioFile
                      ? `Selected: ${audioFile}`
                      : "Select Audio File *"}
                  </Text>
                </TouchableOpacity>

                {/* Visibility Toggle */}
                <View style={styles.visibilityContainer}>
                  <Text style={[styles.visibilityText, { color: textColor }]}>
                    Publish this track immediately
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: isPublic ? tintColor : "#999" },
                    ]}
                    onPress={() => setIsPublic(!isPublic)}
                  >
                    <View
                      style={[styles.toggleCircle, { left: isPublic ? 22 : 2 }]}
                    />
                  </TouchableOpacity>
                </View>

                {/* Upload Button */}
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    {
                      backgroundColor: tintColor,
                      opacity: isUploading ? 0.7 : 1,
                    },
                  ]}
                  onPress={uploadTrack}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <IconSymbol name="arrow.up" size={18} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>
                        {isPublic ? "Upload & Publish Track" : "Save as Draft"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
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
  musicContainer: {
    padding: 20,
  },
  addButton: {
    flexDirection: "row",
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  trackCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  trackImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
  },
  trackImage: {
    width: "100%",
    height: "100%",
  },
  trackImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  trackInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  trackMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  trackStats: {
    flexDirection: "row",
    marginTop: 8,
  },
  trackStatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  trackStatText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  draftLabel: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "500",
  },
  trackActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  publishButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 5,
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  trackOptionsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  insightsContainer: {
    padding: 20,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  graphPlaceholder: {
    height: 150,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  graphPlaceholderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  topTrackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  topTrackTitle: {
    fontWeight: "500",
  },
  topTrackStats: {
    color: "#999",
  },
  demographicItem: {
    marginBottom: 12,
  },
  demographicLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  demographicValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalScrollView: {
    maxHeight: "90%",
  },
  // Form Styles (from original component)
  coverSelector: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  coverPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  coverSelectorText: {
    fontSize: 14,
    marginTop: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: "top",
  },
  audioSelector: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  audioSelectorText: {
    fontSize: 16,
    marginLeft: 12,
  },
  visibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  visibilityText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    position: "relative",
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    position: "absolute",
    top: 2,
  },
  uploadButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
