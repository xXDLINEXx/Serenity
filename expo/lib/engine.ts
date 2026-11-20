/**
 * Moteur audio Serenity — singleton qui gère :
 * - le générateur de fréquences (1 – 20 000 Hz, 4 formes d'onde),
 * - les battements binauraux stéréo (une fréquence par oreille),
 * - le mixeur multi-sons à volumes indépendants,
 * - le volume général, la minuterie et le fondu de fin.
 *
 * Natif : synthèse WAV (lib/synth.ts) jouée en boucle via expo-av.
 * Web   : oscillateurs Tone.js en temps réel.
 */
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

type Sound = InstanceType<typeof Audio.Sound>;
import { renderToneFile, type WaveType } from './synth';
import { trackSession } from './storage';

export type EngineKind = 'tone' | 'binaural' | 'mixer';

export interface ToneState {
  freq: number;
  type: WaveType;
  volume: number;
  /** Écart fréquentiel binaural en Hz ; null = tonalité simple */
  beat: number | null;
  playing: boolean;
}

interface WebVoice {
  osc: { frequency: { value: number }; type: string; start: (t?: number) => void; stop: () => void; dispose: () => void };
  gain: { gain: { value: number; rampTo: (v: number, t: number) => void } };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
class SerenityEngine {
  // ---- Voix tonale (générateur + binaural) ----
  private toneState: ToneState = { freq: 528, type: 'sine', volume: 0.7, beat: null, playing: false };
  private toneSound: Sound | null = null;
  private webVoices: WebVoice[] = [];
  private toneStartAt: number | null = null;

  // ---- Mixeur ----
  private channels = new Map<string, { sound: Sound; volume: number }>();

  // ---- Master, minuterie, fondu ----
  private master = 1;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private timerEndAt = 0;
  private fadeSec = 0;
  onTimerEnd: (() => void) | null = null;

  private changeListeners = new Set<() => void>();

  notifyChanges() {
    this.changeListeners.forEach(l => l());
  }
  subscribe(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  async init() {
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      }
    } catch (error) {
      console.warn('[Engine] Audio mode :', error);
    }
  }

  // ============ GÉNÉRATEUR / BINAURAL ============

  getToneState(): ToneState {
    return { ...this.toneState };
  }

  async startTone(cfg: { freq: number; type?: WaveType; volume?: number; beat?: number | null }) {
    this.toneState = {
      ...this.toneState,
      freq: cfg.freq,
      type: cfg.type ?? this.toneState.type,
      volume: cfg.volume ?? this.toneState.volume,
      beat: cfg.beat !== undefined ? cfg.beat : this.toneState.beat,
    };
    await this.loadToneVoice();
    this.toneStartAt = Date.now();
    this.notifyChanges();
  }

  async updateTone(partial: Partial<Pick<ToneState, 'freq' | 'type' | 'volume' | 'beat'>>) {
    const prev = this.toneState;
    const next = { ...prev, ...partial };
    this.toneState = next;

    if (!next.playing) {
      this.notifyChanges();
      return;
    }

    const audioChanged =
      next.freq !== prev.freq || next.type !== prev.type || next.beat !== prev.beat;

    if (audioChanged) {
      await this.loadToneVoice();
    } else if (next.volume !== prev.volume) {
      await this.applyToneVolume();
    }
    this.notifyChanges();
  }

  async stopTone() {
    this.flushSession();
    if (Platform.OS === 'web') {
      this.webVoices.forEach(v => {
        try {
          v.osc.stop();
          v.osc.dispose();
        } catch {}
      });
      this.webVoices = [];
    } else if (this.toneSound) {
      const s = this.toneSound;
      this.toneSound = null;
      try { await s.stopAsync(); } catch {}
      try { await s.unloadAsync(); } catch {}
    }
    this.toneState.playing = false;
    this.toneStartAt = null;
    this.notifyChanges();
  }

  private async loadToneVoice() {
    const { freq, type, beat, volume } = this.toneState;
    this.flushSession();

    if (Platform.OS === 'web') {
      await this.startWebVoice(freq, beat, type, volume);
    } else {
      const old = this.toneSound;
      this.toneSound = null;
      if (old) {
        try { await old.stopAsync(); } catch {}
        try { await old.unloadAsync(); } catch {}
      }
      try {
        const uri = await renderToneFile({
          freq,
          type,
          rightFreq: beat != null ? freq + beat : undefined,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { isLooping: true, volume: Math.min(1, volume * this.master), shouldPlay: true }
        );
        this.toneSound = sound;
      } catch (error) {
        console.error('[Engine] Erreur de lecture tonale :', error);
      }
    }
    this.toneState.playing = true;
    this.toneStartAt = Date.now();
    this.notifyChanges();
  }

  private async startWebVoice(freq: number, beat: number | null, type: WaveType, volume: number) {
    const Tone = await import('tone');
    await Tone.start();
    this.webVoices.forEach(v => {
      try { v.osc.stop(); v.osc.dispose(); } catch {}
    });
    this.webVoices = [];

    const makeVoice = (f: number, pan: number): WebVoice => {
      const osc = new (Tone as any).Oscillator(f, type);
      const panner = new (Tone as any).Panner(pan).toDestination();
      const gain = new (Tone as any).Gain(Math.min(1, volume * this.master)).connect(panner);
      osc.connect(gain as any);
      osc.start();
      return { osc, gain } as unknown as WebVoice;
    };

    if (beat != null) {
      this.webVoices.push(makeVoice(freq, -1));
      this.webVoices.push(makeVoice(freq + beat, 1));
    } else {
      this.webVoices.push(makeVoice(freq, 0));
    }
  }

  private async applyToneVolume() {
    const v = Math.min(1, this.toneState.volume * this.master);
    if (Platform.OS === 'web') {
      this.webVoices.forEach(vv => vv.gain.gain.rampTo(v, 0.05));
    } else if (this.toneSound) {
      try { await this.toneSound.setVolumeAsync(v); } catch {}
    }
  }

  // ============ MIXEUR ============

  isActive(id: string): boolean {
    return this.channels.has(id);
  }
  getChannelVolume(id: string): number {
    return this.channels.get(id)?.volume ?? 0;
  }
  activeChannelIds(): string[] {
    return [...this.channels.keys()];
  }

  async addChannel(id: string, uri: number | { uri: string }, volume: number, title: string) {
    const existing = this.channels.get(id);
    if (existing) {
      existing.volume = volume;
      await this.applyChannelVolume(id);
      this.notifyChanges();
      return;
    }
    try {
      const source = typeof uri === 'number'
        ? { uri: (await AssetUri(uri)) }
        : uri;
      const { sound } = await Audio.Sound.createAsync(
        source as any,
        { isLooping: true, volume: Math.min(1, volume * this.master), shouldPlay: true }
      );
      this.channels.set(id, { sound, volume });
      if (this.channels.size === 1) this.toneStartAt ??= null;
      trackSession(id, title, 'mixer'); // séance enregistrée à l'ajout
      this.notifyChanges();
    } catch (error) {
      console.error('[Engine] Impossible de jouer', id, error);
    }
  }

  async setChannelVolume(id: string, volume: number) {
    const ch = this.channels.get(id);
    if (!ch) return;
    ch.volume = volume;
    await this.applyChannelVolume(id);
    this.notifyChanges();
  }

  async removeChannel(id: string) {
    const ch = this.channels.get(id);
    if (!ch) return;
    this.channels.delete(id);
    try { await ch.sound.stopAsync(); } catch {}
    try { await ch.sound.unloadAsync(); } catch {}
    this.notifyChanges();
  }

  async toggleChannel(id: string, uri: number | { uri: string }, volume: number, title: string) {
    if (this.channels.has(id)) await this.removeChannel(id);
    else await this.addChannel(id, uri, volume, title);
  }

  async stopAllChannels() {
    const ids = [...this.channels.keys()];
    for (const id of ids) await this.removeChannel(id);
  }

  channelCount(): number {
    return this.channels.size;
  }

  private async applyChannelVolume(id: string) {
    const ch = this.channels.get(id);
    if (!ch) return;
    try { await ch.sound.setVolumeAsync(Math.min(1, ch.volume * this.master)); } catch {}
  }

  // ============ MASTER / MINUTERIE / FONDU ============

  async setMaster(v: number) {
    this.master = Math.max(0, Math.min(1, v));
    await this.applyToneVolume();
    for (const id of this.channels.keys()) await this.applyChannelVolume(id);
    this.notifyChanges();
  }

  getMaster(): number {
    return this.master;
  }

  /** Minuterie : stoppe tout après `minutes`, avec fondu de `fadeSec` secondes. */
  startTimer(minutes: number, fadeSec: number) {
    this.cancelTimer();
    this.fadeSec = fadeSec;
    this.timerEndAt = Date.now() + minutes * 60_000;
    this.timerInterval = setInterval(() => {
      const remainingMs = this.timerEndAt - Date.now();
      if (remainingMs <= 0) {
        this.cancelTimer();
        void this.stopEverything();
        this.onTimerEnd?.();
        return;
      }
      if (this.fadeSec > 0 && remainingMs < this.fadeSec * 1000) {
        const factor = remainingMs / (this.fadeSec * 1000);
        void this.setMaster(this.masterBase * factor);
      }
    }, 500);
    this.notifyChanges();
  }

  private masterBase = 1;

  cancelTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.timerEndAt = 0;
    this.notifyChanges();
  }

  isTimerRunning(): boolean {
    return this.timerInterval != null;
  }

  timerRemainingSec(): number {
    if (!this.isTimerRunning()) return 0;
    return Math.max(0, Math.round((this.timerEndAt - Date.now()) / 1000));
  }

  /** Démarre la minuterie en mémorisant le volume master actuel. */
  startTimerFromCurrentMaster(minutes: number, fadeSec: number) {
    this.masterBase = this.master > 0.02 ? this.master : 1;
    this.startTimer(minutes, fadeSec);
  }

  async stopEverything() {
    await this.stopTone();
    await this.stopAllChannels();
    await this.setMaster(this.masterBase || 1);
    this.cancelTimer();
  }

  // ---- suivi de séance (générateur / binaural) ----
  private flushSession() {
    if (this.toneStartAt != null) {
      const kind: EngineKind = this.toneState.beat != null ? 'binaural' : 'tone';
      const seconds = Math.round((Date.now() - this.toneStartAt) / 1000);
      if (seconds > 0) trackSession(kind === 'tone' ? `tone-${this.toneState.freq}` : 'binaural', kind === 'tone' ? `${this.toneState.freq} Hz` : 'Battement binaural', kind, seconds);
      this.toneStartAt = null;
    }
  }
}

/** Résout un require() local en URI jouable. */
async function AssetUri(module: number): Promise<string> {
  const { Asset } = await import('expo-asset');
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  return asset.uri;
}

export const engine = new SerenityEngine();
