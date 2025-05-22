import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import { API_BASE_URL } from "@/constants";
import { useLocalSearchParams } from "expo-router";

const ReadBook = ({ route }) => {
 
  const { bookId } = useLocalSearchParams();
  const [bookContent, setBookContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookContent = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/books/${bookId}/content`
        );
        console.log("Book content response:", response.data);
        setBookContent(response.data.content); // adjust based on your API
      } catch (error) {
        console.error("Failed to load book content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookContent();
  }, [bookId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.contentText}>{bookContent}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  contentText: { fontSize: 16, lineHeight: 24 },
});

export default ReadBook;
