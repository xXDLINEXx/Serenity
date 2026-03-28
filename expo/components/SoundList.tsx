import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SoundConfig } from '@/types/soundsConfig';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 600;

interface SoundListProps {
  onSelectSound: (sound: SoundConfig) => void;
}

interface SoundCardData {
  title: string;
  description: string;
  image: string;
  type: 'sound';
  audioUrl: string;
}

const soundData: SoundCardData[] = [
  {
    title: 'Night Ambience',
    description: 'Peaceful nighttime sounds',
    image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_4084f339d5.mp3',
  },
  {
    title: 'Meditation Bells',
    description: 'Calming bell tones',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  },
  {
    title: 'Gentle Rain',
    description: 'Soothing rainfall ambience',
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8a0fc0e14.mp3',
  },
  {
    title: 'Ocean Waves',
    description: 'Rhythmic ocean sounds',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/06/07/audio_9d87e5a3ff.mp3',
  },
  {
    title: 'Forest Night',
    description: 'Nature sounds and crickets',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_4084f339d5.mp3',
  },
  {
    title: 'Calm Wind',
    description: 'Soft breeze through trees',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_b32a6f8a8b.mp3',
  },
  {
    title: 'Distant Thunder',
    description: 'Gentle storm ambience',
    image: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/01/18/audio_f5a24c9b0f.mp3',
  },
  {
    title: 'Mountain Stream',
    description: 'Flowing water sounds',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    type: 'sound',
    audioUrl: 'https://cdn.pixabay.com/audio/2024/01/30/audio_bba788e9f2.mp3',
  },
];

export function SoundList({ onSelectSound }: SoundListProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
      pagingEnabled={false}
      snapToInterval={CARD_HEIGHT + 20}
      decelerationRate="fast"
    >
      {soundData.map((sound, index) => (
        <SoundCard
          key={index}
          sound={sound}
          onPress={() => onSelectSound(sound)}
        />
      ))}
    </ScrollView>
  );
}

function SoundCard({
  sound,
  onPress,
}: {
  sound: SoundCardData;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
      testID={`sound-${sound.title}`}
    >
      <ImageBackground
        source={{ uri: sound.image }}
        style={styles.cardBackground}
        imageStyle={styles.cardImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{sound.title}</Text>
            <Text style={styles.cardDescription}>{sound.description}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
  },
  card: {
    width: width - 32,
    height: CARD_HEIGHT,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    borderRadius: 24,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 28,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  cardDescription: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

});