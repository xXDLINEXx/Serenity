import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { Asset } from "expo-asset";
import Slider from "@react-native-community/slider";
import { X, SkipBack, SkipForward, Play, Pause } from "lucide-react-native";

import { soundsConfig } from "@/constants/soundsConfig";
import { useAudio } from "@/contexts/AudioContext";

const { width } = Dimensions.get("window");

type FullScreenPlayerProps = {
  initialMediaId: string;
};

type MediaItem = {
  id: string;
  title: string;
  audio?: string | number | { uri: string };
  frequency?: string;
  sound?: string;
  video?: string | number | { uri: string };
};

async function toVideoSource(
  src: string | number | { uri: string } | undefined
): Promise<{ uri: string } | undefined> {
  if (!src) return undefined;

  if (typeof src === "string") {
    return { uri: src };
  }

  if (typeof src === "number") {
    const asset = Asset.fromModule(src);
    await asset.downloadAsync();
    return { uri: asset.localUri ?? asset.uri };
  }

  if (typeof src === "object" && typeof src.uri === "string") {
    return { uri: src.uri };
  }

  return undefined;
}

export default function FullScreenPlayer({
  initialMediaId,
}: FullScreenPlayerProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(() => {
    const list = soundsConfig as MediaItem[];

    const byId = list.find((m) => m.id === initialMediaId);
    if (byId) return byId;

    const byTitle = list.find((m) => m.title === initialMediaId);
    return byTitle ?? null;
  });

  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>();
  const [showControls, setShowControls] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoPlayer = useVideoPlayer(videoSource, (player) => {
    if (videoSource) {
      player.loop = true;
      player.muted = true; // 🔇 la vidéo ne joue PAS de son
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

  // --- Sync du slider avec l’audio ---
  useEffect(() => {
    if (!isSeeking && duration > 0) {
      setSliderValue(position / duration);
    }
  }, [duration, position, isSeeking]);

  // --- Auto-hide des contrôles ---
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
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, fadeAnim]);

  // --- Nettoyage global (son + vidéo) ---
  const cleanup = useCallback(async () => {
    try {
      await stopSound();
    } catch (e) {
      console.log("[FullScreenPlayer] stopSound error:", e);
    }

    try {
      videoPlayerRef.current?.pause();
    } catch (e) {
      console.log("[FullScreenPlayer] video pause error:", e);
    }

    setVideoSource(undefined);
  }, [stopSound]);

  // --- Chargement du média courant (audio + vidéo) ---
  const loadMedia = useCallback(async () => {
    if (!currentMedia) return;

    await stopSound();

    try {
      const rawAudio =
        (currentMedia.audio as string | undefined) ??
        (currentMedia.frequency as string | undefined) ??
        (currentMedia.sound as string | undefined);

      if (rawAudio && rawAudio.length > 0) {
        await playSound(rawAudio, currentMedia.title ?? "");
      }

      const vid = await toVideoSource(currentMedia.video);
      setVideoSource(vid);

      setShowControls(true);
    } catch (e) {
      console.log("[FullScreenPlayer] loadMedia error:", e);
    }
  }, [currentMedia, playSound, stopSound]);

  // 1er load
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Quand on change de média (next/prev)
  useEffect(() => {
    if (currentMedia) {
      loadMedia();
    }
  }, [currentMedia, loadMedia]);

  // Cleanup quand on quitte l’écran (back / navigation)
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
      const rawAudio =
        (currentMedia.audio as string | undefined) ??
        (currentMedia.frequency as string | undefined) ??
        (currentMedia.sound as string | undefined);

      if (rawAudio && rawAudio.length > 0) {
        await playSound(rawAudio, currentMedia.title ?? "");
      }
    }

    setShowControls(true);
  };

  const handleStop = async () => {
    await cleanup();
    router.back();
  };

  const handleNext = () => {
    const list = soundsConfig as MediaItem[];
    if (!currentMedia) return;
    const index = list.findIndex((s) => s.id === currentMedia.id);
    if (index >= 0 && index < list.length - 1) {
      setCurrentMedia(list[index + 1]);
    }
  };

  const handlePrevious = () => {
    const list = soundsConfig as MediaItem[];
    if (!currentMedia) return;
    const index = list.findIndex((s) => s.id === currentMedia.id);
    if (index > 0) {
      setCurrentMedia(list[index - 1]);
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
      console.log("[FullScreenPlayer] seek error:", e);
    }

    try {
      videoPlayerRef.current?.seekTo(newPosition / 1000);
    } catch (e) {
      console.log("[FullScreenPlayer] videoSeek error:", e);
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
