import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '@/contexts/AudioContext';

interface SoundCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  gradient: string;
  audioUrl: string;
}

export function SoundCard({ id, title, description, thumbnail, gradient, audioUrl }: SoundCardProps) {
  const { playSound, isPlaying, currentTitle } = useAudio();
  const isCurrentlyPlaying = isPlaying && currentTitle === title;

  const gradientColors = parseGradient(gradient);

  const handlePress = async () => {
    await playSound(audioUrl, title);
  };

  return (
    <TouchableOpacity
      style={[styles.card, isCurrentlyPlaying && styles.cardPlaying]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: thumbnail }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={[gradientColors[0] || 'rgba(30, 58, 138, 0.8)', gradientColors[1] || 'rgba(0, 0, 0, 0.8)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function parseGradient(gradient: string): string[] {
  const matches = gradient.match(/hsl\([^)]+\)/g);
  if (!matches || matches.length < 2) {
    return ['rgba(30, 58, 138, 0.8)', 'rgba(0, 0, 0, 0.9)'];
  }

  return matches.map(hsl => {
    const values = hsl.match(/\d+/g);
    if (!values || values.length < 3) return 'rgba(0, 0, 0, 0.8)';
    
    const h = parseInt(values[0]);
    const s = parseInt(values[1]);
    const l = parseInt(values[2]);
    
    return `hsla(${h}, ${s}%, ${l}%, 0.85)`;
  });
}

const styles = StyleSheet.create({
  card: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardPlaying: {
    borderWidth: 3,
    borderColor: '#60A5FA',
  },
  imageBackground: {
    flex: 1,
  },
  image: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
