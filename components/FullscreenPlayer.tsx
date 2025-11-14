// --- FullScreenPlayer.tsx (VERSION CORRIGÉE) ---

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Audio } from 'expo-av';
import { useRouter, useFocusEffect } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { X, SkipForward, SkipBack, Play, Pause } from 'lucide-react-native';
import { soundsConfig } from '@/constants/soundsConfig';
import { Asset } from 'expo-asset';
import { useEvent } from 'expo';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

const formatTime = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

async function toSourceAsync(src) {
  if (!src) return undefined;

  if (typeof src === 'number') {
    const asset = Asset.fromModule(src);
    await asset.downloadAsync();
    return { uri: asset.uri };
  }

  if (typeof src === 'string') return { uri: src };
  if (typeof src === 'object' && src.uri) return src;

  return undefined;
}

export function FullScreenPlayer({ initialMediaId }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentMedia, setCurrentMedia] = useState(() =>
    soundsConfig.find(m => m.id === initialMediaId)
  );
  const [showControls, setShowControls] = useState(true);
  const [videoSource, setVideoSource] = useState(undefined);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const soundRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeoutRef = useRef(null);
  const isCleaningUpRef = useRef(false);

  const videoPlayer = useVideoPlayer(videoSource, player => {
    if (videoSource) {
      player.loop = true;
      player.muted = true;
      player.timeUpdateEventInterval = 0.3;
      player.play();
    }
  });
  const videoPlayerRef = useRef(videoPlayer);

  const { isPlaying } = useEvent(videoPlayer, "playingChange", {
    isPlaying: videoPlayer?.playing ?? false
  });
  const { currentTime = 0 } = useEvent(videoPlayer, "timeUpdate", {
    currentTime: videoPlayer?.currentTime ?? 0
  });

  const duration = videoPlayer?.duration ?? 0;

  // === Sync Slider ===
  useEffect(() => {
    if (!isSeeking) setSliderValue(currentTime);
  }, [currentTime, isSeeking]);

  // === Full Setup ===
  useEffect(() => {
    loadMedia();

    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      SystemUI.setBackgroundColorAsync('transparent');
    }

    return () => {
      if (Platform.OS === 'android')
        NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        cleanup();
      };
    }, [])
  );

  useEffect(() => {
    videoPlayerRef.current = videoPlayer;
  }, [videoPlayer]);

  useEffect(() => {
    if (currentMedia) loadMedia();
  }, [currentMedia?.id]);

  // === Auto-hide Controls ===
  useEffect(() => {
    if (showControls) {
      fadeAnim.setValue(1);

      if (controlsTimeoutRef.current)
        clearTimeout(controlsTimeoutRef.current);

      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }

    return () => {
      if (controlsTimeoutRef.current)
        clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls]);

  const handleScreenPress = () => setShowControls(prev => !prev);

  // ===========================================================
  // 🔥 REAL FIX: CLEANUP AUDIO CORRECTLY + NO DOUBLE-PLAY
  // ===========================================================
  const cleanup = async () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    // STOP AUDIO
    if (soundRef.current) {
      const s = soundRef.current;
      soundRef.current = null;

      try { await s.setIsLoopingAsync(false); } catch (_) {}
      try { await s.pauseAsync(); } catch (_) {}
      try { await s.stopAsync(); } catch (_) {}
      try { await s.unloadAsync(); } catch (_) {}

      console.log("AUDIO CLEANED ✔");
    }

    // Stop video
    try {
      if (videoPlayerRef.current) videoPlayerRef.current.pause();
    } catch (_) {}

    setVideoSource(undefined);
    isCleaningUpRef.current = false;
  };

  // ===========================================================
  // 🔥 REAL FIX: SOUND MUST PLAY *ONCE* ONLY
  // ===========================================================
  const loadMedia = async () => {
    await cleanup();
    setIsLoadingVideo(true);

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      // Load audio
      const audioSource = await toSourceAsync(currentMedia.audio);
      const { sound } = await Audio.Sound.createAsync(audioSource, {
        isLooping: true,
        volume: 1.0,
        shouldPlay: false  // IMPORTANT: NO AUTO-PLAY
      });

      soundRef.current = sound;
      await sound.playAsync();    // ONLY ONE PLAY

      // Video
      const videoAsset = await toSourceAsync(currentMedia.video);
      if (videoAsset) setVideoSource({ uri: videoAsset.uri });

      setIsLoadingVideo(false);
      setShowControls(true);

    } catch (e) {
      console.error("LOAD ERROR:", e);
      setIsLoadingVideo(false);
    }
  };

  // === Buttons ===

  const handleStop = async () => {
    await cleanup();
    router.back();
  };

  const handleNext = () => {
    const idx = soundsConfig.findIndex(s => s.id === currentMedia.id);
    if (idx < soundsConfig.length - 1) setCurrentMedia(soundsConfig[idx + 1]);
  };

  const handlePrevious = () => {
    const idx = soundsConfig.findIndex(s => s.id === currentMedia.id);
    if (idx > 0) setCurrentMedia(soundsConfig[idx - 1]);
  };

  const handlePlayPause = async () => {
    const s = soundRef.current;

    if (isPlaying) {
      videoPlayerRef.current?.pause();
      await s.pauseAsync();
    } else {
      videoPlayerRef.current?.play();
      await s.playAsync();
    }
  };

  const handleSeekComplete = async value => {
    const position = value;

    if (videoPlayerRef.current)
      videoPlayerRef.current.currentTime = position;

    if (soundRef.current)
      await soundRef.current.setPositionAsync(position * 1000);

    setIsSeeking(false);
  };

  if (!currentMedia)
    return <View><Text>Erreur</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar hidden translucent />

      {videoSource && (
        <VideoView
          style={styles.video}
          player={videoPlayer}
          nativeControls={false}
          contentFit="cover"
        />
      )}

      <Pressable style={StyleSheet.absoluteFill} onPress={handleScreenPress} />

      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
        pointerEvents={showControls ? "auto" : "none"}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>{currentMedia.title}</Text>
              <Text style={styles.description}>{currentMedia.description}</Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={handleStop}>
              <X size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Controls */}
        <View style={[styles.controls, { paddingBottom: insets.bottom + 32 }]}>
          {/* Slider */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(sliderValue)}</Text>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={sliderValue}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#fff"
              onSlidingStart={() => setIsSeeking(true)}
              onValueChange={v => setSliderValue(v)}
              onSlidingComplete={handleSeekComplete}
            />

            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
              <SkipBack size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
              {isPlaying ? (
                <Pause size={32} color="#fff" />
              ) : (
                <Play size={32} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
              <SkipForward size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.stopRow}>
            <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={handleStop}>
              <X size={40} color="#fff" />
              <Text style={styles.stopText}>STOP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width, height },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between'
  },
  header: { paddingHorizontal: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  description: { fontSize: 16, color: '#fff' },
  closeButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center'
  },
  controls: { paddingHorizontal: 24 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  slider: { flex: 1 },
  timeText: { color: '#fff', width: 45, textAlign: 'center' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20
  },
  controlButton: {
    width: 72, height: 72,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)'
  },
  stopRow: { alignItems: 'center' },
  stopButton: {
    width: 96, height: 96,
    backgroundColor: 'rgba(239,68,68,0.4)',
    borderRadius: 48,
    borderColor: 'rgba(239,68,68,0.6)',
    justifyContent: 'center', alignItems: 'center'
  },
  stopText: { color: '#fff', fontWeight: 'bold', marginTop: 4 }
});
