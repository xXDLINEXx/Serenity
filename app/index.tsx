import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { sleepSounds } from "../constants/sleepSounds";
import { healingFrequencies } from "../constants/frequencies";

const { width } = Dimensions.get("window");

export default function IndexScreen() {
  const renderSoundCard = (item: any, route: string) => (
    <Link href={{ pathname: route, params: { id: item.id, type: route === "/local-player" ? "frequency" : "sound" } }} asChild>
      <TouchableOpacity style={[styles.card, { backgroundColor: item.colors[0] }]}>
        <LinearGradient colors={item.colors} style={styles.gradient}>
          <View style={styles.iconCircle}>
            <item.icon size={40} color="#fff" />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/bg-serenity.jpg")}
        style={styles.background}
        blurRadius={8}
      >
        <View style={styles.overlay}>
          <Text style={styles.appTitle}>🌙 Serenity</Text>

          {/* Sons relaxants */}
          <Text style={styles.sectionTitle}>Sons Relaxants</Text>
          <FlatList
            data={sleepSounds}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => renderSoundCard(item, "/cdn-player")}
            contentContainerStyle={styles.listContainer}
          />

          {/* Fréquences de guérison */}
          <Text style={styles.sectionTitle}>Fréquences de Guérison</Text>
          <FlatList
            data={healingFrequencies}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => renderSoundCard(item, "/local-player")}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  background: { flex: 1, resizeMode: "cover", justifyContent: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", paddingTop: 60, paddingHorizontal: 16 },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    marginLeft: 10,
  },
  listContainer: { paddingBottom: 40 },
  card: {
    width: width * 0.55,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    elevation: 5,
  },
  gradient: { flex: 1, padding: 20, justifyContent: "center" },
  iconCircle: {
    backgroundColor: "rgba(255,255,255,0.15)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 4,
  },
});
