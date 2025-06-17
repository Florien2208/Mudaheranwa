import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { Video } from "expo-av";

// Mock icons
const AdminIcon = () => (
  <View style={styles.icon}>
    <Text style={{ color: "white", fontWeight: "bold" }}>👨‍💼</Text>
  </View>
);

const AddIcon = () => <Text style={{ fontSize: 20, color: "white" }}>+</Text>;
const VideoIcon = () => <Text style={{ fontSize: 20 }}>🎥</Text>;
const DraftIcon = () => <Text style={{ fontSize: 16 }}>📝</Text>;
const PublishedIcon = () => <Text style={{ fontSize: 16 }}>🚀</Text>;
const EditIcon = () => <Text style={{ fontSize: 14 }}>✏️</Text>;
const DeleteIcon = () => <Text style={{ fontSize: 14 }}>🗑️</Text>;
const StatsIcon = () => <Text style={{ fontSize: 16 }}>📊</Text>;
const BackIcon = () => <Text style={{ fontSize: 18 }}>←</Text>;

// Form icons
const UploadIcon = () => <Text style={{ fontSize: 20 }}>📤</Text>;
const ImageIcon = () => <Text style={{ fontSize: 20 }}>🖼️</Text>;
const PublishIcon = () => <Text style={{ fontSize: 20 }}>🚀</Text>;
const PreviewIcon = () => <Text style={{ fontSize: 20 }}>👁️</Text>;
const SaveIcon = () => <Text style={{ fontSize: 20 }}>💾</Text>;
const TrashIcon = () => <Text style={{ fontSize: 16 }}>🗑️</Text>;

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
  "Technology"
];

// Sample data
const initialPublishedVideos = [
  {
    id: 1,
    title: "Book Review: The Midnight Library",
    author: "BookTube Central",
    description: "A comprehensive review of Matt Haig's thought-provoking novel about life choices and parallel universes.",
    category: "Reviews",
    duration: "12:45",
    views: "156K",
    uploadDate: "2 days ago",
    status: "published",
    thumbnailUrl: "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Midnight+Library",
  },
  {
    id: 2,
    title: "How Atomic Habits Changed My Life",
    author: "Productivity Plus",
    description: "Personal journey and practical tips from implementing James Clear's atomic habits system.",
    category: "Self-Help",
    duration: "18:32",
    views: "89K",
    uploadDate: "5 days ago",
    status: "published",
    thumbnailUrl: "https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=Atomic+Habits",
  }
];

const initialDraftVideos = [
  {
    id: 3,
    title: "Money Psychology Explained",
    author: "Finance Focus",
    description: "Breaking down the key concepts from Morgan Housel's Psychology of Money.",
    category: "Finance",
    duration: "25:18",
    status: "draft",
    savedDate: "1 hour ago",
  }
];

const VideoAdminPanel = () => {
  // Navigation state
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'form'
  const [activeTab, setActiveTab] = useState('published'); // 'published' or 'draft'
  const [editingVideo, setEditingVideo] = useState(null);

  // Data state
  const [publishedVideos, setPublishedVideos] = useState(initialPublishedVideos);
  const [draftVideos, setDraftVideos] = useState(initialDraftVideos);

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

  // Navigation functions
  const showDashboard = () => {
    setCurrentView('dashboard');
    setEditingVideo(null);
    clearForm();
  };

  const showCreateForm = () => {
    setCurrentView('form');
    setEditingVideo(null);
    clearForm();
  };

  const showEditForm = (video) => {
    setCurrentView('form');
    setEditingVideo(video);
    setFormData({
      title: video.title,
      author: video.author,
      description: video.description,
      category: video.category,
      duration: video.duration,
      videoUrl: video.videoUrl || "",
      thumbnailUrl: video.thumbnailUrl || "",
    });
  };

  // Form functions
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['title', 'author', 'description', 'category', 'duration'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      Alert.alert("Missing Fields", `Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    const durationPattern = /^\d{1,2}:\d{2}$/;
    if (!durationPattern.test(formData.duration)) {
      Alert.alert("Invalid Duration", "Duration must be in MM:SS format (e.g., 12:45)");
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
      setDraftVideos(prev => prev.map(video => 
        video.id === editingVideo.id ? draftVideo : video
      ));
    } else {
      setDraftVideos(prev => [draftVideo, ...prev]);
    }
    
    Alert.alert("Draft Saved", "Your video has been saved as a draft", [
      { text: "Back to Dashboard", onPress: showDashboard },
      { text: "Continue Editing", style: "cancel" }
    ]);
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    
    setIsPublishing(true);
    
    setTimeout(() => {
      const newVideo = {
        ...formData,
        id: editingVideo ? editingVideo.id : Date.now(),
        views: editingVideo ? editingVideo.views : "0",
        uploadDate: "Just now",
        status: "published",
        thumbnailUrl: formData.thumbnailUrl || `https://via.placeholder.com/320x180/72b7e9/FFFFFF?text=${encodeURIComponent(formData.title)}`
      };
      
      if (editingVideo && editingVideo.status === 'draft') {
        // Moving from draft to published
        setDraftVideos(prev => prev.filter(video => video.id !== editingVideo.id));
        setPublishedVideos(prev => [newVideo, ...prev]);
      } else if (editingVideo && editingVideo.status === 'published') {
        // Updating published video
        setPublishedVideos(prev => prev.map(video => 
          video.id === editingVideo.id ? newVideo : video
        ));
      } else {
        // New video
        setPublishedVideos(prev => [newVideo, ...prev]);
      }
      
      setIsPublishing(false);
      
      Alert.alert(
        "Published Successfully! 🎉",
        "Your video is now live and available to viewers",
        [
          { text: "Back to Dashboard", onPress: showDashboard },
          { text: "Create Another", onPress: showCreateForm }
        ]
      );
    }, 2000);
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
            if (video.status === 'published') {
              setPublishedVideos(prev => prev.filter(v => v.id !== video.id));
            } else {
              setDraftVideos(prev => prev.filter(v => v.id !== video.id));
            }
          }
        }
      ]
    );
  };

  const handlePreview = () => {
    if (!formData.title.trim()) {
      Alert.alert("Preview Unavailable", "Please enter at least a title to preview");
      return;
    }
    setShowPreview(true);
  };

  // Render Tab Content
  const renderTabContent = () => {
    const currentVideos = activeTab === 'published' ? publishedVideos : draftVideos;
    
    if (currentVideos.length === 0) {
      return (
        <View style={styles.emptyState}>
          {activeTab === 'published' ? <PublishedIcon /> : <DraftIcon />}
          <Text style={styles.emptyText}>
            {activeTab === 'published' ? 'No published videos yet' : 'No draft videos yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'published' 
              ? 'Create your first video to get started'
              : 'Save videos as drafts to continue editing later'
            }
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={showCreateForm}>
            <Text style={styles.emptyButtonText}>Create Video</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return currentVideos.map((video) => (
      <View key={video.id} style={styles.videoCard}>
        <View style={styles.videoCardContent}>
          {video.status === 'published' && video.thumbnailUrl ? (
            <Image
              source={{ uri: video.thumbnailUrl }}
              style={styles.videoThumbnailImage}
            />
          ) : (
            <View style={styles.videoThumbnail}>
              {video.status === 'published' ? <PublishedIcon /> : <DraftIcon />}
            </View>
          )}
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.videoAuthor}>{video.author}</Text>
            <Text style={styles.videoMeta}>
              {video.status === 'published' 
                ? `${video.views} views • ${video.uploadDate}`
                : `Saved ${video.savedDate} • ${video.category}`
              }
            </Text>
            {video.status === 'published' && (
              <View style={styles.statusBadge}>
                <PublishedIcon />
                <Text style={styles.statusText}>Live</Text>
              </View>
            )}
          </View>
          <View style={styles.videoActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => showEditForm(video)}
            >
              <EditIcon />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <AdminIcon />
          </View>
          <Text style={styles.appTitle}>Video Admin Panel</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={showCreateForm}>
          <AddIcon />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <StatsIcon />
          <Text style={styles.statNumber}>{publishedVideos.length}</Text>
          <Text style={styles.statLabel}>Published</Text>
        </View>
        <View style={styles.statCard}>
          <DraftIcon />
          <Text style={styles.statNumber}>{draftVideos.length}</Text>
          <Text style={styles.statLabel}>Drafts</Text>
        </View>
        <View style={styles.statCard}>
          <VideoIcon />
          <Text style={styles.statNumber}>
            {publishedVideos.reduce((total, video) => {
              const viewCount = parseInt(video.views.replace('K', '')) || 0;
              return total + viewCount;
            }, 0)}K
          </Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'published' && styles.activeTab]}
          onPress={() => setActiveTab('published')}
        >
          <PublishedIcon />
          <Text style={[styles.tabText, activeTab === 'published' && styles.activeTabText]}>
            Published ({publishedVideos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'draft' && styles.activeTab]}
          onPress={() => setActiveTab('draft')}
        >
          <DraftIcon />
          <Text style={[styles.tabText, activeTab === 'draft' && styles.activeTabText]}>
            Drafts ({draftVideos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.tabContent}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );

  // Render Form
  const renderForm = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={showDashboard}>
          <BackIcon />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>
          {editingVideo ? 'Edit Video' : 'Create New Video'}
        </Text>
        <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
          <PreviewIcon />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Form Card */}
          <View style={styles.formCard}>
            
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Video Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter video title..."
                value={formData.title}
                onChangeText={(text) => updateField('title', text)}
                maxLength={100}
              />
              <Text style={styles.charCount}>{formData.title.length}/100</Text>
            </View>

        

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.categoryText, !formData.category && styles.placeholder]}>
                  {formData.category || "Select category..."}
                </Text>
                <Text>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Duration Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration (MM:SS) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 12:45"
                value={formData.duration}
                onChangeText={(text) => updateField('duration', text)}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter video description..."
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.charCount}>{formData.description.length}/500</Text>
            </View>

            {/* Media Upload Section */}
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Media Files</Text>
              
              {/* Video Upload */}
              <View style={styles.uploadGroup}>
                <Text style={styles.label}>Video File *</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <VideoIcon />
                  <Text style={styles.uploadText}>
                    {formData.videoUrl ? "Video Selected ✓" : "Upload Video"}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.urlInput}
                  placeholder="Or paste video URL..."
                  value={formData.videoUrl}
                  onChangeText={(text) => updateField('videoUrl', text)}
                />
              </View>

              {/* Thumbnail Upload */}
              <View style={styles.uploadGroup}>
                <Text style={styles.label}>Thumbnail (Optional)</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <ImageIcon />
                  <Text style={styles.uploadText}>
                    {formData.thumbnailUrl ? "Thumbnail Selected ✓" : "Upload Thumbnail"}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.urlInput}
                  placeholder="Or paste thumbnail URL..."
                  value={formData.thumbnailUrl}
                  onChangeText={(text) => updateField('thumbnailUrl', text)}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.draftButton}
                onPress={handleSaveDraft}
              >
                <SaveIcon />
                <Text style={styles.draftButtonText}>Save Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearForm}
              >
                <TrashIcon />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Publish Button */}
            <TouchableOpacity
              style={[styles.publishButton, isPublishing && styles.publishingButton]}
              onPress={handlePublish}
              disabled={isPublishing}
            >
              <PublishIcon />
              <Text style={styles.publishButtonText}>
                {isPublishing ? "Publishing..." : editingVideo ? "Update & Publish" : "Publish Video"}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    formData.category === category && styles.selectedCategory
                  ]}
                  onPress={() => {
                    updateField('category', category);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    formData.category === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
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
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.closeButtonText}>✕ Close Preview</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.previewContent}>
            <View style={styles.previewCard}>
              {/* Mock thumbnail */}
              <View style={styles.previewThumbnail}>
                {formData.thumbnailUrl ? (
                  <Image 
                    source={{ uri: formData.thumbnailUrl }} 
                    style={styles.previewThumbnailImage}
                  />
                ) : (
                  <View style={styles.placeholderThumbnail}>
                    <VideoIcon />
                    <Text style={styles.placeholderText}>Thumbnail Preview</Text>
                  </View>
                )}
                <View style={styles.previewDuration}>
                  <Text style={styles.durationText}>
                    {formData.duration || "00:00"}
                  </Text>
                </View>
              </View>
              
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>
                  {formData.title || "Video Title"}
                </Text>
                <Text style={styles.previewAuthor}>
                  {formData.author || "Author Name"}
                </Text>
                <View style={styles.previewMeta}>
                  <Text style={styles.previewViews}>0 views • Just now</Text>
                  {formData.category && (
                    <View style={styles.previewCategoryBadge}>
                      <Text style={styles.categoryText}>{formData.category}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.previewDescription}>
                  {formData.description || "Video description will appear here..."}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );

  // Main render
  return currentView === 'dashboard' ? renderDashboard() : renderForm();
};

// Styles
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardContainer: {
    flex: 1,
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#28a745",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#72b7e9",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  formTitle: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
  previewButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#72b7e9",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  // Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#72b7e9",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  activeTabText: {
    color: "white",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Video Card Styles
  videoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  videoCardContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  videoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  videoThumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  videoAuthor: {
    fontSize: 14,
    color: "#72b7e9",
    fontWeight: "500",
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    color: "#155724",
    fontWeight: "600",
    marginLeft: 4,
  },

  videoActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#f8d7da",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#72b7e9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Form Styles
  scrollContainer: {
    flex: 1,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },

  // Media Section
  mediaSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
    marginTop: 20,
  },
  uploadGroup: {
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#72b7e9",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#f0f8ff",
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    color: "#72b7e9",
    fontWeight: "500",
    marginLeft: 8,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  draftButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  draftButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
  },
  publishingButton: {
    backgroundColor: "#6c757d",
  },
  publishButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: width * 0.8,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedCategory: {
    backgroundColor: "#f0f8ff",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#72b7e9",
    fontWeight: "600",
  },
  modalCloseButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  modalCloseText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Preview Modal Styles
  previewContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  previewHeader: {
    backgroundColor: "white",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#dc3545",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  previewContent: {
    flex: 1,
    padding: 16,
  },
  previewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewThumbnail: {
    position: "relative",
    height: 200,
    backgroundColor: "#f0f8ff",
  },
  previewThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  placeholderThumbnail: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  previewDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  previewInfo: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  previewAuthor: {
    fontSize: 16,
    color: "#72b7e9",
    fontWeight: "500",
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  previewViews: {
    fontSize: 14,
    color: "#666",
  },
  previewCategoryBadge: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  previewDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
});

export default VideoAdminPanel;