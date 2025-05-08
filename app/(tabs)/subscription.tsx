import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
// import { useAuth } from "@/context/AuthContext";

export default function CreateScreen() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  // const { user } = useAuth();

  useEffect(() => {
    // Request permissions
    (async () => {
      await Audio.requestPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();

    // Setup audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      // Cleanup
      if (recording) {
        stopRecording();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);

      // Start duration counter
      let duration = 0;
      const interval = setInterval(() => {
        duration += 1;
        setRecordingDuration(duration);
      }, 1000);

      // Add custom property to store interval ID
      (recording as any)._intervalId = interval;
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Recording Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    // Stop duration counter
    if ((recording as any)._intervalId) {
      clearInterval((recording as any)._intervalId);
    }

    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Recording Error", "Failed to stop recording");
    }
  };

  const playSound = async () => {
    if (!recordingUri) return;

    // Unload any existing sound
    if (sound) {
      await sound.unloadAsync();
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play sound", error);
      Alert.alert("Playback Error", "Failed to play recording");
    }
  };

  const stopSound = async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to stop sound", error);
    }
  };
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Image Error", "Failed to select image");
    }
  };

  const handlePublish = () => {
    if (!title || !recordingUri) {
      Alert.alert(
        "Missing Information",
        "Please add a title and record your track"
      );
      return;
    }

    // In a real app, you would upload the recording and metadata to a server here
    Alert.alert("Success!", "Your track has been published successfully!", [
      { text: "OK", onPress: resetForm },
    ]);
  };

  const resetForm = () => {
    setTitle("");
    setGenre("");
    setMood("");
    setDescription("");
    setCoverImage(null);
    setRecordingUri(null);
    setRecordingDuration(0);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Create New Track</ThemedText>
        </ThemedView>

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.formContainer}
        >
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Track Title</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: colorScheme === "dark" ? "#ffffff" : "#000000" },
              ]}
              placeholder="Enter title"
              placeholderTextColor={
                colorScheme === "dark" ? "#A0A0A0" : "#808080"
              }
              value={title}
              onChangeText={setTitle}
            />
          </ThemedView>

          <ThemedView style={styles.coverSection}>
            <ThemedText style={styles.inputLabel}>Cover Art</ThemedText>
            <TouchableOpacity
              style={styles.coverSelector}
              onPress={selectImage}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
              ) : (
                <ThemedView style={styles.coverPlaceholder}>
                  <IconSymbol name="photo" size={40} color="#808080" />
                  <ThemedText style={styles.coverPlaceholderText}>
                    Tap to select cover art
                  </ThemedText>
                </ThemedView>
              )}
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.inputRow}>
            <ThemedView
              style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}
            >
              <ThemedText style={styles.inputLabel}>Genre</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: colorScheme === "dark" ? "#ffffff" : "#000000" },
                ]}
                placeholder="Genre"
                placeholderTextColor={
                  colorScheme === "dark" ? "#A0A0A0" : "#808080"
                }
                value={genre}
                onChangeText={setGenre}
              />
            </ThemedView>

            <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText style={styles.inputLabel}>Mood</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: colorScheme === "dark" ? "#ffffff" : "#000000" },
                ]}
                placeholder="Mood"
                placeholderTextColor={
                  colorScheme === "dark" ? "#A0A0A0" : "#808080"
                }
                value={mood}
                onChangeText={setMood}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Description (Optional)
            </ThemedText>
            <TextInput
              style={[
                styles.textArea,
                { color: colorScheme === "dark" ? "#ffffff" : "#000000" },
              ]}
              placeholder="Describe your track..."
              placeholderTextColor={
                colorScheme === "dark" ? "#A0A0A0" : "#808080"
              }
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ThemedView>

          <ThemedView style={styles.recordingSection}>
            <ThemedText style={styles.inputLabel}>Recording</ThemedText>
            <ThemedView style={styles.recordingContainer}>
              {recordingUri ? (
                <ThemedView style={styles.playbackContainer}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={isPlaying ? stopSound : playSound}
                  >
                    <IconSymbol
                      name={isPlaying ? "stop.fill" : "play.fill"}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  <ThemedText style={styles.durationText}>
                    {formatDuration(recordingDuration)}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      if (sound) {
                        sound.unloadAsync();
                      }
                      setRecordingUri(null);
                      setRecordingDuration(0);
                    }}
                  >
                    <IconSymbol name="trash" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </ThemedView>
              ) : (
                <ThemedView style={styles.recordButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.recordButton,
                      isRecording && styles.recordingActive,
                    ]}
                    onPress={isRecording ? stopRecording : startRecording}
                  >
                    <IconSymbol
                      name={isRecording ? "stop.fill" : "mic.fill"}
                      size={32}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  {isRecording && (
                    <ThemedText style={styles.recordingText}>
                      Recording... {formatDuration(recordingDuration)}
                    </ThemedText>
                  )}
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          <TouchableOpacity
            style={styles.publishButtonContainer}
            onPress={handlePublish}
          >
            <LinearGradient
              colors={["#4CAF50", "#2E7D32"]}
              style={styles.publishButton}
            >
              <ThemedText style={styles.publishButtonText}>
                Publish Track
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  coverSection: {
    marginBottom: 20,
  },
  coverSelector: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  coverPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#808080",
  },
  recordingSection: {
    marginBottom: 24,
  },
  recordingContainer: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonContainer: {
    alignItems: "center",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingActive: {
    backgroundColor: "#FF0000",
  },
  recordingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#FF3B30",
  },
  playbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  durationText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  publishButtonContainer: {
    marginTop: 10,
  },
  publishButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
