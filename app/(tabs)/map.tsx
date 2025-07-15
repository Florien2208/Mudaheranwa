import { useEffect, useState, useRef } from "react";
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
  TouchableOpacity,
  Modal,
  FlatList,
  StatusBar,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Enhanced genocide memorial sites with multiple images per site
const facilities = [
  {
    name: "Kigali Genocide Memorial",
    latitude: -1.9309538509389927,
    longitude: 30.060668924304128,
    type: "memorial",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCz56iNesJ5Z0UvyCqHbwIiLOLv_GfpZHtpA&s",
      "https://i.assetzen.net/i/j6wGs3oQ8F9T/w:1165/h:480/q:70.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMgG8c3vEJuGkySslnlvOlFY3L0rkc--qH7g&s",
      "https://visitrwanda.com/wp-content/uploads/fly-images/1225/Visit-Rwanda-Kigali-Genocide-Museum-1920x1280.jpg",
      "https://images.unsplash.com/photo-1520637836862-4d197d17c5a4?w=400&h=300&fit=crop",
    ],
    description: "Main memorial center in Kigali",
    fullDescription:
      "The Kigali Genocide Memorial is the final resting place for more than 250,000 victims of the Genocide against the Tutsi. It honors the memory of the more than one million Rwandans killed in 1994 through education and peace-building.",
  },
  {
    name: "Nyamata Genocide Memorial",
    latitude: -2.1445,
    longitude: 30.0946,
    type: "memorial",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcuY5InCgdkAdP6kX5gVMohZiBD5_wMqp1mQ&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCKctjjFnkWIPZDzL-exZXW6wEZ8geAgewEQ&s",
      "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=auto,quality=60,width=1440,height=650,dpr=1/tour_img/749a88d51f4edcb6513a72cd1d080f0c4bc47468232e32175d003af2fd4c479e.jpg",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
    ],
    description: "Former church, now memorial site",
    fullDescription:
      "Nyamata Genocide Memorial is located in a former Catholic church where thousands of Tutsis were massacred during the 1994 genocide. The memorial preserves the church as it was found after the killings.",
  },
  {
    name: "Murambi Genocide Memorial",
    latitude: -2.5167,
    longitude: 29.75,
    type: "memorial",
    images: [
      "https://pbs.twimg.com/media/DbS7d-8XUAEhzvY?format=jpg&name=large",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAjk4fmxL7arhou0T8th7-kzjf4SlVx0R75w&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOlVV8Qs1qq6rhC_CY_D5XQXIJPDKFioeApyLbP2dcDUZN7QM3wfTtkKlsR-pByOnRHAk&usqp=CAU",
      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
    ],
    description: "Former technical school memorial",
    fullDescription:
      "Murambi Genocide Memorial is built on the site of a former technical school where approximately 50,000 people were killed. The memorial displays preserved remains of victims.",
  },
  {
    name: "Bisesero Genocide Memorial",
    latitude: -2.0833,
    longitude: 29.4167,
    type: "memorial",
    images: [
      "https://www.parliament.gov.rw/index.php?eID=dumpFile&t=f&f=25529&token=1188af96486600c5b225052226b6efd09ae6e5d7",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsbDgdx_habPg1kPwirx8oemBv1Nn114tajQ&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp4ttTzwifWzGGkd_8qkHmWbkqaPnuwUBvHg&s",
    ],
    description: "Memorial on the hills of resistance",
    fullDescription:
      "Bisesero Genocide Memorial commemorates the site where Tutsis resisted the genocide for several months. The memorial honors both the victims and the resistance fighters.",
  },
  {
    name: "Ntarama Genocide Memorial",
    latitude: -2.1234,
    longitude: 30.1,
    type: "memorial",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnfkCjVzK_SuhBWil8ZlaN6A_C47sLtDA6qg&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2pdNXuO04O4K_aD1RTjIrau36hXusF-af7w&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdcIMCYs8u9RbysulqIraYxrJTTyQr_iYiuQ&s",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    ],
    description: "Church memorial site near Nyamata",
    fullDescription:
      "Ntarama Genocide Memorial is housed in a former church where thousands of people were killed. The memorial preserves personal belongings and remains of the victims.",
  },
];

export default function MapScreen() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemorial, setSelectedMemorial] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mapRef = useRef<MapView>(null);

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

  const filteredFacilities = facilities.filter((facility) =>
    facility.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemorialTap = (index: number) => {
    const memorial = facilities[index];
    setSelectedMemorial(index);

    // Animate map to memorial location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: memorial.latitude,
          longitude: memorial.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const openGallery = (memorialIndex: number) => {
    setSelectedMemorial(memorialIndex);
    setCurrentImageIndex(0);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setCurrentImageIndex(0);
  };

  const resetMapView = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
      setSelectedMemorial(null);
    }
  };

  const renderGalleryItem = ({ item, index }) => (
    <View style={styles.galleryImageContainer}>
      <Image
        source={{ uri: item }}
        style={styles.galleryImage}
        resizeMode="cover"
      />
      <Text style={styles.imageCounter}>
        {index + 1} /{" "}
        {selectedMemorial !== null
          ? facilities[selectedMemorial].images.length
          : 0}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Text style={styles.subtitle}>
          Which Memorial site are you looking for today?
        </Text>

        {/* Search */}
        <TextInput
          placeholder="Search memorial sites"
          style={styles.searchBar}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetMapView}>
            <Text style={styles.controlButtonText}>Reset View</Text>
          </TouchableOpacity>
          {selectedMemorial !== null && (
            <Text style={styles.selectedText}>
              Viewing: {facilities[selectedMemorial].name}
            </Text>
          )}
        </View>

        {/* Map */}
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02,
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

            {/* Memorial markers */}
            {filteredFacilities.map((facility, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: facility.latitude,
                  longitude: facility.longitude,
                }}
                title={facility.name}
                description={facility.description}
                pinColor={selectedMemorial === index ? "gold" : "purple"}
                onPress={() => openGallery(index)}
              />
            ))}
          </MapView>
        ) : (
          <Text>Location not available</Text>
        )}

        {/* Facilities */}
        <Text style={styles.sectionTitle}>Rwanda Genocide Memorial Sites</Text>
        <View style={styles.facilityGrid}>
          {filteredFacilities.map((facility, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                styles.memorialCard,
                selectedMemorial === index && styles.selectedCard,
              ]}
              onPress={() => handleMemorialTap(index)}
              onLongPress={() => openGallery(index)}
            >
              <Image
                source={{ uri: facility.images[0] }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={[styles.cardText, styles.memorialText]}>
                {facility.name}
              </Text>
              <Text style={styles.memorialSubtext}>Memorial Site</Text>
              <Text style={styles.memorialDescription}>
                {facility.description}
              </Text>
              <View style={styles.imageCount}>
                <Text style={styles.imageCountText}>
                  📷 {facility.images.length} photos
                </Text>
              </View>
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>
                  Tap to view • Hold for gallery
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Gallery Modal */}
      <Modal
        visible={showGallery}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={closeGallery}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
        <View style={styles.galleryContainer}>
          {/* Header */}
          <View style={styles.galleryHeader}>
            <TouchableOpacity onPress={closeGallery} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.galleryTitle}>
              {selectedMemorial !== null
                ? facilities[selectedMemorial].name
                : ""}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Image Gallery */}
          {selectedMemorial !== null && (
            <FlatList
              data={facilities[selectedMemorial].images}
              renderItem={renderGalleryItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setCurrentImageIndex(index);
              }}
            />
          )}

          {/* Memorial Info */}
          {selectedMemorial !== null && (
            <View style={styles.galleryInfo}>
              <Text style={styles.galleryInfoTitle}>
                {facilities[selectedMemorial].name}
              </Text>
              <Text style={styles.galleryInfoDescription}>
                {facilities[selectedMemorial].fullDescription}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
    elevation: 2,
  },
  mapControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  controlButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  controlButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  selectedText: {
    fontSize: 12,
    color: "#6B46C1",
    fontWeight: "500",
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
  selectedCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#F59E0B",
    borderWidth: 2,
    elevation: 5,
  },
  cardImage: {
    width: 80,
    height: 60,
    marginBottom: 8,
    borderRadius: 6,
  },
  cardText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    color: "#6B46C1",
  },
  memorialText: {
    fontWeight: "600",
    color: "#6B46C1",
  },
  memorialSubtext: {
    fontSize: 11,
    color: "#8B5CF6",
    fontStyle: "italic",
    marginTop: 2,
  },
  memorialDescription: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  imageCount: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#DDD6FE",
    borderRadius: 4,
  },
  imageCountText: {
    fontSize: 9,
    color: "#6B46C1",
    fontWeight: "500",
  },
  tapHint: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#E0E7FF",
    borderRadius: 4,
  },
  tapHintText: {
    fontSize: 9,
    color: "#4F46E5",
    fontWeight: "500",
  },

  // Gallery Modal Styles
  galleryContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 50,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  galleryTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  galleryImageContainer: {
    width: width,
    height: height * 0.6,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  galleryImage: {
    width: width - 32,
    height: height * 0.5,
    borderRadius: 8,
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 32,
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: "500",
  },
  galleryInfo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  galleryInfoTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  galleryInfoDescription: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
  },
});
