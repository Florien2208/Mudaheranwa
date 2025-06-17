import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";

import { API_BASE_URL } from "@/constants";

// Mock icons (in a real app, you would use a library like react-native-vector-icons)
const BookIcon = () => (
  <View style={styles.icon}>
    <Text style={{ color: "white", fontWeight: "bold" }}>📚</Text>
  </View>
);

const SearchIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Text>🔍</Text>
  </View>
);

const DownloadIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Text>⬇️</Text>
  </View>
);



const BackIcon = () => <Text>⬅️</Text>;

// Main App Component
const BookApp = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        // Replace with your actual API endpoint
        const response = await fetch(`${API_BASE_URL}/api/v1/books`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
         
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched books:", data);

        // Transform API data to match your app's structure
        const transformedBooks = data.books.map((book, index) => ({
          id: book._id,
          title: book.title,
          author: book.author,
          description: book.description,
          category: book.genre,
          pages: book.pageCount || 0,
          publisher: book.user?.name || "Unknown Publisher",
          publicationDate: new Date(book.publishedAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          ),
          language: "English", // Default since not provided in API
          isbn: `978-${Math.random().toString().substr(2, 10)}`, // Generate fake ISBN since not provided
          coverUrl:
            book.coverImage && book.coverImage !== "default-book-cover.jpg"
              ? `${API_BASE_URL}/uploads/covers/${book.coverImage
                  .split("\\")
                  .pop()
                  .split("/")
                  .pop()}`
              : `https://via.placeholder.com/150x225/72b7e9/FFFFFF?text=Book+${
                  index + 1
                }`,

          downloading: false,
          downloaded: false,
          // Additional fields from your API
          likes: book.likes?.length || 0,
          reads: book.reads,
          status: book.status,
          bookFile: book.bookFile,
        }));

        setBooks(transformedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);

      
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (bookId) => {
    // In a real app, this would trigger an actual download
    const updatedBooks = books.map((book) => {
      if (book.id === bookId) {
        return { ...book, downloading: true };
      }
      return book;
    });

    setBooks(updatedBooks);

    // Simulate download completion
    setTimeout(() => {
      const completedBooks = books.map((book) => {
        if (book.id === bookId) {
          return { ...book, downloading: false, downloaded: true };
        }
        return book;
      });

      setBooks(completedBooks);

      // Reset the downloaded flag after showing success
      setTimeout(() => {
        const resetBooks = books.map((book) => {
          if (book.id === bookId) {
            return { ...book, downloaded: false };
          }
          return book;
        });

        setBooks(resetBooks);
      }, 1500);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <BookIcon />
            </View>
            <Text style={styles.appTitle}>BookSpot</Text>
          </View>

          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search books or authors"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Content Area */}
        {selectedBook ? (
          <BookDetail
            book={selectedBook}
            onBack={() => setSelectedBook(null)}
            onDownload={handleDownload}
          />
        ) : (
          <BookList
            books={filteredBooks}
            onSelectBook={setSelectedBook}
            loading={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Book List Component
const BookList = ({ books, onSelectBook, loading }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#72b7e9" />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BookIcon />
        <Text style={styles.emptyText}>No books found</Text>
      </View>
    );
  }

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredItem}
      onPress={() => onSelectBook(item)}
    >
      <Image
        source={{ uri: item.coverUrl }}
        style={styles.featuredCover}
        resizeMode="cover"
      />
      <Text style={styles.bookTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {item.author}
      </Text>
    </TouchableOpacity>
  );

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => onSelectBook(item)}
    >
      <Image
        source={{ uri: item.coverUrl }}
        style={styles.bookCover}
        resizeMode="cover"
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      {/* Featured Books Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Books</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={books.slice(0, 4)}
        renderItem={renderFeaturedItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
      />

      {/* All Books Section */}
      <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 15 }]}>
        All Books
      </Text>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        numColumns={2}
        contentContainerStyle={styles.bookList}
      />
    </ScrollView>
  );
};

// Book Detail Component
const BookDetail = ({ book, onBack, onDownload }) => {
  return (
    <ScrollView style={styles.detailContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <BackIcon />
        <Text style={styles.backText}>Back to books</Text>
      </TouchableOpacity>

      <View style={styles.bookDetailCard}>
        <Image
          source={{ uri: book.coverUrl }}
          style={styles.detailCover}
          resizeMode="cover"
        />

        <View style={styles.detailInfo}>
          <Text style={styles.detailTitle}>{book.title}</Text>
          <Text style={styles.detailAuthor}>by {book.author}</Text>

          <View style={styles.badgeContainer}>
            <View style={styles.detailBadge}>
              <Text style={styles.badgeText}>{book.category}</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.badgeText}>{book.pages} pages</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={4}>
            {book.description}
          </Text>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => onDownload(book.id)}
          >
            <DownloadIcon />
            <Text style={styles.downloadText}>
              {book.downloading
                ? "Downloading..."
                : book.downloaded
                ? "Downloaded"
                : "Download"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About this book</Text>
        <Text style={styles.aboutText}>{book.description}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Publisher</Text>
            <Text style={styles.detailValue}>{book.publisher}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Publication Date</Text>
            <Text style={styles.detailValue}>{book.publicationDate}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Language</Text>
            <Text style={styles.detailValue}>{book.language}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ISBN</Text>
            <Text style={styles.detailValue}>{book.isbn}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Styles
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  mainContainer: {
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
    width: 150,
    marginRight: 16,
  },
  featuredCover: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#72b7e9",
  },
  bookTitle: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  bookAuthor: {
    color: "#666",
    fontSize: 14,
  },
  bookList: {
    paddingBottom: 20,
  },
  bookItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
    marginRight: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    overflow: "hidden",
    padding: 10,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  bookCover: {
    width: 50,
    height: 80,
    borderRadius: 4,
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#72b7e9",
  },
  bookInfo: {
    flex: 1,
    marginLeft: 10,
  },
  categoryBadge: {
    backgroundColor: "#72b7e9",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  loadingText: {
    color: "#666",
    marginTop: 12,
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
  },
  // Detail Styles
  detailContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    color: "#72b7e9",
    marginLeft: 8,
    fontSize: 16,
  },
  bookDetailCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  detailCover: {
    width: 180,
    height: 270,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#72b7e9",
  },
  detailInfo: {
    width: "100%",
    alignItems: "center",
  },
  detailTitle: {
    color: "#333",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  detailAuthor: {
    color: "#666",
    fontSize: 16,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailBadge: {
    backgroundColor: "#72b7e9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
  description: {
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  downloadButton: {
    backgroundColor: "#72b7e9",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "80%",
  },
  downloadText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  aboutSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  aboutTitle: {
    color: "#72b7e9",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  aboutText: {
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: 12,
  },
  detailLabel: {
    color: "#72b7e9",
    fontSize: 12,
    fontWeight: "600",
  },
  detailValue: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default BookApp;
