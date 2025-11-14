import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Audio } from "expo-av";
import { useNavigation } from "expo-router";
import { Platform } from "react-native";

interface AudioContextValue {
  isPlaying: boolean;
  currentTrack: string | null;
  currentTitle: string | null;
  duration: number;
  position: number;
  isLoading: boolean;
  timer: number | null;
  playSound: (url: string, title: string) => Promise<void>;
  pauseSound: () => Promise<void>;
  stopSound: () => Promise<void>;
  seek: (positionMillis: number) => Promise<void>;
  setTimer: (minutes: number | null) => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const navigation = useNavigation();

  /* ------------------------------------------------------
     STOP SOUND (DESTRUCTION TOTALE)
  ------------------------------------------------------ */
  const stopSound = useCallback(async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (e) {
      console.log("stop error:", e);
    }

    setSound(null);
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTitle(null);
    setDuration(0);
    setPosition(0);
  }, [sound]);

  /* ------------------------------------------------------
     PAUSE
  ------------------------------------------------------ */
  const pauseSound = useCallback(async () => {
    if (!sound) return;
    try {
      await sound.pauseAsync();
      setIsPlaying(false);
    } catch (e) {
      console.log("pause error:", e);
    }
  }, [sound]);

  /* ------------------------------------------------------
     PLAY SOUND (UTILISE TOUJOURS LE MÊME PLAYER)
  ------------------------------------------------------ */
  const playSound = useCallback(
    async (url: string, title: string) => {
      try {
        if (!url) return;

        setIsLoading(true);
        await stopSound();

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, volume: 1.0 },
          (status) => {
            if (!status.isLoaded) return;
            if (!status.isPlaying) setIsPlaying(false);
            else setIsPlaying(true);
            setDuration(status.durationMillis ?? 0);
            setPosition(status.positionMillis ?? 0);
            if (status.didJustFinish) stopSound();
          }
        );

        setSound(newSound);
        setCurrentTrack(url);
        setCurrentTitle(title);
        setIsPlaying(true);
      } catch (e) {
        console.log("play error:", e);
      }

      setIsLoading(false);
    },
    [stopSound]
  );

  /* ------------------------------------------------------
     SEEK (POUR LE SLIDER DU FULLSCREEN)
  ------------------------------------------------------ */
  const seek = useCallback(
    async (positionMillis: number) => {
      if (!sound) return;

      try {
        if (Platform.OS === "web" && sound instanceof HTMLAudioElement) {
          sound.currentTime = positionMillis / 1000;
          setPosition(positionMillis);
        } else {
          await sound.setPositionAsync(positionMillis);
          setPosition(positionMillis);
        }
      } catch (error) {
        console.log("seek error:", error);
      }
    },
    [sound]
  );

  /* ------------------------------------------------------
     STOP AUTOMATIQUE EN CAS DE NAVIGATION
  ------------------------------------------------------ */
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      stopSound();
    });
    return unsub;
  }, [navigation, stopSound]);

  /* ------------------------------------------------------
     CLEANUP FINAL
  ------------------------------------------------------ */
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTitle,
        duration,
        position,
        isLoading,
        timer,
        playSound,
        pauseSound,
        stopSound,
        seek,
        setTimer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
};
