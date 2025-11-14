import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEvent } from "expo";
import { Asset } from "expo-asset";
import { useRouter, useFocusEffect } from "expo-router";
import Slider from "@react-native-community/slider";
import { X, SkipBack, SkipForward, Play, Pause } from "lucide-react-native";

import { soundsConfig } from "@/constants/soundsConfig";
import { useAudio } from "@/contexts/AudioContext";

const { width } = Dimensions.get("window");

async function toVideoSource(src: any): Promise<{ uri: string } | undefined> {
  if (!src) return undefined;

  if (typeof src === "string") return { uri: src };

  if (typeof src === "number") {
    const asset = Asset.fromModule(src);
    await asset.downloadAsync();
    return { uri: asset.localUri ?? asset.uri };
  }

  if (typeof src === "object" && src.uri) {
    return { uri: src.uri };
  }

  return undefined;
}

export default function FullScreenPlayer({
  initialMediaId,
}: {
  initialMediaId: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentMedia, setCurrentMedia] = useState(() => {
    const list = soundsConfig as any[];
    const byId = list.find((m) => m.id === initialMediaId);
    if (byId) return byId;
    return list.find((m) => m.title === initialMediaId) ?? null;
  });

  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>();
  const [showControls, setShowControls] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeoutRef = useRef<any>(null);

  const videoPlayer = useVideoPlayer(videoSource, (player) => {
    if (videoSource) {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  });

  const videoPlayerRef = useRef(videoPlayer);

  const {
    isPlaying,
    duration,
    position,
    playSound,
    pauseSound,
    stopSound,
    seek,
    currentTitle,
  } = useAudio();

  // Sync slider while not dragging
  useEffect(() => {
    if (!isSeeking && duration > 0) {
      setSliderValue(position / duration);
    }
  }, [duration, position, isSeeking]);

  // Hide/show controls
  useEffect(() => {
    if (showControls) {
      fadeAnim.setValue(1);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const cleanup = useCallback(async () => {
    try {
      await stopSound();
    } catch (e) {
      console.log("Stop error:", e);
    }
    try {
      videoPlayerRef.current?.pause();
    } catch (e) {
      console.log("Video stop error:", e);
    }
    setVideoSource(undefined);
  }, [stopSound]);

  const loadMedia = useCallback(async () => {
    if (!currentMedia) return;

    await stopSound();

    try {
      const audioUrl =
        currentMedia.audio ?? currentMedia.frequency ?? currentMedia.sound;

      if (typeof audioUrl === "string" && audioUrl.length > 0) {
        await playSound(audioUrl, currentMedia.title ?? "");
      }

      const videoSrc = await toVideoSource(currentMedia.video);
      setVideoSource(videoSrc);

      setShowControls(true);
    } catch (e) {
      console.log("LOAD MEDIA ERROR:", e);
    }
  }, [currentMedia, playSound, stopSound]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    if (currentMedia) loadMedia();
  }, [currentMedia]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        cleanup();
      };
    }, [cleanup])
  );

  const formatTime = (millis: number) => {
    if (!millis || !isFinite(millis)) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleScreenPress = () => {
    setShowControls((prev) => !prev);
  };

  const handlePlayPause = async () => {
    if (!currentMedia) return;

    if (isPlaying) {
      await pauseSound();
    } else {
      const audioUrl =
        currentMedia.audio ?? currentMedia.frequency ?? currentMedia.sound;

      if (typeof audioUrl === "string" && audioUrl.length > 0) {
        await playSound(audioUrl, currentMedia.title ?? "");
      }
    }

    setShowControls(true);
  };

  const handleStop = async () => {
    await cleanup();
    router.back();
  };

  const handleNext = () => {
    const list = soundsConfig as any[];
    const i = list.findIndex((s) => s.id === currentMedia.id);
    if (i >= 0 && i < list.length - 1) {
      setCurrentMedia(list[i + 1]);
    }
  };

  const handlePrevious = () => {
    const list = soundsConfig as any[];
    const i = list.findIndex((s) => s.id === currentMedia.id);
    if (i > 0) {
      setCurrentMedia(list[i - 1]);
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setShowControls(true);
  };

  const handleSeekComplete = async (value: number) => {
    setIsSeeking(false);
    if (duration <= 0) return;

    const newPosition = value * duration;

    try {
      await seek(newPosition);
    } catch (e) {
      console.log("Seek error:", e);
    }

    try {
      videoPlayerRef.current?.seekTo(newPosition / 1000);
    } catch (e) {
      console.log("Video seek error:", e);
    }
  };

  if (!currentMedia) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
          Média introuvable
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {videoSource && (
        <VideoView
          style={styles.video}
          player={videoPlayer}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
        />
      )}

      <Pressable style={StyleSheet.absoluteFill} onPress={handleScreenPress} />

      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
        pointerEvents={showControls ? "auto" : "none"}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleStop}
            style={styles.iconButton}
            hitSlop={20}
          >
            <X size={26} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title} numberOfLines={1}>
            {currentMedia.title ?? currentTitle ?? "Lecture"}
          </Text>

          <View style={{ width: 26 }} />
        </View>

        <View style={styles.centerContent}>
          <View style={styles.timeline}>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={sliderValue}
              minimumTrackTintColor="#60A5FA"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#fff"
              onSlidingStart={handleSeekStart}
              onSlidingComplete={handleSeekComplete}
              onValueChange={(v) => setSliderValue(v)}
            />
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={styles.smallButton}
            >
              <SkipBack size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playButton}
            >
              {isPlaying ? (
                <Pause size={36} color="#111827" />
              ) : (
                <Play size={36} color="#111827" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} style={styles.smallButton}>
              <SkipForward size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.stopRow}>
            <TouchableOpacity onPress={handleStop} style={styles.stopButton}>
              <X size={32} color="#FEE2E2" />
            </TouchableOpacity>
            <Text style={styles.stopText}>Arrêter</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  video: {
    width,
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.7)",
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
  },
  timeline: {
    marginBottom: 32,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  timeText: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    marginBottom: 32,
  },
  smallButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.7)",
  },
  playButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  stopRow: {
    alignItems: "center",
  },
  stopButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(239,68,68,0.32)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(248,113,113,0.9)",
  },
  stopText: {
    color: "#FEE2E2",
    marginTop: 6,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
