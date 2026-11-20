/** Presets de fréquences solfégiques (sans allégation thérapeutique). */
export interface FrequencyPreset {
  freq: number;
  name: string;
  note: string;
}

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
  { freq: 174, name: '174 Hz', note: 'Détente' },
  { freq: 285, name: '285 Hz', note: 'Régénération' },
  { freq: 396, name: '396 Hz', note: 'Libération' },
  { freq: 417, name: '417 Hz', note: 'Changement' },
  { freq: 528, name: '528 Hz', note: 'Transformation' },
  { freq: 639, name: '639 Hz', note: 'Harmonie' },
  { freq: 741, name: '741 Hz', note: 'Expression' },
  { freq: 852, name: '852 Hz', note: 'Intuition' },
  { freq: 963, name: '963 Hz', note: 'Élévation' },
];

export interface BrainwavePreset {
  id: string;
  name: string;
  beat: number; // écart fréquentiel en Hz
  note: string;
}

export const BRAINWAVES: BrainwavePreset[] = [
  { id: 'delta', name: 'Delta', beat: 2, note: 'Sommeil profond · 0,5–4 Hz' },
  { id: 'theta', name: 'Thêta', beat: 6, note: 'Méditation · 4–8 Hz' },
  { id: 'alpha', name: 'Alpha', beat: 10, note: 'Calme éveillé · 8–13 Hz' },
  { id: 'beta', name: 'Bêta', beat: 18, note: 'Concentration · 13–30 Hz' },
  { id: 'gamma', name: 'Gamma', beat: 40, note: 'Vigilance élevée · 30–100 Hz' },
];

export const WAVEFORM_LABELS: Record<string, string> = {
  sine: 'Sinusoïde',
  square: 'Carrée',
  triangle: 'Triangulaire',
  sawtooth: 'Dent de scie',
};

export const TIMER_OPTIONS = [15, 30, 45, 60, 90];
