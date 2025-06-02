import { useEffect, useState } from "react";
import * as Location from "expo-location";
import type { LocationObject } from "expo-location";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Real genocide memorial sites in Rwanda with coordinates
const facilities = [
  {
    name: "Kigali Genocide Memorial",
    latitude: -1.9309538509389927,
    longitude: 30.060668924304128,
    type: "memorial",
  },
  {
    name: "Nyamata Genocide Memorial",
    latitude: -2.1445, // Approximately 30km south of Kigali
    longitude: 30.0946,
    type: "memorial",
  },
  {
    name: "Murambi Genocide Memorial",
    latitude: -2.5167, // Southern Rwanda near Murambi town
    longitude: 29.75,
    type: "memorial",
  },
  {
    name: "Bisesero Genocide Memorial",
    latitude: -2.0833, // Western Province, Karongi district
    longitude: 29.4167,
    type: "memorial",
  },
  {
    name: "Ntarama Genocide Memorial",
    latitude: -2.1234, // Near Nyamata area
    longitude: 30.1,
    type: "memorial",
  },
];

export default function MapScreen() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission denied");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
       

        {/* Greeting */}
        <Text style={styles.hello}>
          Hello <Text style={{ color: "#00BFFF" }}>!</Text>
        </Text>
        <Text style={styles.subtitle}>
          Which Memorial site are you looking for today?
        </Text>

        {/* Search */}
        <TextInput
          placeholder="Search memorial sites"
          style={styles.searchBar}
        />

        {/* Map */}
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : location ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02, // Increased to show more area
              longitudeDelta: 0.02,
            }}
          >
            {/* User location marker */}
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
              description="Your current location"
              pinColor="blue"
            />

            {/* Branch/Facility markers */}
            {facilities.map((facility, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: facility.latitude,
                  longitude: facility.longitude,
                }}
                title={facility.name}
                description={
                  facility.type === "memorial"
                    ? `${facility.name} - Commemorating the 1994 Genocide against the Tutsi`
                    : "Medical facility"
                }
                pinColor={facility.type === "memorial" ? "purple" : "red"}
              />
            ))}
          </MapView>
        ) : (
          <Text>Location not available</Text>
        )}

        {/* Facilities */}
        <Text style={styles.sectionTitle}>Rwanda Genocide Memorial Sites</Text>
        <View style={styles.facilityGrid}>
          {facilities.map((facility, index) => (
            <View
              key={index}
              style={[
                styles.card,
                facility.type === "memorial" && styles.memorialCard,
              ]}
            >
              <Image
                source={require("@/assets/avatar.png")}
                style={styles.cardImage}
              />
              <Text
                style={[
                  styles.cardText,
                  facility.type === "memorial" && styles.memorialText,
                ]}
              >
                {facility.name}
              </Text>
              {facility.type === "memorial" && (
                <Text style={styles.memorialSubtext}>Memorial Site</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F9FB",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  hello: {
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  map: {
    width: width - 32,
    height: height * 0.55,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  facilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
  },
  memorialCard: {
    backgroundColor: "#F8F5FF",
    borderColor: "#8B5CF6",
    borderWidth: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    textAlign: "center",
  },
  memorialText: {
    fontWeight: "600",
    color: "#6B46C1",
  },
  memorialSubtext: {
    fontSize: 12,
    color: "#8B5CF6",
    fontStyle: "italic",
    marginTop: 4,
  },
});
