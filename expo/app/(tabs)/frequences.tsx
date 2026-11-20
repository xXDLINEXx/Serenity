import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Play, Square, Headphones, Save, Trash2, Info, Timer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/lib/theme';
import { engine } from '@/lib/engine';
import { useSerenityStore } from '@/lib/storage';
import { FREQUENCY_PRESETS, BRAINWAVES, WAVEFORM_LABELS, TIMER_OPTIONS } from '@/lib/frequencies';
import type { WaveType } from '@/lib/synth';

const MAX_HZ = 20000;
const LOG_MAX = Math.log10(MAX_HZ);

const freqToSlider = (f: number) => Math.log10(f) / LOG_MAX;
const sliderToFreq = (v: number) => {
  const f = Math.pow(10, v * LOG_MAX);
  return f >= 100 ? Math.round(f) : f >= 10 ? Math.round(f * 10) / 10 : Math.round(f * 100) / 100;
};

const WAVE_TYPES: WaveType[] = ['sine', 'square', 'triangle', 'sawtooth'];

/** Grosse pastille de lecture avec halo. */
function PlayOrb({ playing, onPress }: { playing: boolean; onPress: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!playing) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [playing, pulse]);

  return (
    <Animated.View style={[styles.orbHalo, { transform: [{ scale: pulse }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.orb}>
        <LinearGradient
          colors={playing ? [theme.blue, theme.violet] : ['#232B44', '#1A2032']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {playing ? <Square size={30} color="#FFFFFF" fill="#FFFFFF" /> : <Play size={34} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FrequencesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ preset?: string }>();

  const [mode, setMode] = useState<'generator' | 'binaural'>('generator');

  // Générateur
  const [freq, setFreq] = useState(528);
  const [wave, setWave] = useState<WaveType>('sine');
  const [volume, setVolume] = useState(() => useSerenityStore.getState().settings.defaultVolume);
  const [fadeOn, setFadeOn] = useState(true);
  const [timerMin, setTimerMin] = useState<number | null>(null);

  // Binaural
  const [leftFreq, setLeftFreq] = useState(200);
  const [rightFreq, setRightFreq] = useState(210);

  // Sauvegarde
  const [configName, setConfigName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const [, force] = useState(0);
  useEffect(() => engine.subscribe(() => force(n => n + 1)), []);

  // Preset venant de l'accueil
  useEffect(() => {
    if (params.preset) {
      const f = parseInt(params.preset, 10);
      if (!Number.isNaN(f)) {
        setMode('generator');
        setFreq(f);
        if (engine.getToneState().playing && engine.getToneState().beat == null) {
          void engine.updateTone({ freq: f });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.preset]);

  const tone = engine.getToneState();
  const { savedConfigs, saveConfig, removeConfig, settings } = useSerenityStore();
  const beat = rightFreq - leftFreq;

  const isTonePlaying = tone.playing && tone.beat == null;

  const startGenerator = async (f?: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await engine.setMaster(1);
    await engine.startTone({ freq: f ?? freq, type: wave, volume, beat: null });
  };

  const startBinaural = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await engine.setMaster(1);
    await engine.startTone({ freq: leftFreq, type: 'sine', volume, beat });
  };

  const stopAll = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await engine.stopTone();
    if (timerMin && engine.isTimerRunning()) engine.cancelTimer();
  };

  const applyTimer = (min: number | null) => {
    setTimerMin(min);
    if (min == null) {
      engine.cancelTimer();
    } else {
      engine.startTimerFromCurrentMaster(min, fadeOn ? settings.fadeSec : 0);
    }
  };

  const doSave = () => {
    const name = configName.trim() || `${freq} Hz`;
    saveConfig({ name, freq, type: wave, beat: null, volume });
    setConfigName('');
    setShowSave(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const freqDisplay = useMemo(() => (Number.isInteger(freq) ? `${freq}` : freq.toFixed(2)), [freq]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Studio de fréquences</Text>
        <Text style={styles.subtitle}>Générateur audio réel, de 1 à 20 000 Hz</Text>

        {/* Segmentation */}
        <View style={styles.segment}>
          {(['generator', 'binaural'] as const).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.segmentBtn, mode === m && styles.segmentBtnActive]}
              onPress={() => setMode(m)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>
                {m === 'generator' ? 'Générateur' : 'Ondes cérébrales'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'generator' ? (
          <>
            {/* Affichage de la fréquence */}
            <View style={styles.display}>
              <Text style={styles.freqValue}>{freqDisplay}</Text>
              <Text style={styles.freqUnit}>Hz</Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={freqToSlider(freq)}
              minimumTrackTintColor={theme.blue}
              maximumTrackTintColor="rgba(135,144,165,0.3)"
              thumbTintColor={theme.blue}
              onValueChange={v => {
                const f = sliderToFreq(v);
                setFreq(f);
                if (isTonePlaying) void engine.updateTone({ freq: f });
              }}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.rangeText}>1 Hz</Text>
              <Text style={styles.rangeText}>20 000 Hz</Text>
            </View>

            {/* Formes d'onde */}
            <View style={styles.waveRow}>
              {WAVE_TYPES.map(wt => (
                <TouchableOpacity
                  key={wt}
                  style={[styles.waveBtn, wave === wt && styles.waveBtnActive]}
                  onPress={() => {
                    setWave(wt);
                    if (isTonePlaying) void engine.updateTone({ type: wt });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.waveText, wave === wt && styles.waveTextActive]}>
                    {WAVEFORM_LABELS[wt]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 24, marginTop: 16 }}>
              {FREQUENCY_PRESETS.map(p => (
                <TouchableOpacity
                  key={p.freq}
                  style={[styles.preset, freq === p.freq && styles.presetActive]}
                  onPress={() => {
                    setFreq(p.freq);
                    void startGenerator(p.freq);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetFreq, freq === p.freq && styles.presetFreqActive]}>{p.freq}</Text>
                  <Text style={styles.presetNote}>{p.note}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            {/* Binaural */}
            <LinearGradient
              colors={['rgba(136,113,201,0.12)', 'rgba(7,9,15,0)']}
              style={styles.headphoneCard}
            >
              <Headphones size={20} color={theme.violet} />
              <Text style={styles.headphoneText}>
                Portez un casque stéréo : chaque oreille reçoit une fréquence différente, le cerveau perçoit l'écart.
              </Text>
            </LinearGradient>

            <View style={styles.display}>
              <Text style={styles.freqValue}>{Math.abs(beat)}</Text>
              <Text style={styles.freqUnit}>Hz d écart</Text>
            </View>

            <Text style={styles.sliderLabel}>Oreille gauche · {leftFreq} Hz</Text>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={1000}
              step={1}
              value={leftFreq}
              minimumTrackTintColor={theme.blue}
              maximumTrackTintColor="rgba(135,144,165,0.3)"
              thumbTintColor={theme.blue}
              onValueChange={setLeftFreq}
            />
            <Text style={styles.sliderLabel}>Oreille droite · {rightFreq} Hz</Text>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={1000}
              step={1}
              value={rightFreq}
              minimumTrackTintColor={theme.violet}
              maximumTrackTintColor="rgba(135,144,165,0.3)"
              thumbTintColor={theme.violet}
              onValueChange={setRightFreq}
            />

            {/* Ondes cérébrales */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 24, marginTop: 18 }}>
              {BRAINWAVES.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.preset, Math.abs(beat) === b.beat && styles.presetActive]}
                  onPress={() => setRightFreq(leftFreq + b.beat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetFreq, Math.abs(beat) === b.beat && styles.presetFreqActive]}>{b.name}</Text>
                  <Text style={styles.presetNote}>{b.note}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Volume */}
        <View style={{ marginTop: 26 }}>
          <View style={styles.volumeHeader}>
            <Text style={styles.sliderLabel}>Volume</Text>
            <Text style={styles.volumeValue}>{Math.round(volume * 100)} %</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor={theme.blue}
            maximumTrackTintColor="rgba(135,144,165,0.3)"
            thumbTintColor={theme.blue}
            onValueChange={v => {
              setVolume(v);
              if (tone.playing) void engine.updateTone({ volume: v });
            }}
          />
        </View>

        {/* Lecture */}
        <View style={styles.playRow}>
          <PlayOrb
            playing={tone.playing}
            onPress={() => (tone.playing ? void stopAll() : mode === 'generator' ? void startGenerator() : void startBinaural())}
          />
        </View>

        {/* Minuterie */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Timer size={15} color={theme.textDim} />
            <Text style={styles.sliderLabel}>Minuterie d arrêt</Text>
          </View>
          {engine.isTimerRunning() && (
            <Text style={styles.timerLive}>
              {Math.floor(engine.timerRemainingSec() / 60)} min restantes
            </Text>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}>
          {TIMER_OPTIONS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.timerChip, timerMin === m && styles.timerChipActive]}
              onPress={() => applyTimer(timerMin === m ? null : m)}
              activeOpacity={0.8}
            >
              <Text style={[styles.timerText, timerMin === m && styles.timerTextActive]}>{m} min</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.timerChip, fadeOn && styles.timerChipActive]}
            onPress={() => setFadeOn(!fadeOn)}
            activeOpacity={0.8}
          >
            <Text style={[styles.timerText, fadeOn && styles.timerTextActive]}>Fondu {settings.fadeSec}s</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sauvegardes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sliderLabel}>Configurations sauvegardées</Text>
          <TouchableOpacity onPress={() => setShowSave(!showSave)} style={styles.saveBtn}>
            <Save size={15} color={theme.blue} />
          </TouchableOpacity>
        </View>

        {showSave && (
          <View style={styles.saveRow}>
            <TextInput
              style={styles.saveInput}
              placeholder="Nom de la séance…"
              placeholderTextColor={theme.textDim}
              value={configName}
              onChangeText={setConfigName}
            />
            <TouchableOpacity style={styles.saveConfirm} onPress={doSave}>
              <Text style={styles.saveConfirmText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}

        {savedConfigs.length === 0 && !showSave && (
          <Text style={styles.emptyText}>Aucune séance enregistrée pour l instant.</Text>
        )}
        {savedConfigs.map(c => (
          <View key={c.id} style={styles.configRow}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                setMode('generator');
                setFreq(c.freq);
                setWave(c.type);
                void engine.setMaster(1);
                void engine.startTone({ freq: c.freq, type: c.type, volume: c.volume, beat: null });
              }}
            >
              <Text style={styles.listTitle}>{c.name}</Text>
              <Text style={styles.listMeta}>
                {c.freq} Hz · {WAVEFORM_LABELS[c.type]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeConfig(c.id)} style={styles.deleteBtn}>
              <Trash2 size={17} color={theme.textDim} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Mention honnête */}
        <View style={styles.disclaimer}>
          <Info size={14} color={theme.textDim} />
          <Text style={styles.disclaimerText}>
            Les effets attribués aux fréquences relèvent de traditions bien-être ; ils ne sont pas démontrés scientifiquement. Écoutez à volume modéré.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  title: { fontSize: 26, fontWeight: '700' as const, color: theme.text, paddingHorizontal: 24, marginTop: 10 },
  subtitle: { fontSize: 13, color: theme.textDim, paddingHorizontal: 24, marginTop: 4, marginBottom: 18 },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: 'rgba(100,125,255,0.18)' },
  segmentText: { fontSize: 13, color: theme.textDim, fontWeight: '600' as const },
  segmentTextActive: { color: theme.blue },
  display: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  freqValue: {
    fontSize: 68,
    fontWeight: '300' as const,
    color: theme.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  freqUnit: { fontSize: 16, color: theme.textDim, fontWeight: '500' as const },
  slider: { marginHorizontal: 24, marginTop: 14, height: 36 },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginTop: -4,
  },
  rangeText: { fontSize: 11, color: theme.textDim },
  sliderLabel: { fontSize: 13, color: theme.textDim, paddingHorizontal: 24, marginTop: 8 },
  waveRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  waveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  waveBtnActive: { backgroundColor: 'rgba(100,125,255,0.16)', borderColor: theme.blue },
  waveText: { fontSize: 12, color: theme.textDim, fontWeight: '600' as const },
  waveTextActive: { color: theme.blue },
  preset: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 110,
    alignItems: 'center',
  },
  presetActive: { borderColor: theme.blue, backgroundColor: 'rgba(100,125,255,0.12)' },
  presetFreq: { fontSize: 17, fontWeight: '700' as const, color: theme.text },
  presetFreqActive: { color: theme.blue },
  presetNote: { fontSize: 10, color: theme.textDim, marginTop: 2 },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  volumeValue: { fontSize: 13, color: theme.text, fontWeight: '600' as const, paddingHorizontal: 24 },
  playRow: { alignItems: 'center', marginTop: 30 },
  orbHalo: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(100,125,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: { width: 92, height: 92, borderRadius: 46, overflow: 'hidden' },
  orbGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 30,
    marginBottom: 10,
  },
  timerLive: { fontSize: 12, color: theme.blue, fontWeight: '600' as const, paddingRight: 24 },
  timerChip: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timerChipActive: { borderColor: theme.blue, backgroundColor: 'rgba(100,125,255,0.14)' },
  timerText: { fontSize: 12, color: theme.textDim, fontWeight: '600' as const },
  timerTextActive: { color: theme.blue },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(100,125,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  saveInput: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.text,
    fontSize: 14,
  },
  saveConfirm: {
    backgroundColor: 'rgba(100,125,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.blue,
  },
  saveConfirmText: { color: theme.blue, fontWeight: '700' as const, fontSize: 13 },
  emptyText: { fontSize: 13, color: theme.textDim, paddingHorizontal: 24, fontStyle: 'italic' as const },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  listTitle: { fontSize: 15, color: theme.text, fontWeight: '600' as const },
  listMeta: { fontSize: 12, color: theme.textDim, marginTop: 2 },
  deleteBtn: { padding: 6 },
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 26,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(135,144,165,0.07)',
    alignItems: 'center',
  },
  disclaimerText: { flex: 1, fontSize: 12, color: theme.textDim, lineHeight: 17 },
  headphoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(136,113,201,0.3)',
  },
  headphoneText: { flex: 1, fontSize: 12, color: theme.text, lineHeight: 17 },
});
