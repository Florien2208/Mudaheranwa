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
} from "react-native";

import { API_BASE_URL } from "@/constants";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

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
      style={{ flex: 1 }}
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
        </View>

        {/* Book Cover Image */}
        <TouchableOpacity
          style={styles.coverImageContainer}
          onPress={pickImage}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage.uri }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderCover}>
              <Ionicons
                name="image-outline"
                size={50}
                color={Colors.light.icon}
              />
              <Text style={styles.placeholderText}>Add Cover Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter book title"
            placeholderTextColor={Colors.light.secondaryText}
            value={bookData.title}
            onChangeText={(text) => handleChange("title", text)}
          />

          <Text style={styles.label}>Author *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter author name"
            placeholderTextColor={Colors.light.secondaryText}
            value={bookData.author}
            onChangeText={(text) => handleChange("author", text)}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter book description"
            placeholderTextColor={Colors.light.secondaryText}
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
            placeholderStyle={styles.placeholderText}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>ISBN</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ISBN"
                placeholderTextColor={Colors.light.secondaryText}
                value={bookData.isbn}
                onChangeText={(text) => handleChange("isbn", text)}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Page Count</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter pages"
                placeholderTextColor={Colors.light.secondaryText}
                keyboardType="number-pad"
                value={bookData.pageCount}
                onChangeText={(text) => handleChange("pageCount", text)}
              />
            </View>
          </View>

          <Text style={styles.label}>Publish Year</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter publish year"
            placeholderTextColor={Colors.light.secondaryText}
            keyboardType="number-pad"
            value={bookData.publishYear}
            onChangeText={(text) => handleChange("publishYear", text)}
            maxLength={4}
          />

          {/* Book File Selection */}
          <Text style={styles.label}>Book File (PDF/EPUB) *</Text>
          <TouchableOpacity style={styles.fileSelector} onPress={pickDocument}>
            <Ionicons
              name="document-outline"
              size={24}
              color={Colors.light.icon}
            />
            <Text style={styles.fileSelectorText}>
              {bookFile ? bookFile.name : "Select book file"}
            </Text>
          </TouchableOpacity>
          {bookFile && (
            <Text style={styles.fileInfo}>
              {(bookFile.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Book</Text>
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
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  coverImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  coverImage: {
    width: 150,
    height: 225,
    borderRadius: 8,
  },
  placeholderCover: {
    width: 150,
    height: 225,
    borderRadius: 8,
    backgroundColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderStyle: "dashed",
  },
  placeholderText: {
    marginTop: 8,
    color: Colors.light.secondaryText,
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
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
    backgroundColor: "#f9f9f9",
    borderColor: Colors.light.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownContainer: {
    backgroundColor: "#ffffff",
    borderColor: Colors.light.border,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  fileSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileSelectorText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  fileInfo: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    marginBottom: 16,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AdminAddBookScreen;
