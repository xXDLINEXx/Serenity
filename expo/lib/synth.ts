/**
 * Synthèse audio native : génère de vraies ondes sonores en PCM/WAV,
 * avec un nombre entier de cycles par boucle (pas de clic au raccord)
 * et un fondu microscopique sur les bords.
 * Le web utilise Tone.js directement (voir engine.ts).
 */
import { File, Directory, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';

const SR = 44100;
const EDGE_FADE = 256; // ~6 ms

export interface RenderToneOptions {
  /** Fréquence de l'oreille gauche (ou unique) en Hz */
  freq: number;
  type: WaveType;
  /** Fréquence de l'oreille droite ; si différente de freq → binaural stéréo */
  rightFreq?: number;
  /** Durée de la boucle en secondes (~2 s par défaut) */
  durationSec?: number;
}

function waveSample(type: WaveType, phase: number): number {
  const p = phase - Math.floor(phase);
  switch (type) {
    case 'sine':
      return Math.sin(2 * Math.PI * p);
    case 'square':
      return p < 0.5 ? 1 : -1;
    case 'triangle':
      return 4 * Math.abs(p - 0.5) - 1;
    case 'sawtooth':
      return 2 * p - 1;
  }
}

function encodeWavBytes(channels: Float32Array[], sampleRate: number): Uint8Array {
  const numCh = channels.length;
  const numSamples = channels[0].length;
  const dataSize = numSamples * numCh * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Uint8Array(buf);
}

const renderedUris = new Map<string, string>();

/** Rend (et met en cache) un fichier WAV dans le cache de l'app, renvoie son URI. */
export async function renderToneFile(opts: RenderToneOptions): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('renderToneFile est réservé au natif ; le web utilise Tone.js');
  }

  const key = `t${opts.freq}_${opts.type}_${opts.rightFreq ?? 0}`;
  const cached = renderedUris.get(key);
  if (cached) return cached;

  const T = opts.durationSec ?? 2;
  const fL = Math.min(20000, Math.max(1, opts.freq));
  const fR = Math.min(20000, Math.max(1, opts.rightFreq ?? opts.freq));

  // Nombre entier de cycles → la boucle se raccorde sans clic.
  const cyclesL = Math.max(1, Math.round(fL * T));
  const cyclesR = Math.max(1, Math.round(fR * T));
  const duration = Math.max(cyclesL / fL, cyclesR / fR);
  const n = Math.ceil(duration * SR);

  const binaural = fR !== fL;
  const left = new Float32Array(n);
  const right = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let l = waveSample(opts.type, t * fL);
    let r = waveSample(opts.type, t * fR);
    // Fondu d'entrée/sortie pour masquer le léger décalage binaural.
    const edge = Math.min(i, n - 1 - i);
    if (edge < EDGE_FADE) {
      const g = edge / EDGE_FADE;
      l *= g;
      r *= g;
    }
    left[i] = l;
    right[i] = r;
  }

  const bytes = encodeWavBytes(binaural ? [left, right] : [left], SR);

  try {
    const dir = new Directory(Paths.cache, 'serenity-tones');
    if (!dir.exists) dir.create({ idempotent: true });

    const file = new File(dir, `${key}.wav`);
    if (!file.exists) file.create();
    file.writeSync(bytes);
    const uri = file.uri;
    renderedUris.set(key, uri);
    return uri;
  } catch (error) {
    console.error('[Synth] Erreur d écriture WAV :', error);
    throw error;
  }
}
