import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {
  User, Heart, History, BarChart3, SlidersHorizontal, Play, Square,
  Trash2, Sparkles, Music4, type LucideIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/lib/theme';
import { engine } from '@/lib/engine';
import { useSerenityStore, type HistoryEntry } from '@/lib/storage';
import { soundLibrary } from '@/lib/library';
import { FREQUENCY_PRESETS, BRAINWAVES } from '@/lib/frequencies';

const KIND_ICONS: Record<HistoryEntry['kind'], LucideIcon> = {
  tone: Sparkles,
  binaural: Music4,
  mixer: SlidersHorizontal,
  ambient: Sparkles,
};

const KIND_LABELS: Record<HistoryEntry['kind'], string> = {
  tone: 'Générateur',
  binaural: 'Binaural',
  mixer: 'Mixeur',
  ambient: 'Ambiance',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'hier' : `il y a ${d} j`;
}

/** Statistiques calculées à partir de l'historique (petit tableau, recalcul à chaque rendu). */
function computeStats(history: HistoryEntry[]) {
  const weekAgo = Date.now() - 7 * 24 * 3600_000;
  const totalSeconds = history.reduce((acc, e) => acc + (e.seconds ?? 0), 0);
  const weekCount = history.filter(e => e.at >= weekAgo).length;
  const byKind = history.reduce<Record<string, number>>((acc, e) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1;
    return acc;
  }, {});
  const topKind = Object.entries(byKind).sort((a, b) => b[1] - a[1])[0]?.[0] as HistoryEntry['kind'] | undefined;
  return { sessions: history.length, totalMinutes: Math.round(totalSeconds / 60), weekCount, topKind };
}

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, history, savedConfigs, settings, updateSettings, clearHistory, removeConfig } = useSerenityStore();
  const [, force] = useState(0);

  useEffect(() => engine.subscribe(() => force(n => n + 1)), []);

  const stats = computeStats(history);

  const favoriteItems = useMemo(() => {
    return favorites
      .map(id => {
        const sound = soundLibrary.find(s => s.id === id);
        if (sound) return { id, title: sound.title, icon: sound.icon, gradient: sound.gradient as [string, string], kind: 'mixer' as const };
        const preset = FREQUENCY_PRESETS.find(p => `${p.freq}` === id.replace(' tone', ''));
        if (preset) return { id, title: preset.name, icon: Sparkles, gradient: [theme.blue, theme.violet] as [string, string], kind: 'tone' as const };
        const wave = BRAINWAVES.find(b => b.id === id);
        if (wave) return { id, title: `Battement ${wave.name}`, icon: Music4, gradient: [theme.violet, '#3A3A6E'] as [string, string], kind: 'binaural' as const };
        return { id, title: id, icon: Sparkles, gradient: [theme.card, theme.card] as [string, string], kind: 'ambient' as const };
      });
  }, [favorites]);

  const stopTone = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void engine.stopTone();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.headerRow}>
          <LinearGradient colors={[theme.blue, theme.violet]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <User size={28} color="#FFFFFF" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.subtitle}>Vos habitudes, favoris et préférences — tout reste sur l'appareil</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <BarChart3 size={16} color={theme.blue} />
            <Text style={styles.statValue}>{stats.sessions}</Text>
            <Text style={styles.statLabel}>séances</Text>
          </View>
          <View style={styles.statCard}>
            <History size={16} color={theme.violet} />
            <Text style={styles.statValue}>{stats.totalMinutes}</Text>
            <Text style={styles.statLabel}>minutes écoutées</Text>
          </View>
          <View style={styles.statCard}>
            <Sparkles size={16} color={theme.blue} />
            <Text style={styles.statValue}>{stats.weekCount}</Text>
            <Text style={styles.statLabel}>cette semaine</Text>
          </View>
        </View>
        {stats.topKind && (
          <Text style={styles.topKind}>
            Vous écoutez surtout « {KIND_LABELS[stats.topKind]} » en ce moment.
          </Text>
        )}

        {/* Historique récent */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <History size={15} color={theme.blue} />
            <Text style={styles.sectionLabel}>Historique récent</Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory} hitSlop={8}>
              <Text style={styles.clearLink}>Tout effacer</Text>
            </TouchableOpacity>
          )}
        </View>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>Vos séances apparaîtront ici au fil de l'écoute.</Text>
        ) : (
          history.slice(0, 8).map(entry => {
            const Icon = KIND_ICONS[entry.kind];
            return (
              <View key={`${entry.id}-${entry.at}`} style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Icon size={13} color={theme.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{entry.title}</Text>
                  <Text style={styles.historyMeta}>
                    {KIND_LABELS[entry.kind]} · {timeAgo(entry.at)}
                    {entry.seconds ? ` · ${Math.max(1, Math.round(entry.seconds / 60))} min` : ''}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {/* Favoris */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Heart size={15} color={theme.violet} />
            <Text style={styles.sectionLabel}>Favoris</Text>
          </View>
        </View>
        {favoriteItems.length === 0 ? (
          <Text style={styles.emptyText}>Aucun favori pour l'instant — touchez le cœur d'un son pour l'épingler ici.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24 }}>
            {favoriteItems.map(item => (
              <View key={item.id} style={styles.favChip}>
                <item.icon size={13} color={theme.text} />
                <Text style={styles.favChipText}>{item.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Séances enregistrées */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Séances enregistrées</Text>
        </View>
        {savedConfigs.length === 0 ? (
          <Text style={styles.emptyText}>
            Vos fréquences sauvegardées depuis l'onglet Fréquences apparaîtront ici, prêtes à relancer.
          </Text>
        ) : (
          savedConfigs.map(cfg => {
            const playingThis = engine.getToneState().playing;
            return (
              <View key={cfg.id} style={styles.configRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.configName}>{cfg.name}</Text>
                  <Text style={styles.configMeta}>
                    {cfg.freq} Hz · {cfg.beat != null ? `battement ${cfg.beat} Hz` : 'tonalité pure'}
                  </Text>
                </View>
                {playingThis ? (
                  <TouchableOpacity style={[styles.configBtn, styles.configBtnStop]} onPress={stopTone} activeOpacity={0.8}>
                    <Square size={13} color="#FFFFFF" fill="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.configBtn}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      void engine.startTone({ freq: cfg.freq, type: cfg.type, volume: cfg.volume, beat: cfg.beat });
                    }}
                    activeOpacity={0.8}
                  >
                    <Play size={13} color={theme.text} fill={theme.text} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.configDelete} onPress={() => removeConfig(cfg.id)} hitSlop={8}>
                  <Trash2 size={15} color={theme.textDim} />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Préférences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Préférences</Text>
        </View>

        <View style={styles.prefCard}>
          <Text style={styles.prefLabel}>Volume par défaut · {Math.round(settings.defaultVolume * 100)} %</Text>
          <Slider
            style={{ height: 30 }}
            minimumValue={0}
            maximumValue={1}
            value={settings.defaultVolume}
            minimumTrackTintColor={theme.blue}
            maximumTrackTintColor="rgba(135,144,165,0.3)"
            thumbTintColor={theme.blue}
            onValueChange={v => updateSettings({ defaultVolume: v })}
          />
        </View>

        <View style={styles.prefCard}>
          <Text style={styles.prefLabel}>Fondu de fin de séance</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
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

        <View style={styles.prefCardRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.prefLabel}>Animations réduites</Text>
            <Text style={styles.prefHint}>Désactive les halos respirants (utile sur un appareil lent).</Text>
          </View>
          <Switch
            value={settings.reducedAnimations}
            onValueChange={v => { void Haptics.selectionAsync(); updateSettings({ reducedAnimations: v }); }}
            trackColor={{ true: theme.blue, false: 'rgba(135,144,165,0.3)' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.prefCardRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.prefLabel}>Effacer l'historique</Text>
            <Text style={styles.prefHint}>{history.length} entrée{history.length > 1 ? 's' : ''} — irréversible.</Text>
          </View>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); clearHistory(); }}
            activeOpacity={0.8}
          >
            <Trash2 size={15} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '700' as const, color: theme.text },
  subtitle: { fontSize: 13, color: theme.textDim, marginTop: 3, lineHeight: 18 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    alignItems: 'flex-start',
    gap: 6,
  },
  statValue: { fontSize: 24, fontWeight: '700' as const, color: theme.text },
  statLabel: { fontSize: 11, color: theme.textDim },
  topKind: {
    paddingHorizontal: 24,
    marginTop: 12,
    fontSize: 12,
    color: theme.textDim,
    fontStyle: 'italic',
  },
  clearLink: { fontSize: 12, color: '#FF6B6B', fontWeight: '600' as const, paddingRight: 24 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 6,
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  historyIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(100,125,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: { fontSize: 13, fontWeight: '600' as const, color: theme.text },
  historyMeta: { fontSize: 11, color: theme.textDim, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 26,
    marginBottom: 12,
  },
  sectionLabel: { fontSize: 14, fontWeight: '700' as const, color: theme.text },
  emptyText: {
    marginHorizontal: 24,
    fontSize: 12,
    color: theme.textDim,
    lineHeight: 18,
  },
  favChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  favChipText: { fontSize: 12, color: theme.text, fontWeight: '600' as const },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  configName: { fontSize: 14, fontWeight: '600' as const, color: theme.text },
  configMeta: { fontSize: 11, color: theme.textDim, marginTop: 2 },
  configBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(100,125,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  configBtnStop: { backgroundColor: 'rgba(239,68,68,0.3)' },
  configDelete: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(135,144,165,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefCard: {
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  prefCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  prefLabel: { fontSize: 13, fontWeight: '600' as const, color: theme.text },
  prefHint: { fontSize: 11, color: theme.textDim, marginTop: 3, lineHeight: 16 },
  fadeChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bg2,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  fadeChipActive: { borderColor: theme.blue, backgroundColor: 'rgba(100,125,255,0.14)' },
  fadeChipText: { fontSize: 12, color: theme.textDim, fontWeight: '600' as const },
  fadeChipTextActive: { color: theme.blue },
  clearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239,68,68,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
