import { API_BASE_URL } from "@/constants";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Mock icons
const AdminIcon = () => (
  <View className="items-center justify-center">
    <Text className="text-white font-bold">👨‍💼</Text>
  </View>
);

const AddIcon = () => <Text className="text-xl text-white">+</Text>;
const VideoIcon = () => <Text className="text-xl">🎥</Text>;
const DraftIcon = () => <Text className="text-base">📝</Text>;
const PublishedIcon = () => <Text className="text-base">🚀</Text>;
const EditIcon = () => <Text className="text-sm">✏️</Text>;
const DeleteIcon = () => <Text className="text-sm">🗑️</Text>;
const StatsIcon = () => <Text className="text-base">📊</Text>;
const BackIcon = () => <AntDesign name="arrowleft" size={24} color="black" />;

const ImageIcon = () => <Text className="text-xl">🖼️</Text>;
const PublishIcon = () => <Text className="text-xl">🚀</Text>;
const PreviewIcon = () => <Text className="text-xl">👁️</Text>;
const SaveIcon = () => <Text className="text-xl">💾</Text>;
const TrashIcon = () => <Text className="text-base">🗑️</Text>;

// Categories for dropdown
const categories = [
  "Reviews",
  "Self-Help",
  "Finance",
  "Recommendations",
  "Interviews",
  "Tips",
  "Educational",
  "Entertainment",
  "News",
  "Technology",
];

const VideoAdminPanel = () => {
  // Navigation state
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' or 'form'
  const [activeTab, setActiveTab] = useState("published"); // 'published' or 'draft'
  const [editingVideo, setEditingVideo] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    duration: "",
    videoUrl: "",
    thumbnailUrl: "",
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedVideos, setPublishedVideos] = useState([]);
  const [draftVideos, setDraftVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/video`); // update with your actual API
        const data = await response.json();

        setPublishedVideos(
          data.data.filter((video) => video.status === "published")
        );
        setDraftVideos(data.data.filter((video) => video.status === "draft"));
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };

    fetchVideos();
  }, []);
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera roll permission is required."
        );
      }
    })();
  }, []);

  // Navigation functions
  const showDashboard = () => {
    setCurrentView("dashboard");
    setEditingVideo(null);
    clearForm();
  };

  const showCreateForm = () => {
    setCurrentView("form");
    setEditingVideo(null);
    clearForm();
  };

  const showEditForm = (video) => {
    setCurrentView("form");
    setEditingVideo(video);
    setFormData({
      title: video.title,
      author: video.author,
      description: video.description,
      category: video.category,
      duration: video.duration,
      videoUrl: video.videoFile
        ? `${API_BASE_URL}/api/v1/video/files/videos/${video.videoFile}`
        : "",
      thumbnailUrl: video.thumbnailFile
        ? `${API_BASE_URL}/api/v1/video/files/thumbnails/${video.thumbnailFile}`
        : "",
    });
  };

  // Form functions
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ["title", "author", "description", "category", "duration"];
    const missing = required.filter((field) => !formData[field].trim());

    if (missing.length > 0) {
      Alert.alert("Missing Fields", `Please fill in: ${missing.join(", ")}`);
      return false;
    }

    const durationPattern = /^\d{1,2}:\d{2}$/;
    if (!durationPattern.test(formData.duration)) {
      Alert.alert(
        "Invalid Duration",
        "Duration must be in MM:SS format (e.g., 12:45)"
      );
      return false;
    }

    return true;
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      Alert.alert("Title Required", "Please enter a title to save as draft");
      return;
    }

    const draftVideo = {
      ...formData,
      id: editingVideo ? editingVideo.id : Date.now(),
      status: "draft",
      savedDate: "Just now",
    };

    if (editingVideo) {
      setDraftVideos((prev) =>
        prev.map((video) => (video.id === editingVideo.id ? draftVideo : video))
      );
    } else {
      setDraftVideos((prev) => [draftVideo, ...prev]);
    }

    Alert.alert("Draft Saved", "Your video has been saved as a draft", [
      { text: "Back to Dashboard", onPress: showDashboard },
      { text: "Continue Editing", style: "cancel" },
    ]);
  };
  const handlePublish = async () => {
    if (!validateForm()) return;
    setIsPublishing(true);

    try {
      const form = new FormData();

      form.append("title", formData.title);
      form.append("author", formData.author);
      form.append("description", formData.description);
      form.append("category", formData.category);
      form.append("duration", formData.duration);
      form.append("status", "published");

      if (formData.videoUrl) {
        const fileInfo = await FileSystem.getInfoAsync(formData.videoUrl);
        form.append("videoFile", {
          uri: fileInfo.uri,
          name: fileInfo.uri.split("/").pop() || "video.mp4",
          type: "video/mp4",
        } as any);
      }

      if (formData.thumbnailUrl) {
        const thumbInfo = await FileSystem.getInfoAsync(formData.thumbnailUrl);
        form.append("thumbnailFile", {
          uri: thumbInfo.uri,
          name: thumbInfo.uri.split("/").pop() || "thumbnail.jpg",
          type: "image/jpeg",
        } as any);
      }

      const url = editingVideo
        ? `${API_BASE_URL}/api/v1/video/${editingVideo.id}`
        : `${API_BASE_URL}/api/v1/video`;
      console.log("url", url);
      const method = editingVideo ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: form,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const savedVideo = response.data.data;

      if (editingVideo) {
        setPublishedVideos((prev) =>
          prev.map((v) => (v.id === editingVideo.id ? savedVideo : v))
        );
      } else {
        setPublishedVideos((prev) => [savedVideo, ...prev]);
      }

      Alert.alert("Success", "Video published successfully!");
      showDashboard();
    } catch (error: any) {
      console.error(
        "Error uploading video:",
        error?.response || error?.message || error
      );
      Alert.alert("Error", "Failed to upload video");
      console.log(
        "Full error:",
        JSON.stringify(error.response?.data || error.message)
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const clearForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      category: "",
      duration: "",
      videoUrl: "",
      thumbnailUrl: "",
    });
  };

  const handleDeleteVideo = (video) => {
    Alert.alert(
      "Delete Video",
      `Are you sure you want to delete "${video.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (video.status === "published") {
              setPublishedVideos((prev) =>
                prev.filter((v) => v.id !== video.id)
              );
            } else {
              setDraftVideos((prev) => prev.filter((v) => v.id !== video.id));
            }
          },
        },
      ]
    );
  };

  const handlePreview = () => {
    if (!formData.title.trim()) {
      Alert.alert(
        "Preview Unavailable",
        "Please enter at least a title to preview"
      );
      return;
    }
    setShowPreview(true);
  };

  // Render Tab Content
  const renderTabContent = () => {
    const currentVideos =
      activeTab === "published" ? publishedVideos : draftVideos;

    if (currentVideos.length === 0) {
      return (
        <View className="bg-white rounded-xl p-10 items-center shadow-sm">
          {activeTab === "published" ? <PublishedIcon /> : <DraftIcon />}
          <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">
            {activeTab === "published"
              ? "No published videos yet"
              : "No draft videos yet"}
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-5">
            {activeTab === "published"
              ? "Create your first video to get started"
              : "Save videos as drafts to continue editing later"}
          </Text>
          <TouchableOpacity
            className="bg-blue-400 px-6 py-3 rounded-lg"
            onPress={showCreateForm}
          >
            <Text className="text-white text-base font-semibold">
              Create Video
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return currentVideos.map((video) => (
      <View key={video.id} className="bg-white rounded-xl mb-3 shadow-sm">
        <View className="flex-row p-3 items-center">
          {video.status === "published" && video.thumbnailUrl ? (
            <Image
              source={{ uri: video.thumbnailUrl }}
              className="w-15 h-15 rounded-lg mr-3"
            />
          ) : (
            <View className="w-15 h-15 rounded-lg bg-blue-50 items-center justify-center mr-3">
              {video.status === "published" ? <PublishedIcon /> : <DraftIcon />}
            </View>
          )}
          <View className="flex-1">
            <Text
              className="text-base font-semibold text-gray-800 mb-1"
              numberOfLines={2}
            >
              {video.title}
            </Text>
            <Text className="text-sm text-blue-400 font-medium mb-1">
              {video.author}
            </Text>
            <Text className="text-xs text-gray-500">
              {video.status === "published"
                ? `${video.views} views • ${video.uploadDate}`
                : `Saved ${video.savedDate} • ${video.category}`}
            </Text>
            {video.status === "published" && (
              <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-xl mt-1 self-start">
                <PublishedIcon />
                <Text className="text-xs text-green-800 font-semibold ml-1">
                  Live
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center ml-2"
              onPress={() => showEditForm(video)}
            >
              <EditIcon />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-red-100 items-center justify-center ml-2"
              onPress={() => handleDeleteVideo(video)}
            >
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ));
  };

  // Render Dashboard
  const renderDashboard = () => (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-400 items-center justify-center mr-2">
            <AdminIcon />
          </View>
          <Text className="text-blue-400 text-xl font-bold">
            Video Admin Panel
          </Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-green-500 items-center justify-center"
          onPress={showCreateForm}
        >
          <AddIcon />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between px-4 py-4">
        <View className="flex-1 bg-white rounded-xl p-4 items-center mx-1 shadow-sm">
          <StatsIcon />
          <Text className="text-2xl font-bold text-blue-400 mt-2">
            {publishedVideos.length}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Published</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 items-center mx-1 shadow-sm">
          <DraftIcon />
          <Text className="text-2xl font-bold text-blue-400 mt-2">
            {draftVideos.length}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Drafts</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white mx-4 mb-4 rounded-xl p-1 shadow-sm">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg ${
            activeTab === "published" ? "bg-blue-400" : ""
          }`}
          onPress={() => setActiveTab("published")}
        >
          <PublishedIcon />
          <Text
            className={`text-sm font-semibold ml-1.5 ${
              activeTab === "published" ? "text-white" : "text-gray-500"
            }`}
          >
            Published ({publishedVideos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg ${
            activeTab === "draft" ? "bg-blue-400" : ""
          }`}
          onPress={() => setActiveTab("draft")}
        >
          <DraftIcon />
          <Text
            className={`text-sm font-semibold ml-1.5 ${
              activeTab === "draft" ? "text-white" : "text-gray-500"
            }`}
          >
            Drafts ({draftVideos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1 px-4">{renderTabContent()}</ScrollView>
    </SafeAreaView>
  );

  // Render Form
  const renderForm = () => (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={showDashboard}
        >
          <BackIcon />
          <Text className="text-blue-400 text-base font-medium ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-gray-800 text-lg font-bold">
          {editingVideo ? "Edit Video" : "Create New Video"}
        </Text>
        <TouchableOpacity
          className="p-2 rounded-lg bg-blue-50"
          onPress={handlePreview}
        >
          <PreviewIcon />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Form Card */}
          <View className="bg-white rounded-xl m-4 p-5 shadow-md">
            {/* Title Input */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Video Title *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50"
                placeholder="Enter video title..."
                value={formData.title}
                onChangeText={(text) => updateField("title", text)}
                maxLength={100}
              />
              <Text className="text-xs text-gray-500 text-right mt-1">
                {formData.title.length}/100
              </Text>
            </View>

            {/* Author Input */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Author *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50"
                placeholder="Enter author name..."
                value={formData.author}
                onChangeText={(text) => updateField("author", text)}
                maxLength={50}
              />
              <Text className="text-xs text-gray-500 text-right mt-1">
                {formData.author.length}/50
              </Text>
            </View>

            {/* Category Selection */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Category *
              </Text>
              <TouchableOpacity
                className="flex-row justify-between items-center border border-gray-300 rounded-lg p-3 bg-gray-50"
                onPress={() => setShowCategoryModal(true)}
              >
                <Text
                  className={`text-base ${formData.category ? "text-gray-800" : "text-gray-400"}`}
                >
                  {formData.category || "Select category..."}
                </Text>
                <Text>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Duration Input */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Duration (MM:SS) *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50"
                placeholder="e.g., 12:45"
                value={formData.duration}
                onChangeText={(text) => updateField("duration", text)}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            {/* Description Input */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Description *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 h-25"
                placeholder="Enter video description..."
                value={formData.description}
                onChangeText={(text) => updateField("description", text)}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text className="text-xs text-gray-500 text-right mt-1">
                {formData.description.length}/500
              </Text>
            </View>

            {/* Media Upload Section */}
            <View className="border-t border-gray-200 pt-5 mt-5">
              <Text className="text-lg font-bold text-gray-800 mb-4">
                Media Files
              </Text>

              {/* Video Upload */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-800 mb-2">
                  Video File *
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-5 bg-blue-50 mb-2"
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                      allowsEditing: false,
                      quality: 1,
                    });

                    if (!result.canceled) {
                      updateField("videoUrl", result.assets[0].uri); // set local file URI
                    }
                  }}
                >
                  <VideoIcon />
                  <Text className="text-base text-blue-400 font-medium ml-2">
                    {formData.videoUrl ? "Video Selected ✓" : "Upload Video"}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-sm bg-gray-50"
                  placeholder="Or paste video URL..."
                  value={formData.videoUrl}
                  onChangeText={(text) => updateField("videoUrl", text)}
                />
              </View>

              {/* Thumbnail Upload */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-800 mb-2">
                  Thumbnail (Optional)
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-5 bg-blue-50 mb-2"
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      quality: 1,
                    });

                    if (!result.canceled) {
                      updateField("thumbnailUrl", result.assets[0].uri);
                    }
                  }}
                >
                  <ImageIcon />
                  <Text className="text-base text-blue-400 font-medium ml-2">
                    {formData.thumbnailUrl
                      ? "Thumbnail Selected ✓"
                      : "Upload Thumbnail"}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-sm bg-gray-50"
                  placeholder="Or paste thumbnail URL..."
                  value={formData.thumbnailUrl}
                  onChangeText={(text) => updateField("thumbnailUrl", text)}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mt-5 mb-5">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center bg-gray-500 p-3 rounded-lg mr-2"
                onPress={handleSaveDraft}
              >
                <SaveIcon />
                <Text className="text-white text-base font-semibold ml-2">
                  Save Draft
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center bg-red-500 p-3 rounded-lg ml-2"
                onPress={clearForm}
              >
                <TrashIcon />
                <Text className="text-white text-base font-semibold ml-2">
                  Clear
                </Text>
              </TouchableOpacity>
            </View>

            {/* Publish Button */}
            <TouchableOpacity
              className={`flex-row items-center justify-center p-4 rounded-lg ${
                isPublishing ? "bg-gray-500" : "bg-green-500"
              }`}
              onPress={handlePublish}
              disabled={isPublishing}
            >
              <PublishIcon />
              <Text className="text-white text-lg font-bold ml-2">
                {isPublishing
                  ? "Publishing..."
                  : editingVideo
                    ? "Update & Publish"
                    : "Publish Video"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-5 w-4/5 max-h-[70%]">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Select Category
            </Text>
            <ScrollView className="max-h-72">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`p-4 border-b border-gray-200 ${
                    formData.category === category ? "bg-blue-50" : ""
                  }`}
                  onPress={() => {
                    updateField("category", category);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      formData.category === category
                        ? "text-blue-400 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className="bg-gray-500 p-3 rounded-lg mt-4"
              onPress={() => setShowCategoryModal(false)}
            >
              <Text className="text-white text-base font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="bg-white p-4 shadow-sm">
            <TouchableOpacity
              className="self-end bg-red-500 px-4 py-2 rounded-lg"
              onPress={() => setShowPreview(false)}
            >
              <Text className="text-white text-sm font-semibold">
                ✕ Close Preview
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="bg-white rounded-xl overflow-hidden shadow-md">
              {/* Mock thumbnail */}
              <View className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {formData.videoUrl ? (
                  <Video
                    source={{ uri: formData.videoUrl }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="contain"
                    useNativeControls
                    shouldPlay={false}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center bg-blue-50">
                    <VideoIcon />
                    <Text className="text-base text-gray-500 mt-2">
                      No video selected
                    </Text>
                  </View>
                )}
                <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
                  <Text className="text-white text-xs font-semibold">
                    {formData.duration || "00:00"}
                  </Text>
                </View>
              </View>

              <View className="p-4">
                <Text className="text-xl font-bold text-gray-800 mb-2">
                  {formData.title || "Video Title"}
                </Text>
                <Text className="text-base text-blue-400 font-medium mb-2">
                  {formData.author || "Author Name"}
                </Text>
                <View className="flex-row items-center mb-3">
                  <Text className="text-sm text-gray-500">
                    0 views • Just now
                  </Text>
                  {formData.category && (
                    <View className="bg-gray-200 px-2 py-1 rounded-xl ml-3">
                      <Text className="text-sm text-gray-700">
                        {formData.category}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-base text-gray-800 leading-6">
                  {formData.description ||
                    "Video description will appear here..."}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );

  // Main render
  return currentView === "dashboard" ? renderDashboard() : renderForm();
};

export default VideoAdminPanel;
