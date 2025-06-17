import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  LogBox,
  SafeAreaView,
} from "react-native";

import { API_BASE_URL } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

// Enhanced Blue Color Scheme
const BlueColors = {
  primary: "#2563EB", // Main blue
  primaryLight: "#3B82F6", // Lighter blue
  primaryDark: "#1E40AF", // Darker blue
  secondary: "#F1F5F9", // Light blue-gray
  accent: "#0EA5E9", // Sky blue
  background: "#F8FAFC", // Very light blue-gray
  surface: "#FFFFFF", // White
  text: "#1E293B", // Dark blue-gray
  textSecondary: "#64748B", // Medium blue-gray
  textLight: "#94A3B8", // Light blue-gray
  border: "#E2E8F0", // Light border
  success: "#10B981", // Green
  warning: "#F59E0B", // Amber
  error: "#EF4444", // Red
  gradientStart: "#2563EB",
  gradientEnd: "#0EA5E9",
};

const AdminAddBookScreen = ({ navigation }) => {
  // Form state
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
    isbn: "",
    pageCount: "",
    publishYear: "",
  });
  const router = useRouter();
  // Files state
  const [bookFile, setBookFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [genres, setGenres] = useState([
    { label: "Fiction", value: "fiction" },
    { label: "Non-Fiction", value: "non-fiction" },
    { label: "Science Fiction", value: "sci-fi" },
    { label: "Fantasy", value: "fantasy" },
    { label: "Mystery", value: "mystery" },
    { label: "Romance", value: "romance" },
    { label: "Biography", value: "biography" },
    { label: "History", value: "history" },
    { label: "Self-Help", value: "self-help" },
    { label: "Business", value: "business" },
  ]);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Handle text input changes
  const handleChange = (field, value) => {
    setBookData({
      ...bookData,
      [field]: value,
    });
  };

  // Pick image for book cover
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCoverImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Pick document for book file
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/epub+zip"],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        setBookFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!bookData.title || !bookData.author) {
      Alert.alert("Missing fields", "Title and author are required");
      return;
    }

    if (!bookFile) {
      Alert.alert("Missing file", "Book file is required");
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add text fields
      Object.keys(bookData).forEach((key) => {
        if (bookData[key]) {
          formData.append(key, bookData[key]);
        }
      });

      // Add book file
      formData.append("book_file", {
        uri: bookFile.uri,
        name: bookFile.name,
        type: bookFile.mimeType,
      });

      // Add cover image if available
      if (coverImage) {
        formData.append("cover_image", {
          uri: coverImage.uri,
          name: `cover_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }

      const token = await AsyncStorage.getItem("auth_token");
      // Actual API call would look like this:

      const response = await fetch(`${API_BASE_URL}/api/v1/books`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Response data:", data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to create book");
      }

      setIsLoading(false);
      setBookData({
        title: "",
        author: "",
        description: "",
        genre: "",
        isbn: "",
        pageCount: "",
        publishYear: "",
      });
      setBookFile(null);
      setCoverImage(null);
      Alert.alert("Success", "Book created successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)/library"),
        },
      ]);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BlueColors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Book</Text>
          <Text style={styles.headerSubtitle}>
            Create a new book entry for your library
          </Text>
        </View>

        {/* Enhanced Book Cover Image */}
        <View style={styles.coverSection}>
          <TouchableOpacity
            style={styles.coverImageContainer}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {coverImage ? (
              <View style={styles.coverWrapper}>
                <Image
                  source={{ uri: coverImage.uri }}
                  style={styles.coverImage}
                />
                <View style={styles.coverOverlay}>
                  <Ionicons
                    name="camera"
                    size={24}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.placeholderCover}>
                <View style={styles.placeholderIcon}>
                  <Ionicons
                    name="image-outline"
                    size={40}
                    color={BlueColors.primary}
                  />
                </View>
                <Text style={styles.placeholderText}>Add Cover Image</Text>
                <Text style={styles.placeholderSubtext}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, bookData.title && styles.inputFilled]}
            placeholder="Enter book title"
            placeholderTextColor={BlueColors.textLight}
            value={bookData.title}
            onChangeText={(text) => handleChange("title", text)}
          />

          <Text style={styles.label}>Author *</Text>
          <TextInput
            style={[styles.input, bookData.author && styles.inputFilled]}
            placeholder="Enter author name"
            placeholderTextColor={BlueColors.textLight}
            value={bookData.author}
            onChangeText={(text) => handleChange("author", text)}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              bookData.description && styles.inputFilled,
            ]}
            placeholder="Enter book description"
            placeholderTextColor={BlueColors.textLight}
            multiline
            numberOfLines={4}
            value={bookData.description}
            onChangeText={(text) => handleChange("description", text)}
          />

          <Text style={styles.label}>Genre</Text>
          <DropDownPicker
            open={open}
            value={bookData.genre}
            items={genres}
            setOpen={setOpen}
            setValue={(callback) => {
              const value = callback(bookData.genre);
              handleChange("genre", value);
            }}
            setItems={setGenres}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            placeholder="Select genre"
            placeholderStyle={styles.dropdownPlaceholder}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>ISBN</Text>
              <TextInput
                style={[styles.input, bookData.isbn && styles.inputFilled]}
                placeholder="Enter ISBN"
                placeholderTextColor={BlueColors.textLight}
                value={bookData.isbn}
                onChangeText={(text) => handleChange("isbn", text)}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Page Count</Text>
              <TextInput
                style={[styles.input, bookData.pageCount && styles.inputFilled]}
                placeholder="Enter pages"
                placeholderTextColor={BlueColors.textLight}
                keyboardType="number-pad"
                value={bookData.pageCount}
                onChangeText={(text) => handleChange("pageCount", text)}
              />
            </View>
          </View>

          <Text style={styles.label}>Publish Year</Text>
          <TextInput
            style={[styles.input, bookData.publishYear && styles.inputFilled]}
            placeholder="Enter publish year"
            placeholderTextColor={BlueColors.textLight}
            keyboardType="number-pad"
            value={bookData.publishYear}
            onChangeText={(text) => handleChange("publishYear", text)}
            maxLength={4}
          />

          {/* Enhanced Book File Selection */}
          <Text style={styles.label}>Book File (PDF/EPUB) *</Text>
          <TouchableOpacity
            style={[
              styles.fileSelector,
              bookFile && styles.fileSelectorSelected,
            ]}
            onPress={pickDocument}
            activeOpacity={0.7}
          >
            <View style={styles.fileIconContainer}>
              <Ionicons
                name="document-outline"
                size={24}
                color={bookFile ? BlueColors.primary : BlueColors.textSecondary}
              />
            </View>
            <View style={styles.fileTextContainer}>
              <Text
                style={[
                  styles.fileSelectorText,
                  bookFile && styles.fileSelectorTextSelected,
                ]}
              >
                {bookFile ? bookFile.name : "Select book file"}
              </Text>
              {!bookFile && (
                <Text style={styles.fileSelectorSubtext}>
                  PDF or EPUB format
                </Text>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={BlueColors.textSecondary}
            />
          </TouchableOpacity>
          {bookFile && (
            <View style={styles.fileInfoContainer}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={BlueColors.success}
              />
              <Text style={styles.fileInfo}>
                {(bookFile.size / (1024 * 1024)).toFixed(2)} MB
              </Text>
            </View>
          )}

          {/* Enhanced Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.loadingText}>Creating Book...</Text>
              </View>
            ) : (
              <View style={styles.submitContent}>
                <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Create Book</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BlueColors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: BlueColors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: BlueColors.textSecondary,
    fontWeight: "400",
  },
  coverSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  coverImageContainer: {
    shadowColor: BlueColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  coverWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  coverImage: {
    width: 160,
    height: 240,
    borderRadius: 12,
  },
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  placeholderCover: {
    width: 160,
    height: 240,
    borderRadius: 12,
    backgroundColor: BlueColors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: BlueColors.primary,
    borderStyle: "dashed",
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BlueColors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  placeholderText: {
    color: BlueColors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: BlueColors.textSecondary,
    fontSize: 14,
    fontWeight: "400",
  },
  formContainer: {
    backgroundColor: BlueColors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: BlueColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: BlueColors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: BlueColors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BlueColors.secondary,
    borderWidth: 1,
    borderColor: BlueColors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: BlueColors.text,
    marginBottom: 18,
    transition: "all 0.2s ease",
  },
  inputFilled: {
    borderColor: BlueColors.primary,
    backgroundColor: BlueColors.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  dropdown: {
    backgroundColor: BlueColors.secondary,
    borderColor: BlueColors.border,
    borderRadius: 10,
    marginBottom: 18,
    minHeight: 50,
  },
  dropdownContainer: {
    backgroundColor: BlueColors.surface,
    borderColor: BlueColors.border,
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: BlueColors.text,
  },
  dropdownPlaceholder: {
    color: BlueColors.textLight,
  },
  fileSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BlueColors.secondary,
    borderWidth: 1,
    borderColor: BlueColors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  fileSelectorSelected: {
    backgroundColor: BlueColors.surface,
    borderColor: BlueColors.primary,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: BlueColors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileTextContainer: {
    flex: 1,
  },
  fileSelectorText: {
    fontSize: 16,
    color: BlueColors.textSecondary,
    fontWeight: "500",
  },
  fileSelectorTextSelected: {
    color: BlueColors.text,
  },
  fileSelectorSubtext: {
    fontSize: 12,
    color: BlueColors.textLight,
    marginTop: 2,
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    marginLeft: 4,
  },
  fileInfo: {
    fontSize: 14,
    color: BlueColors.success,
    marginLeft: 6,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: BlueColors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: BlueColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: BlueColors.textLight,
    shadowOpacity: 0.1,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
});

export default AdminAddBookScreen;
