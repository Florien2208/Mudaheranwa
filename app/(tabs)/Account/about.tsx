import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  StatusBar,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AppInfoScreen = ({ navigation }) => {
  const [crashReporting, setCrashReporting] = useState(true);
  const [customerExperience, setCustomerExperience] = useState(true);

  const handleCheckUpdates = () => {
    Alert.alert("Updates", "Checking for updates...");
  };

  const handleProductFeatures = () => {
    Alert.alert("Product Features", "Opening product features...");
  };

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      Alert.alert("Back", "Going back...");
    }
  };

  const handlePolicyPress = (type) => {
    Alert.alert(type, `Opening ${type.toLowerCase()}...`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />


      {/* App Info Section */}
      <View className="items-center py-12 px-6">
        {/* App Icon */}
        <View className="mb-6">
          <Image
            source={require("../../../assets/images/icon.png")} // Adjust path as needed
            className="w-20 h-20 rounded-2xl"
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text className="text-2xl font-semibold text-gray-900 mb-2">
          Mudaheranwa
        </Text>

        {/* Version */}
        <Text className="text-base text-gray-500">Version 1.0.0.100</Text>
      </View>

      {/* Settings Section */}
      <View className="px-6 space-y-1">
        {/* Check for updates */}
        <TouchableOpacity
          onPress={handleCheckUpdates}
          className="flex-row items-center justify-between py-4 border-b border-gray-100"
        >
          <Text className="text-base text-gray-900">Check for updates</Text>
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500 mr-2">1.0.0.100</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Product features */}
        <TouchableOpacity
          onPress={handleProductFeatures}
          className="flex-row items-center justify-between py-4 border-b border-gray-100"
        >
          <Text className="text-base text-gray-900">Product features</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Submit crash information */}
        <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
          <Text className="text-base text-gray-900">
            Submit crash information
          </Text>
          <Switch
            value={crashReporting}
            onValueChange={setCrashReporting}
            trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
            thumbColor={crashReporting ? "#FFFFFF" : "#FFFFFF"}
            ios_backgroundColor="#E5E7EB"
          />
        </View>

        {/* Join customer experience improvement program */}
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-1 mr-4">
            <Text className="text-base text-gray-900">
              Join customer experience improvement program
            </Text>
          </View>
          <Switch
            value={customerExperience}
            onValueChange={setCustomerExperience}
            trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
            thumbColor={customerExperience ? "#FFFFFF" : "#FFFFFF"}
            ios_backgroundColor="#E5E7EB"
          />
        </View>
      </View>

      {/* Footer */}
      <View className="flex-1 justify-end px-6 pb-8">
        {/* Policy Links */}
        <View className="flex-row justify-center space-x-6 mb-4">
          <TouchableOpacity
            onPress={() => handlePolicyPress("Terms of service")}
          >
            <Text className="text-sm text-gray-600">Terms of service</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePolicyPress("Privacy policy")}>
            <Text className="text-sm text-gray-600">Privacy policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlePolicyPress("Copyright policy")}
          >
            <Text className="text-sm text-gray-600">Copyright policy</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text className="text-xs text-gray-400 text-center">
          © Copyright 2025 MUDAHERANWA. All rights reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AppInfoScreen;
