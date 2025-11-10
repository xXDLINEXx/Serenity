// app/player.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Play,
  Pause,
  X,
  Clock,
} from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { sleepSounds, SleepSound } from '@/constants/sleepSounds';
import { healingFrequencies, HealingFrequency } from '@/constants/frequencies';
import {
  getAudioSource,
  getVideoSource,
  getFrequencySource,
} from '../utils/tryRequire';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const audio = useAudio();

  const soundId = params.id as string;
  const type = params.type as 'sound' | 'frequency';

  const item: SleepSound | HealingFrequency | undefined =
    type === 'sound'
      ? sleepSounds.find((s) => s.id === soundId)
      : healingFrequencies.find((f) => f.id === soundId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    rotateLoop.start();
    pulseLoop.start();

    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const handleBack = async () => {
    await audio.stopSound();
    router.back();
  };

  const handlePlayPause = async () => {
    if (!item) return;
    let source: any;

    try {
      if (type === 'sound') source = getAudioSource(soundId);
      else if (type === 'frequency') source = getFrequencySource(soundId);
      else source = getVideoSource(soundId);
    } catch (err) {
      console.warn('[PlayerScreen] Media introuvable pour :', soundId);
      return;
    }

    if (!source) return;
    const title = item.title || '';

    if (audio.currentTrack === soundId && audio.isPlaying) {
      await audio.pauseSound();
    } else {
      await audio.playSound(source, title);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Son introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={28} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lecture en cours</Text>
          <View style={styles.placeholder} />
        </View>

        <Animated.View style={[styles.visualContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={[styles.iconCircle, { transform: [{ rotate }, { scale: pulseAnim }] }]}>
            <Text style={styles.iconText}>{item.title[0]}</Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          {'frequency' in item && (
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>{item.frequency} Hz</Text>
            </View>
          )}
        </View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
            {audio.isPlaying ? (
              <Pause size={48} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={48} color="#FFF" fill="#FFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.stopButton} onPress={handleBack}>
            <X size={32} color="#FFF" strokeWidth={2.5} />
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        {audio.timer && (
          <View style={styles.timerIndicator}>
            <Clock size={16} color="#FFF" />
            <Text style={styles.timerText}>{audio.timer} min</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  visualContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { color: '#FFF', fontSize: 40, fontWeight: '800' },
  infoContainer: { alignItems: 'center', marginTop: 12 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  frequencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  frequencyText: { color: '#FFF', fontSize: 14 },
  controls: { alignItems: 'center', marginTop: 20 },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stopButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stopButtonText: { color: '#FFF', fontWeight: '600' },
  timerIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  timerText: { color: '#FFF', marginLeft: 6 },
});

