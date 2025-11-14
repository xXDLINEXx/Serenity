import React from "react";
import { Pressable, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAudio } from "@/contexts/AudioContext"; // ✅ On ajoute ceci

interface SoundCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: any;
  gradient: string[];
  audioUrl?: string;
  onPress?: () => void;
}

export default function SoundCard({
  id,
  title,
  description,
  thumbnail,
  gradient,
  audioUrl,
}: SoundCardProps) {

  const router = useRouter();
  const { stopSound } = useAudio(); // ✅ On ajoute ça

  const handlePress = () => {
    console.log("[SoundCard] Stopping all audio before opening:", id);

    // ✅ ARRÊTE LE SON FANTÔME AVANT OUVERTURE FULLSCREEN
    stopSound();

    // 👉 Ensuite on ouvre le lecteur fullscreen
    router.push(`/fullscreen-player?mediaId=${id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#111",
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Image
          source={thumbnail}
          style={{
            width: 70,
            height: 70,
            borderRadius: 12,
          }}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "white",
              marginBottom: 6,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
            }}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
