import { API_BASE_URL } from "@/constants";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminBooksDashboard = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  // Load initial data
  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch books - in a real app, this would call your API
  const fetchBooks = async (refresh = false) => {
    if (refresh) {
      setPage(1);
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/books/user/mybooks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedBooks = response.data.books || [];
      console.log("Fetched books:", fetchedBooks);

      // Process the books to convert file paths to URLs
      const processedBooks = fetchedBooks.map((book) => ({
        ...book,
        coverImageUrl: convertPathToUrl(book.coverImage),
      }));

      setBooks((prevBooks) => {
        const combined = refresh
          ? processedBooks
          : [...prevBooks, ...processedBooks];

        // Deduplicate by _id
        const uniqueBooksMap = new Map();
        for (const book of combined) {
          uniqueBooksMap.set(book._id, book);
        }

        return Array.from(uniqueBooksMap.values());
      });

      setHasMore(fetchedBooks.length > 0);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Convert local file path to a URL that can be accessed by the client
  const convertPathToUrl = (path) => {
    if (!path) return null;

    // Extract the filename from the path
    const filename = path.split("\\").pop();

    // Construct a URL to access the file from your server
    return `${API_BASE_URL}/uploads/covers/${filename}`;
  };

  // Load more books when scrolling
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
      fetchBooks();
    }
  };

  // Pull to refresh
  const handleRefresh = () => {
    fetchBooks(true);
  };

  // Navigate to add book screen
  const handleAddBook = () => {
    router.push("/modal/adminAddBook");
  };

  // Filtered books based on search and status
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      search === "" ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || book.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle book status (publish/unpublish)
  const toggleBookStatus = async (bookId) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const book = books.find((b) => b._id === bookId);
      const newStatus = book.status === "published" ? "draft" : "published";

      await axios.put(
        `${API_BASE_URL}/api/v1/books/${bookId}/publish`,
        // { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book._id === bookId
            ? {
                ...book,
                status: newStatus,
                publishedAt:
                  newStatus === "published" ? new Date().toISOString() : null,
              }
            : book
        )
      );
    } catch (error) {
      console.error("Error updating book status:", error);
      // Show error message to user
    }
  };

  // Delete book
  const deleteBook = async (bookId) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/books/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Delete response:", response.data);
      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
    } catch (error) {
      console.error("Error deleting book:", error);
      // Show error message to user
    }
  };

  // Render book item
  const renderBookItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <TouchableOpacity
          style={styles.bookImageContainer}
          onPress={() => router.push(`/read/${item._id}`)} // 👈 Adjust the route as per your file structure
        >
          {item.coverImageUrl ? (
            <Image
              source={{ uri: item.coverImageUrl }}
              style={styles.bookImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.bookImage,
                {
                  backgroundColor:
                    item.status === "published"
                      ? Colors.light.tint
                      : Colors.light.border,
                },
              ]}
            >
              <Text style={styles.bookImageText}>{item.title.charAt(0)}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor}>{item.author}</Text>
          <View style={styles.bookMeta}>
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor:
                    item.status === "published" ? "#e0f2f1" : "#ffebee",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: item.status === "published" ? "#00796b" : "#c62828",
                  },
                ]}
              >
                {item.status === "published" ? "Published" : "Draft"}
              </Text>
            </View>
            <Text style={styles.genreText}>{item.genre}</Text>
          </View>
        </View>
      </View>

      {item.status === "published" && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons
              name="eye-outline"
              size={16}
              color={Colors.light.secondaryText}
            />
            <Text style={styles.statText}>{item.reads} reads</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="heart-outline"
              size={16}
              color={Colors.light.secondaryText}
            />
            <Text style={styles.statText}>{item.likes.length} likes</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.light.secondaryText}
            />
            <Text style={styles.statText}>
              {new Date(item.publishedAt || Date.now()).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("AdminEditBook", { bookId: item._id })
          }
        >
          <Ionicons name="create-outline" size={20} color={Colors.light.icon} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleBookStatus(item._id)}
        >
          <Ionicons
            name={
              item.status === "published" ? "eye-off-outline" : "eye-outline"
            }
            size={20}
            color={Colors.light.icon}
          />
          <Text style={styles.actionButtonText}>
            {item.status === "published" ? "Unpublish" : "Publish"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteBook(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#e53935" />
          <Text style={[styles.actionButtonText, { color: "#e53935" }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render footer (loading indicator)
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.light.tint} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
          <Ionicons name="add-outline" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Book</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.light.secondaryText}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor={Colors.light.secondaryText}
            value={search}
            onChangeText={setSearch}
          />
          {search !== "" && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.light.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setStatusFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === "all" && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === "published" && styles.activeFilter,
          ]}
          onPress={() => setStatusFilter("published")}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === "published" && styles.activeFilterText,
            ]}
          >
            Published
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === "draft" && styles.activeFilter,
          ]}
          onPress={() => setStatusFilter("draft")}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === "draft" && styles.activeFilterText,
            ]}
          >
            Drafts
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.tint]}
            tintColor={Colors.light.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.light.tint} />
            ) : (
              <>
                <Ionicons
                  name="book-outline"
                  size={60}
                  color={Colors.light.icon}
                />
                <Text style={styles.emptyText}>No books found</Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: Colors.light.text,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  activeFilter: {
    backgroundColor: Colors.light.tint,
  },
  filterText: {
    color: Colors.light.secondaryText,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  bookCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookHeader: {
    flexDirection: "row",
  },
  bookImageContainer: {
    marginRight: 16,
  },
  bookImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.border,
  },
  bookImageText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  genreText: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    textTransform: "capitalize",
  },
  statsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
    marginTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    color: Colors.light.text,
    fontWeight: "500",
  },
  footerLoader: {
    padding: 16,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    marginTop: 8,
  },
});

export default AdminBooksDashboard;
