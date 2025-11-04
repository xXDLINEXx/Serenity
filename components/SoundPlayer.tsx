import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Video } from "expo-video";
import { Audio } from "expo-av";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SoundConfig } from "@/types/soundsConfig";

const { width, height } = Dimensions.get("window");

interface SoundPlayerProps {
  sound: SoundConfig;
  onClose: () => void;
}

export default function SoundPlayer({ sound, onClose }: SoundPlayerProps) {
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const translateY = useSharedValue(0);

  const handleGestureEnd = () => {
    if (translateY.value > height * 0.25) {
      runOnJS(onClose)(); // Ferme si assez swipé
    } else {
      translateY.value = withSpring(0); // Retour au centre
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd(handleGestureEnd);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: sound.audio! },
          { shouldPlay: true, isLooping: true }
        );
        setAudioSound(newSound);
      } catch (error) {
        console.error("Audio load error", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      audioSound?.unloadAsync();
    };
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {sound.video && (
          <Video
            source={{ uri: sound.video }}
            style={styles.video}
            shouldPlay
            isLooping
            resizeMode="cover"
          />
        )}

        <View style={styles.overlay}>
          <Text style={styles.title}>{sound.title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width,
    height,
    top: 0,
    left: 0,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 16,
  },
  closeButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
