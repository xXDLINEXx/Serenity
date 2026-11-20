import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Play, Square, Layers, Timer, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/lib/theme';
import { engine } from '@/lib/engine';
import { useSerenityStore } from '@/lib/storage';
// note : le moteur enregistre lui-même la séance à l'ajout d'un canal (trackSession)
import { soundLibrary } from '@/lib/library';
import { TIMER_OPTIONS, timerLabel } from '@/lib/frequencies';

export default function ExplorerScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useSerenityStore();
  const [, force] = useState(0);
  const [timerMin, setTimerMin] = useState<number | null>(null);

  useEffect(() => engine.subscribe(() => force(n => n + 1)), []);

  const activeCount = engine.channelCount();

  const toggle = (id: string, audio: number, title: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void engine.toggleChannel(id, audio, settings.defaultVolume, title);
  };

  const stopAll = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void engine.stopAllChannels();
  };

  const applyTimer = (min: number | null) => {
    setTimerMin(min);
    if (min == null) engine.cancelTimer();
    else engine.startTimerFromCurrentMaster(min, settings.fadeSec);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Explorer</Text>
            <Text style={styles.subtitle}>Mélangez plusieurs sons, chacun à son niveau</Text>
          </View>
          <Layers size={22} color={theme.blue} />
        </View>

        {activeCount > 0 && (
          <LinearGradient
            colors={['rgba(100,125,255,0.14)', 'rgba(136,113,201,0.08)']}
            style={styles.mixerBar}
          >
            <View style={styles.mixerInfo}>
              <View style={styles.liveDot} />
              <Text style={styles.mixerText}>{activeCount} son{activeCount > 1 ? 's' : ''} en lecture</Text>
            </View>
            <TouchableOpacity style={styles.stopBtn} onPress={stopAll} activeOpacity={0.8}>
              <Square size={14} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.stopBtnText}>Tout arrêter</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Sons de la bibliothèque */}
        {soundLibrary.map(sound => {
          const active = engine.isActive(sound.id);
          const vol = engine.getChannelVolume(sound.id) || settings.defaultVolume;
          return (
            <View key={sound.id} style={[styles.row, active && styles.rowActive]}>
              <TouchableOpacity
                style={[styles.rowIconWrap, { backgroundColor: sound.gradient[0] }]}
                onPress={() => toggle(sound.id, sound.audio, sound.title)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={sound.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <sound.icon size={20} color={theme.text} />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => toggle(sound.id, sound.audio, sound.title)} activeOpacity={0.8}>
                  <Text style={[styles.rowTitle, active && { color: theme.blue }]}>{sound.title}</Text>
                  <Text style={styles.rowSubtitle}>{sound.subtitle}</Text>
                </TouchableOpacity>
                {active && (
                  <Slider
                    style={{ marginTop: 6, height: 28 }}
                    minimumValue={0}
                    maximumValue={1}
                    value={vol}
                    minimumTrackTintColor={theme.blue}
                    maximumTrackTintColor="rgba(135,144,165,0.3)"
                    thumbTintColor={theme.blue}
                    onValueChange={v => void engine.setChannelVolume(sound.id, v)}
                  />
                )}
              </View>

              <TouchableOpacity
                onPress={() => toggle(sound.id, sound.audio, sound.title)}
                style={[styles.playBtn, active && styles.playBtnActive]}
                activeOpacity={0.8}
              >
                {active ? <Square size={15} color="#FFFFFF" fill="#FFFFFF" /> : <Play size={16} color={theme.text} fill={theme.text} />}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Minuterie du mixeur */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Timer size={15} color={theme.textDim} />
            <Text style={styles.sectionLabel}>Minuterie</Text>
          </View>
          {engine.isTimerRunning() && (
            <Text style={styles.timerLive}>{Math.floor(engine.timerRemainingSec() / 60)} min restantes</Text>
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
              <Text style={[styles.timerText, timerMin === m && styles.timerTextActive]}>{timerLabel(m)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.disclaimer}>
          <Info size={14} color={theme.textDim} />
          <Text style={styles.disclaimerText}>
            Architecture ouverte : chaque son est un fichier local — remplacez-les par vos propres sons libres de droits dans /media/audio.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 18,
  },
  title: { fontSize: 26, fontWeight: '700' as const, color: theme.text },
  subtitle: { fontSize: 13, color: theme.textDim, marginTop: 4 },
  mixerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  mixerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.blue,
  },
  mixerText: { fontSize: 13, fontWeight: '600' as const, color: theme.text },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
  },
  stopBtnText: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' as const },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  rowActive: { borderColor: 'rgba(100,125,255,0.5)' },
  rowIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 16, fontWeight: '600' as const, color: theme.text },
  rowSubtitle: { fontSize: 12, color: theme.textDim, marginTop: 1 },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: { backgroundColor: 'rgba(100,125,255,0.3)' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 26,
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 14, color: theme.text, fontWeight: '700' as const },
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
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(135,144,165,0.07)',
    alignItems: 'center',
  },
  disclaimerText: { flex: 1, fontSize: 12, color: theme.textDim, lineHeight: 17 },
});
