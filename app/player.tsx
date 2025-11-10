import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play, Pause, X, Clock } from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { sleepSounds } from '@/constants/sleepSounds';
import { healingFrequencies } from '@/constants/frequencies';
import { getAudioSource, getFrequencySource } from '../utils/tryRequire';

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const audio = useAudio();

  const soundId = params.id as string;
  const type = params.type as 'sound' | 'frequency';

  const item =
    type === 'sound'
      ? sleepSounds.find((s) => s.id === soundId)
      : healingFrequencies.find((f) => f.id === soundId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })
    );

    rotateLoop.start();
    return () => rotateLoop.stop();
  }, []);

  const handleBack = async () => {
    await audio.stopSound();
    router.back();
  };

  const handlePlayPause = async () => {
    if (!item) return;

    let source;
    try {
      source = type === 'sound' ? getAudioSource(item.id) : getFrequencySource(item.id);
    } catch (err) {
      console.warn('Fichier non trouvé :', item.id);
      return;
    }

    const title = item.title || '';

    if (audio.currentTrack === item.id && audio.isPlaying) {
      await audio.pauseSound();
    } else {
      await audio.playSound(source, title);
    }
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Son non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1f1c2c', '#928DAB']} style={styles.gradient}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lecture en cours</Text>
          <View style={{ width: 28 }} />
        </View>

        <Animated.View style={[styles.iconCircle, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>{item.title}</Text>
          {'frequency' in item && <Text style={styles.frequency}>{item.frequency} Hz</Text>}
        </Animated.View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
            {audio.isPlaying ? <Pause size={48} color="#fff" /> : <Play size={48} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.stopButton} onPress={handleBack}>
            <X size={32} color="#fff" />
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        {audio.timer && (
          <View style={styles.timerIndicator}>
            <Clock size={16} color="#fff" />
            <Text style={styles.timerText}>{audio.timer} min</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  frequency: { color: '#aaa', fontSize: 14 },
  iconCircle: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  controls: { alignItems: 'center' },
  controlButton: { marginBottom: 16 },
  stopButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stopButtonText: { color: '#fff', fontSize: 16 },
  timerIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  timerText: { color: '#fff' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 50 },
});
