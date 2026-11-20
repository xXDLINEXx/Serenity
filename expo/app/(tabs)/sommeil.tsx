import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Moon, Square, Timer, MoonStar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/lib/theme';
import { engine } from '@/lib/engine';
import { useSerenityStore } from '@/lib/storage';
import { soundLibrary } from '@/lib/library';
import { TIMER_OPTIONS } from '@/lib/frequencies';

/** Sélection du soir : les sons les plus adaptés à l'endormissement. */
const SLEEP_IDS = ['pluie', 'ocean', 'bruit-blanc', 'bruit-rose', 'bruit-brun', 'vent', 'foret', 'orage'];

export default function SommeilScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSerenityStore();
  const [, force] = useState(0);
  const [timerMin, setTimerMin] = useState<number | null>(null);
  const [, setClock] = useState(0);

  useEffect(() => engine.subscribe(() => force(n => n + 1)), []);
  // Rafraîchit le compte à rebours chaque seconde quand la minuterie tourne
  useEffect(() => {
    const i = setInterval(() => setClock(c => c + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const sleepSounds = soundLibrary.filter(s => SLEEP_IDS.includes(s.id));
  const playing = engine.channelCount();
  const remaining = engine.timerRemainingSec();

  // Lune qui respire très lentement
  const glow = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (settings.reducedAnimations) {
      glow.setValue(0.85);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 5200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.5, duration: 5200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [settings.reducedAnimations, glow]);

  const toggle = (id: string, audio: number, title: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void engine.toggleChannel(id, audio, settings.defaultVolume, title);
  };

  const stopAll = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerMin(null);
    void engine.stopEverything();
  };

  const applyTimer = (min: number | null) => {
    void Haptics.selectionAsync();
    setTimerMin(min);
    if (min == null) engine.cancelTimer();
    else engine.startTimerFromCurrentMaster(min, settings.fadeSec);
  };

  const fmtRemaining = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />
      {/* Voile d'assombrissement réglable */}
      {settings.dim > 0 && (
        <View pointerEvents="none" style={[styles.dimOverlay, { opacity: settings.dim }]} />
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        {/* En-tête : lune + titre */}
        <View style={styles.header}>
          <Animated.View style={[styles.moonWrap, { opacity: glow }]}>
            <LinearGradient colors={[theme.violet, '#3A3A6E']} style={styles.moonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Moon size={26} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Sommeil</Text>
            <Text style={styles.subtitle}>Espace nocturne — sons lents, minuterie et écran tamisé</Text>
          </View>
        </View>

        {/* Compte à rebours en cours */}
        {engine.isTimerRunning() && (
          <View style={styles.countdownCard}>
            <Timer size={16} color={theme.violet} />
            <Text style={styles.countdownText}>Arrêt dans {fmtRemaining(remaining)}</Text>
            <Text style={styles.countdownFade}>fondu {settings.fadeSec > 0 ? `${settings.fadeSec} s` : 'désactivé'}</Text>
            <TouchableOpacity onPress={() => { setTimerMin(null); engine.cancelTimer(); }} hitSlop={10}>
              <Text style={styles.countdownCancel}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Minuterie + fondu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Minuterie d'endormissement</Text>
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
        </ScrollView>

        <View style={styles.fadeRow}>
          <Text style={styles.fadeLabel}>Fondu de fin</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 15, 30, 60].map(sec => (
              <TouchableOpacity
                key={sec}
                style={[styles.fadeChip, settings.fadeSec === sec && styles.fadeChipActive]}
                onPress={() => { void Haptics.selectionAsync(); updateSettings({ fadeSec: sec }); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.fadeChipText, settings.fadeSec === sec && styles.fadeChipTextActive]}>
                  {sec === 0 ? 'Net' : `${sec} s`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sons du soir */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MoonStar size={15} color={theme.textDim} />
            <Text style={styles.sectionLabel}>Ambiances nocturnes</Text>
          </View>
          {playing > 0 && (
            <TouchableOpacity style={styles.stopAll} onPress={stopAll} hitSlop={8}>
              <Square size={12} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.stopAllText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.grid}>
          {sleepSounds.map(sound => {
            const active = engine.isActive(sound.id);
            return (
              <TouchableOpacity
                key={sound.id}
                style={[styles.tile, active && styles.tileActive]}
                onPress={() => toggle(sound.id, sound.audio, sound.title)}
                activeOpacity={0.75}
              >
                <LinearGradient colors={sound.gradient} style={styles.tileGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={[styles.tileIcon, active && { backgroundColor: 'rgba(136,113,201,0.35)' }]}>
                    <sound.icon size={20} color={active ? '#FFFFFF' : theme.text} />
                  </View>
                  <Text style={styles.tileTitle} numberOfLines={1}>{sound.title}</Text>
                  {active && <View style={styles.tileDot} />}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Assombrissement */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Tamiser l'écran</Text>
          <Text style={styles.dimValue}>{Math.round(settings.dim * 100)} %</Text>
        </View>
        <View style={styles.dimCard}>
          <Slider
            style={{ height: 32 }}
            minimumValue={0}
            maximumValue={0.6}
            value={settings.dim}
            minimumTrackTintColor={theme.violet}
            maximumTrackTintColor="rgba(135,144,165,0.3)"
            thumbTintColor={theme.violet}
            onValueChange={v => updateSettings({ dim: v })}
          />
          <Text style={styles.dimHint}>Le voile s'applique à tout le sommaire — pratique pour ne pas éblouir la nuit.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  dimOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 50,
    elevation: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  moonWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  moonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '700' as const, color: theme.text },
  subtitle: { fontSize: 13, color: theme.textDim, marginTop: 3, lineHeight: 18 },
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 18,
    backgroundColor: 'rgba(136,113,201,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(136,113,201,0.4)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  countdownText: { fontSize: 13, fontWeight: '700' as const, color: theme.text, flex: 1 },
  countdownFade: { fontSize: 11, color: theme.textDim },
  countdownCancel: { fontSize: 12, color: theme.violet, fontWeight: '700' as const },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 14, fontWeight: '700' as const, color: theme.text },
  timerChip: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  timerChipActive: { borderColor: theme.violet, backgroundColor: 'rgba(136,113,201,0.16)' },
  timerText: { fontSize: 13, color: theme.textDim, fontWeight: '600' as const },
  timerTextActive: { color: '#FFFFFF' },
  fadeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  fadeLabel: { fontSize: 13, color: theme.textDim },
  fadeChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fadeChipActive: { borderColor: theme.violet },
  fadeChipText: { fontSize: 11, color: theme.textDim, fontWeight: '600' as const },
  fadeChipTextActive: { color: '#FFFFFF' },
  stopAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239,68,68,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stopAllText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' as const },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 24,
  },
  tile: {
    width: '48.5%',
    height: 96,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  tileActive: { borderColor: 'rgba(136,113,201,0.7)' },
  tileGradient: { flex: 1, padding: 12, justifyContent: 'space-between' },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: { fontSize: 14, fontWeight: '600' as const, color: theme.text },
  tileDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.violet,
  },
  dimValue: { fontSize: 12, color: theme.violet, fontWeight: '700' as const },
  dimCard: {
    marginHorizontal: 24,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
  },
  dimHint: { fontSize: 11, color: theme.textDim, lineHeight: 16 },
});
