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

} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

import { useColorScheme } from "@/hooks/useColorScheme";

// Define types
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageProps {
  text: string;
  isUser: boolean;
  colorScheme: string | null | undefined;
  timestamp: Date;
}

// Enhanced bot responses with more variety
const botResponses: string[] = [
  "Hi there! How can I help you today? 😊",
  "I'm here to assist with any questions about our service.",
  "Could you please provide more details about what you're looking for?",
  "That's a great question! Let me find that information for you.",
  "Is there anything else you'd like to know?",
  "I understand your concern. How can I help resolve this?",
  "Thanks for reaching out! I'm happy to help.",
  "Let me see what I can do to assist you with that.",
  "That sounds interesting! Tell me more about it.",
  "I'm processing your request. Please give me a moment.",
];

// Improved Message component with better styling and timestamp
const Message: React.FC<MessageProps> = ({
  text,
  isUser,
  colorScheme,
  timestamp,
}) => {
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        marginVertical: 6,
        maxWidth: "85%",
      }}
    >
      <View
        style={{
          backgroundColor: isUser ? "#007AFF" : isDark ? "#2C2C2E" : "#F2F2F7",
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={{
            color: isUser ? "white" : isDark ? "#FFFFFF" : "#000000",
            fontSize: 16,
            lineHeight: 20,
          }}
        >
          {text}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          color: isDark ? "#8E8E93" : "#8E8E93",
          marginTop: 4,
          marginLeft: isUser ? 0 : 12,
          marginRight: isUser ? 12 : 0,
          textAlign: isUser ? "right" : "left",
        }}
      >
        {timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
};

export default function ChatBot(): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      text: "Hello! How can I help you today? 👋",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const typingAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Message>>(null);
  const screenHeight = Dimensions.get("window").height;

  const toggleChat = (): void => {
    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
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
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");
    setIsTyping(true);

    // Start typing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate bot response with typing delay
    setTimeout(() => {
      setIsTyping(false);
      typingAnim.stopAnimation();
      typingAnim.setValue(0);

      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1500 + Math.random() * 1000); // Random typing time
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (listRef.current && messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

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
  };

  const TypingIndicator = () => (
    <View
      style={{
        alignSelf: "flex-start",
        marginVertical: 6,
        maxWidth: "85%",
      }}
    >
      <View
        style={{
          backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: isDark ? "#FFFFFF" : "#000000",
            fontSize: 16,
            marginRight: 8,
          }}
        >
          Typing
        </Text>
        <Animated.View
          style={{
            opacity: typingAnim,
          }}
        >
          <Text
            style={{
              color: isDark ? "#FFFFFF" : "#000000",
              fontSize: 16,
            }}
          >
            ...
          </Text>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Chat button */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 180,
            right: 20,
            zIndex: 100,
          },
          buttonStyle,
        ]}
      >
        <TouchableOpacity
          onPress={toggleChat}
          style={{
            backgroundColor: "#007AFF",
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
          activeOpacity={0.8}
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
              height: screenHeight * 0.75,
              backgroundColor: isDark ? "#000000" : "#FFFFFF",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 10,
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
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#2C2C2E" : "#F2F2F7",
              backgroundColor: isDark ? "#1C1C1E" : "#F8F9FA",
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#007AFF",
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
                  fontWeight: "600",
                  fontSize: 18,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Chat Assistant
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#34C759",
                  marginTop: 2,
                }}
              >
                ● Online • Ready to help
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleChat}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
              }}
            >
              <IconSymbol
                size={20}
                name="xmark"
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>
          </View>

          {/* Messages list */}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: ListRenderItemInfo<Message>) => (
              <Message
                text={item.text}
                isUser={item.isUser}
                colorScheme={colorScheme}
                timestamp={item.timestamp}
              />
            )}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          />

          {/* Input area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: isDark ? "#2C2C2E" : "#F2F2F7",
                backgroundColor: isDark ? "#1C1C1E" : "#F8F9FA",
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 22,
                  backgroundColor: isDark ? "#2C2C2E" : "#FFFFFF",
                  color: isDark ? "#FFFFFF" : "#000000",
                  fontSize: 16,
                  marginRight: 12,
                  maxHeight: 100,
                  borderWidth: 1,
                  borderColor: isDark ? "#3C3C3E" : "#E5E5EA",
                }}
                placeholder="Type a message..."
                placeholderTextColor={isDark ? "#8E8E93" : "#8E8E93"}
                value={inputText}
                onChangeText={setInputText}
                multiline
                onSubmitEditing={handleSend}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={inputText.trim() === "" || isTyping}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor:
                    inputText.trim() === "" || isTyping
                      ? isDark
                        ? "#2C2C2E"
                        : "#E5E5EA"
                      : "#007AFF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
              >
                <IconSymbol
                  size={20}
                  name="paperplane.fill"
                  color={
                    inputText.trim() === "" || isTyping
                      ? isDark
                        ? "#8E8E93"
                        : "#8E8E93"
                      : "white"
                  }
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
}
