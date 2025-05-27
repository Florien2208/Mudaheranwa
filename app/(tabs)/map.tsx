import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Using OpenStreetMap which doesn't require an API key
const mapHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .user-marker {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
      background-color: #4285F4;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .pulse {
      animation: pulse 2s infinite;
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: rgba(66, 133, 244, 0.4);
    }
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(3);
        opacity: 0;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Initialize map with a default view (will be updated when we get location)
    var map = L.map('map').setView([-1.9441, 30.0619], 15);

    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Create a custom icon for user location
    var userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div class="pulse"></div>',
      iconSize: [24, 24],
    });

    // Add a marker for the user (will be positioned when we get location)
    var userMarker = L.marker([0, 0], {icon: userIcon}).addTo(map);
    var isFirstLocation = true;

    // Add event listener to handle messages from React Native
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE_LOCATION') {
          const lat = data.lat;
          const lng = data.lng;
          
          // Update marker position
          userMarker.setLatLng([lat, lng]);
          
          // If this is the first location update, zoom to it
          if (isFirstLocation) {
            map.setView([lat, lng], 15);
            isFirstLocation = false;
          }
          
          // Add popup with information
          userMarker.bindPopup("<b>Your Current Location</b>").openPopup();
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  </script>
</body>
</html>
`;

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  // We'll use a hardcoded default location instead of requiring the expo-location module
  const defaultLatitude = -1.9441; // Default to Kigali, Rwanda coordinates
  const defaultLongitude = 30.0619;

  useEffect(() => {
    // Update the map with default location after a short delay
    const timer = setTimeout(() => {
      if (webViewRef.current) {
        updateLocation(defaultLatitude, defaultLongitude);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const onLoadEnd = () => {
    setIsLoading(false);
    // Update with default location when map loads
    setTimeout(() => {
      updateLocation(defaultLatitude, defaultLongitude);
    }, 1000);
  };

  // Function to update map location
  const updateLocation = (lat, lng) => {
    const locationData = {
      type: "UPDATE_LOCATION",
      lat: lat,
      lng: lng,
      title: "Your Location",
    };
    webViewRef.current?.postMessage(JSON.stringify(locationData));
  };

  return (
    <SafeAreaView
      style={[styles.container]}
    >
      <View style={styles.mapContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading Map...
            </Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: mapHTML }}
          style={styles.map}
          onLoadEnd={onLoadEnd}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  errorSubText: {
    fontSize: 16,
    textAlign: "center",
  },
});
