import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SoundList } from '@/components/SoundList';
import { SoundPlayer } from '@/components/SoundPlayer';
import { SoundConfig } from '@/types/soundsConfig';

export default function LocalPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSound, setSelectedSound] = useState<SoundConfig | null>(null);

  const handleClose = () => {
    setSelectedSound(null);
  };

  const handleBack = () => {
    router.back();
  };

  if (selectedSound) {
    return <SoundPlayer sound={selectedSound} onClose={handleClose} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0A0F', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            testID="back-button"
          >
            <ArrowLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Serenity Local</Text>
            <Text style={styles.headerSubtitle}>Sons & Fréquences offline</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <SoundList onSelectSound={setSelectedSound} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400' as const,
  },
  placeholder: {
    width: 44,
  },
});
