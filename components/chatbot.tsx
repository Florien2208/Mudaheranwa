import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ListRenderItemInfo,
  ViewStyle,
  TextStyle,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Define types
interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface MessageProps {
  text: string;
  isUser: boolean;
  colorScheme: string | null | undefined;
}

// Sample bot responses
const botResponses: string[] = [
  "Hi there! How can I help you today?",
  "I'm here to assist with any questions about our service.",
  "Could you please provide more details?",
  "That's a great question! Let me find that information for you.",
  "Is there anything else you'd like to know?",
];

// Message component
const Message: React.FC<MessageProps> = ({ text, isUser, colorScheme }) => {
  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser
          ? Colors[colorScheme as keyof typeof Colors]?.tint || "#2962FF"
          : Colors[colorScheme as keyof typeof Colors]?.tabBackgroundColor ||
            "#f0f0f0",
        borderRadius: 16,
        marginVertical: 4,
        maxWidth: "80%",
        padding: 12,
      }}
    >
      <Text
        style={{
          color: isUser
            ? "white"
            : Colors[colorScheme as keyof typeof Colors]?.text || "black",
          fontFamily: "Poppins",
        }}
      >
        {text}
      </Text>
    </View>
  );
};

export default function ChatBot(): React.ReactElement {
  const colorScheme = useColorScheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", text: "Hello! How can I help you today?", isUser: false },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const listRef = useRef<FlatList<Message>>(null);
  const screenHeight = Dimensions.get("window").height;

  const toggleChat = (): void => {
    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate panel
    if (isOpen) {
      Keyboard.dismiss();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSend = (): void => {
    if (inputText.trim() === "") return;

    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");

    // Simulate bot response
    setTimeout(() => {
      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (listRef.current && messages.length > 1) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Close chat when keyboard disappears
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // Optional: Close chat when keyboard hides
        // if (isOpen) toggleChat();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [isOpen]);

  // Animated styles
  const chatContainerStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight, 0],
        }),
      },
    ],
  };

  const buttonStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [{ scale: scaleAnim }],
    opacity: isOpen
      ? fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        })
      : 1,
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Chat button */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 80,
            right: 20,
            zIndex: 100,
          },
          buttonStyle,
        ]}
      >
        <TouchableOpacity
          onPress={toggleChat}
          style={{
            backgroundColor:
              Colors[colorScheme as keyof typeof Colors]?.tint || "#2962FF",
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <IconSymbol
            size={28}
            name={isOpen ? "xmark" : "bubble.left.fill"}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Chat container */}
      {isOpen && (
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: screenHeight * 0.7,
              backgroundColor:
                Colors[colorScheme as keyof typeof Colors]?.background ||
                "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 99,
              overflow: "hidden",
            },
            chatContainerStyle,
          ]}
        >
          {/* Chat header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor:
                Colors[colorScheme as keyof typeof Colors]
                  ?.tabBackgroundColor || "#f0f0f0",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  Colors[colorScheme as keyof typeof Colors]?.tint || "#2962FF",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <IconSymbol size={24} name="bubble.left.fill" color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "PoppinsBold",
                  fontSize: 16,
                  color:
                    Colors[colorScheme as keyof typeof Colors]?.text || "black",
                }}
              >
                Chat Assistant
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins",
                  fontSize: 12,
                  color:
                    Colors[colorScheme as keyof typeof Colors]?.text || "gray",
                  opacity: 0.7,
                }}
              >
                Online • Ready to help
              </Text>
            </View>
            <TouchableOpacity onPress={toggleChat}>
              <IconSymbol
                size={24}
                name="xmark"
                color={
                  Colors[colorScheme as keyof typeof Colors]?.text || "black"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Messages list */}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }: ListRenderItemInfo<Message>) => (
              <Message
                text={item.text}
                isUser={item.isUser}
                colorScheme={colorScheme}
              />
            )}
          />

          {/* Input area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderTopWidth: 1,
                borderTopColor:
                  Colors[colorScheme as keyof typeof Colors]
                    ?.tabBackgroundColor || "#f0f0f0",
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 20,
                  backgroundColor:
                    Colors[colorScheme as keyof typeof Colors]
                      ?.tabBackgroundColor || "#f0f0f0",
                  color:
                    Colors[colorScheme as keyof typeof Colors]?.text || "black",
                  fontFamily: "Poppins",
                  marginRight: 8,
                }}
                placeholder="Type a message..."
                placeholderTextColor={
                  Colors[colorScheme as keyof typeof Colors]?.text
                    ? `${Colors[colorScheme as keyof typeof Colors].text}80`
                    : "gray"
                }
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={inputText.trim() === ""}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor:
                    inputText.trim() === ""
                      ? `${
                          Colors[colorScheme as keyof typeof Colors]?.tint ||
                          "#2962FF"
                        }80`
                      : Colors[colorScheme as keyof typeof Colors]?.tint ||
                        "#2962FF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconSymbol size={20} name="paperplane.fill" color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
}
