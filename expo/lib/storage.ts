/**
 * Persistance locale (favoris, historique, séances, préférences)
 * via zustand + AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type HistoryKind = 'tone' | 'binaural' | 'mixer' | 'ambient';

export interface HistoryEntry {
  id: string;
  title: string;
  kind: HistoryKind;
  at: number; // timestamp
  seconds?: number;
}

export interface SavedConfig {
  id: string;
  name: string;
  freq: number;
  type: 'sine' | 'square' | 'triangle' | 'sawtooth';
  beat: number | null;
  volume: number;
  at: number;
}

export interface Settings {
  defaultVolume: number;
  fadeSec: number;
  dim: number; // 0–0.6 : assombrissement de l'écran
  reducedAnimations: boolean;
}

interface SerenityStore {
  favorites: string[];
  history: HistoryEntry[];
  savedConfigs: SavedConfig[];
  settings: Settings;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  pushHistory: (entry: Omit<HistoryEntry, 'at'>) => void;
  clearHistory: () => void;
  saveConfig: (cfg: Omit<SavedConfig, 'id' | 'at'>) => void;
  removeConfig: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

export const useSerenityStore = create<SerenityStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      savedConfigs: [],
      settings: { defaultVolume: 0.7, fadeSec: 30, dim: 0, reducedAnimations: false },

      toggleFavorite: (id) =>
        set(s => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter(f => f !== id)
            : [id, ...s.favorites],
        })),

      isFavorite: (id) => get().favorites.includes(id),

      pushHistory: (entry) =>
        set(s => {
          const withTime: HistoryEntry = { ...entry, at: Date.now() };
          // Fusionne les entrées consécutives identiques (évite de polluer l'historique)
          const [last, ...rest] = s.history;
          if (last && last.id === entry.id && Date.now() - last.at < 60_000) {
            return { history: [{ ...last, at: withTime.at }, ...rest] };
          }
          return { history: [withTime, ...s.history].slice(0, 100) };
        }),

      clearHistory: () => set({ history: [] }),

      saveConfig: (cfg) =>
        set(s => ({
          savedConfigs: [
            { ...cfg, id: `cfg-${Date.now()}`, at: Date.now() },
            ...s.savedConfigs,
          ].slice(0, 30),
        })),

      removeConfig: (id) =>
        set(s => ({ savedConfigs: s.savedConfigs.filter(c => c.id !== id) })),

      updateSettings: (patch) =>
        set(s => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: 'serenity-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Enregistre une séance lancée (appelé par le moteur audio). */
export function trackSession(id: string, title: string, kind: HistoryKind, seconds?: number) {
  useSerenityStore.getState().pushHistory({ id, title, kind, seconds });
}
