import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SoundList } from '@/components/SoundList';
import { SoundPlayer } from '@/components/SoundPlayer';
import { SoundConfig } from '@/types/soundsConfig';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSound, setSelectedSound] = useState<SoundConfig | null>(null);

  const handleClose = () => {
    setSelectedSound(null);
  };

  if (selectedSound) {
    return <SoundPlayer sound={selectedSound} onClose={handleClose} />;
  }

  return (
    <View style={styles.container} testID="home-screen">
      <View style={{ backgroundColor: '#000000', height: insets.top }} />
      <StatusBar barStyle="light-content" />
      <SoundList onSelectSound={setSelectedSound} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
