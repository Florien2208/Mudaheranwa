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
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { API_BASE_URL } from "@/constants";
import { AntDesign } from "@expo/vector-icons";

// Enhanced icons with better visual design
const BookIcon = () => (
  <View className="items-center justify-center">
    <Text className="text-white font-bold text-lg">📚</Text>
  </View>
);

const SearchIcon = () => (
  <View className="mr-3">
    <Text className="text-lg">🔍</Text>
  </View>
);

const DownloadIcon = () => (
  <View className="mr-2">
    <AntDesign name="download" size={20} color="white" />
  </View>
);


const HeartIcon = () => (
  <View className="mr-1">
    <Text className="text-red-500">❤️</Text>
  </View>
);

const EyeIcon = () => (
  <View className="mr-1">
    <Text className="text-gray-500">👁️</Text>
  </View>
);

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Main Content */}
      <View className="flex-1 bg-gray-50">
        {/* Enhanced Header with Gradient Effect */}
        <View
          className="p-5 bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-[#72b7e9] items-center justify-center mr-3 shadow-lg">
                <BookIcon />
              </View>
              <View>
                <Text className="text-[#72b7e9] text-2xl font-bold">
                  Books
                </Text>
                <Text className="text-gray-500 text-sm">
                  Discover amazing books
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row bg-gray-50 rounded-2xl px-4 py-3 items-center border-2 border-gray-100 shadow-sm">
            <SearchIcon />
            <TextInput
              className="flex-1 text-gray-800 text-base"
              placeholder="Search books or authors..."
              placeholderTextColor="#9ca3af"
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

// Enhanced Book List Component
const BookList = ({ books, onSelectBook, loading }) => {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
          <ActivityIndicator size="large" color="#72b7e9" />
          <Text className="text-gray-600 mt-4 text-lg font-medium">
            Loading books...
          </Text>
        </View>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <BookIcon />
          </View>
          <Text className="text-gray-600 text-lg font-medium">
            No books found
          </Text>
          <Text className="text-gray-400 text-sm mt-2">
            Try adjusting your search
          </Text>
        </View>
      </View>
    );
  }

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      className="mr-4 bg-white rounded-3xl p-4 shadow-lg"
      style={{ width: 160 }}
      onPress={() => onSelectBook(item)}
    >
      <Image
        source={{ uri: item.coverUrl }}
        className="w-full rounded-2xl mb-3"
        style={{ height: 200 }}
        resizeMode="cover"
      />
      <Text
        className="text-gray-800 text-base font-bold mb-1"
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <Text className="text-gray-500 text-sm mb-2" numberOfLines={1}>
        by {item.author}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="bg-[#72b7e9] rounded-full px-3 py-1">
          <Text className="text-white text-xs font-medium">
            {item.category}
          </Text>
        </View>
        <View className="flex-row items-center">
          <HeartIcon />
          <Text className="text-gray-400 text-xs">{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBookItem = ({ item }) => {
    const { width } = Dimensions.get("window");
    const itemWidth = (width - 60) / 2;

    return (
      <TouchableOpacity
        className="mb-4 bg-white rounded-3xl p-4 shadow-lg"
        style={{ width: itemWidth, marginHorizontal: 4 }}
        onPress={() => onSelectBook(item)}
      >
        <Image
          source={{ uri: item.coverUrl }}
          className="w-full rounded-2xl mb-3"
          style={{ height: 140 }}
          resizeMode="cover"
        />
        <Text
          className="text-gray-800 text-sm font-bold mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
          {item.author}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="bg-[#72b7e9] rounded-full px-2 py-1">
            <Text className="text-white text-xs">{item.category}</Text>
          </View>
          <View className="flex-row items-center">
            <EyeIcon />
            <Text className="text-gray-400 text-xs">{item.reads}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Featured Books Section */}
      <View className="px-5 pt-5">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-800 text-2xl font-bold">
              Featured Books
            </Text>
            <Text className="text-gray-500 text-sm">Handpicked for you</Text>
          </View>
          {/* <TouchableOpacity className="bg-[#72b7e9] rounded-full px-4 py-2">
            <Text className="text-white text-sm font-medium">View all</Text>
          </TouchableOpacity> */}
        </View>

        <FlatList
          data={books.slice(0, 6)}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        />
      </View>

      {/* All Books Section */}
      <View className="px-5 pt-8 pb-5">
        <View className="mb-4">
          <Text className="text-gray-800 text-2xl font-bold mb-1">
            All Books
          </Text>
          <Text className="text-gray-500 text-sm">
            Explore our entire collection
          </Text>
        </View>

        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 20 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      </View>
    </ScrollView>
  );
};

// Enhanced Book Detail Component
const BookDetail = ({ book, onBack, onDownload }) => {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-5">
        <TouchableOpacity
          className="flex-row items-center mb-6 bg-white rounded-2xl px-4 py-3 shadow-sm"
          onPress={onBack}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
          <Text className="text-[#72b7e9] ml-3 text-base font-medium">
            Back to books
          </Text>
        </TouchableOpacity>

        <View className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <View className="items-center mb-6">
            <Image
              source={{ uri: book.coverUrl }}
              className="rounded-3xl shadow-lg"
              style={{ width: 200, height: 300 }}
              resizeMode="cover"
            />
          </View>

          <View className="items-center">
            <Text className="text-gray-800 text-2xl font-bold text-center mb-2">
              {book.title}
            </Text>
            <Text className="text-gray-500 text-lg mb-4">by {book.author}</Text>

            <View className="flex-row flex-wrap justify-center mb-6">
              <View className="bg-[#72b7e9] rounded-full px-4 py-2 mx-1 mb-2">
                <Text className="text-white text-sm font-medium">
                  {book.category}
                </Text>
              </View>
              <View className="bg-gray-100 rounded-full px-4 py-2 mx-1 mb-2">
                <Text className="text-gray-600 text-sm font-medium">
                  {book.pages} pages
                </Text>
              </View>
              <View className="bg-gray-100 rounded-full px-4 py-2 mx-1 mb-2 flex-row items-center">
                <HeartIcon />
                <Text className="text-gray-600 text-sm font-medium">
                  {book.likes} likes
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 text-center mb-6 leading-6 text-base">
              {book.description}
            </Text>

            <TouchableOpacity
              className={`${
                book.downloading
                  ? "bg-gray-400"
                  : book.downloaded
                    ? "bg-green-500"
                    : "bg-[#72b7e9]"
              } rounded-full flex-row items-center justify-center py-4 px-8 shadow-lg`}
              style={{ width: "100%" }}
              onPress={() => onDownload(book.id)}
              disabled={book.downloading}
            >
              {book.downloading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <DownloadIcon />
              )}
              <Text className="text-white font-bold text-lg ml-2">
                {book.downloading
                  ? "Downloading..."
                  : book.downloaded
                    ? "Downloaded ✓"
                    : "Download Book"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            About this book
          </Text>
          <Text className="text-gray-600 leading-6 mb-6 text-base">
            {book.description}
          </Text>

          <View className="space-y-4">
            <View className="flex-row">
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 mr-2">
                <Text className="text-[#72b7e9] text-sm font-bold mb-1">
                  Publisher
                </Text>
                <Text className="text-gray-800 text-base font-medium">
                  {book.publisher}
                </Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 ml-2">
                <Text className="text-[#72b7e9] text-sm font-bold mb-1">
                  Published
                </Text>
                <Text className="text-gray-800 text-base font-medium">
                  {book.publicationDate}
                </Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 mr-2">
                <Text className="text-[#72b7e9] text-sm font-bold mb-1">
                  Language
                </Text>
                <Text className="text-gray-800 text-base font-medium">
                  {book.language}
                </Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 ml-2">
                <Text className="text-[#72b7e9] text-sm font-bold mb-1">
                  ISBN
                </Text>
                <Text className="text-gray-800 text-base font-medium">
                  {book.isbn}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default BookApp;
