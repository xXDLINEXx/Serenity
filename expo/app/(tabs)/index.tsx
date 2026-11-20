import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Moon, Play, ChevronRight, Sparkles, Clock, Heart, type LucideIcon } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useSerenityStore } from '@/lib/storage';
import { soundLibrary } from '@/lib/library';
import { FREQUENCY_PRESETS } from '@/lib/frequencies';

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bon matin';
  if (h >= 12 && h < 18) return 'Bel après-midi';
  if (h >= 18 && h < 22) return 'Douce soirée';
  return 'Belle nuit';
}

/** Halo circulaire qui « respire » lentement. */
function BreathingOrb({ reduced }: { reduced: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (reduced) {
      scale.setValue(1);
      glow.setValue(0.8);
      return;
    }
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.18, duration: 3800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 3800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 3800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.55, duration: 3800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, scale, glow]);

  return (
    <View style={orbStyles.wrap}>
      {[1.9, 1.5, 1.15].map((factor, i) => (
        <Animated.View
          key={i}
          style={[
            orbStyles.ring,
            {
              width: 190 * factor,
              height: 190 * factor,
              borderRadius: 95 * factor,
              borderWidth: 1.5,
              borderColor: i === 1 ? theme.halo : theme.border,
              opacity: glow.interpolate({ inputRange: [0.4, 1], outputRange: [0.25, 0.9] }),
              transform: [{ scale: scale.interpolate({ inputRange: [0.9, 1.25], outputRange: [1 / factor, 1.25 / factor] }) }],
            },
          ]}
        />
      ))}
      <Animated.View style={[orbStyles.core, { opacity: glow }]}>
        <LinearGradient
          colors={[theme.blue, theme.violet, '#2A2A55']}
          style={orbStyles.coreGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <View style={orbStyles.innerShadow} />
    </View>
  );
}

const orbStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', height: 260, marginTop: 8 },
  ring: { position: 'absolute' },
  core: { width: 190, height: 190, borderRadius: 95, overflow: 'hidden' },
  coreGradient: { flex: 1 },
  innerShadow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(232,234,242,0.25)',
  },
});

export default function AccueilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const favorites = useSerenityStore(s => s.favorites);
  const history = useSerenityStore(s => s.history);
  const settings = useSerenityStore(s => s.settings);
  const [day, setDay] = React.useState('');

  React.useEffect(() => {
    setDay(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
  }, []);

  const recent = useMemo(() => history.slice(0, 4), [history]);
  const favoriteSounds = useMemo(
    () => soundLibrary.filter(s => favorites.includes(s.id)),
    [favorites]
  );

  const recommend: { id: string; title: string; subtitle: string; icon: LucideIcon; gradient: [string, string]; mediaId: string }[] = [
    { id: 'r1', title: 'Pluie douce', subtitle: 'Pour s endormir en douceur', icon: Moon, gradient: ['#16283F', '#0D1420'], mediaId: 'pluie-douce' },
    { id: 'r2', title: '528 Hz', subtitle: 'La fréquence des bienfaits', icon: Sparkles, gradient: ['#33234A', '#1E1430'], mediaId: '417hz' },
    { id: 'r3', title: 'Vague de l océan', subtitle: 'Respirer au rythme des vagues', icon: Play, gradient: ['#0F3D52', '#0A1F2B'], mediaId: 'vague-de-locean' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.date}>{day}</Text>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.subtitle}>Prenez un instant pour respirer.</Text>
        </View>

        {/* Orb */}
        <BreathingOrb reduced={settings.reducedAnimations} />

        {/* Accès rapide fréquences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fréquences solfégiques</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/frequences')}>
            <Text style={styles.sectionLink}>Studio</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {FREQUENCY_PRESETS.map(p => (
            <TouchableOpacity
              key={p.freq}
              style={styles.chip}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(tabs)/frequences', params: { preset: String(p.freq) } })}
            >
              <Text style={styles.chipFreq}>{p.freq}</Text>
              <Text style={styles.chipHz}>Hz</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommandations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommandé pour vous</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
          {recommend.map(r => (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/fullscreen-player?mediaId=${r.mediaId}`)}
            >
              <LinearGradient colors={r.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.recoCard}>
                <View style={styles.recoIcon}>
                  <r.icon size={20} color={theme.text} />
                </View>
                <Text style={styles.recoTitle} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.recoSubtitle} numberOfLines={2}>{r.subtitle}</Text>
                <View style={styles.recoPlay}>
                  <Play size={16} color={theme.text} fill={theme.text} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sommeil */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/sommeil')}
          style={{ paddingHorizontal: 20, marginTop: 26 }}
        >
          <LinearGradient
            colors={['#0D111B', '#141A27']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sleepBanner}
          >
            <View style={styles.sleepIcon}>
              <Moon size={24} color={theme.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sleepTitle}>Espace Sommeil</Text>
              <Text style={styles.sleepSubtitle}>Minuterie, fondu et écran atténué pour la nuit</Text>
            </View>
            <ChevronRight size={20} color={theme.textDim} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Récemment écoutés */}
        {recent.length > 0 && (
          <View style={{ marginTop: 26 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Récemment écoutés</Text>
              <View style={styles.rowIcon}><Clock size={14} color={theme.textDim} /></View>
            </View>
            {recent.map((h, i) => (
              <TouchableOpacity
                key={`${h.id}-${h.at}-${i}`}
                style={styles.listRow}
                activeOpacity={0.8}
                onPress={() => {
                  if (h.kind === 'ambient') router.push(`/fullscreen-player?mediaId=${h.id}`);
                  else router.push('/(tabs)/frequences');
                }}
              >
                <View style={[styles.listDot, { backgroundColor: h.kind === 'ambient' ? theme.blue : theme.violet }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle} numberOfLines={1}>{h.title}</Text>
                  <Text style={styles.listMeta}>
                    {h.kind === 'ambient' ? 'Ambiance' : h.kind === 'binaural' ? 'Binaural' : h.kind === 'tone' ? 'Fréquence' : 'Mixage'}
                  </Text>
                </View>
                <Play size={16} color={theme.textDim} fill={theme.textDim} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Favoris */}
        {favoriteSounds.length > 0 && (
          <View style={{ marginTop: 26 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vos favoris</Text>
              <View style={styles.rowIcon}><Heart size={14} color={theme.violet} fill={theme.violet} /></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {favoriteSounds.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.favChip, { backgroundColor: theme.card }]}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/fullscreen-player?mediaId=${s.id === 'pluie' ? 'pluie-douce' : s.id === 'orage' ? 'orage-apaisant' : s.id === 'foret' ? 'foret-paisible' : s.id === 'ocean' ? 'vague-de-locean' : s.id === 'vent' ? 'vent-leger' : s.id === 'feu' ? 'feu-de-camp' : s.id}`)}
                >
                  <s.icon size={16} color={theme.blue} />
                  <Text style={styles.favChipText}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 24, paddingTop: 18 },
  date: { fontSize: 13, color: theme.textDim, textTransform: 'capitalize', marginBottom: 4 },
  greeting: { fontSize: 30, fontWeight: '700' as const, color: theme.text },
  subtitle: { fontSize: 14, color: theme.textDim, marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: theme.text },
  sectionLink: { fontSize: 13, color: theme.blue, fontWeight: '600' as const },
  rowIcon: { marginRight: 4 },
  chip: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 72,
  },
  chipFreq: { fontSize: 20, fontWeight: '700' as const, color: theme.blue },
  chipHz: { fontSize: 10, color: theme.textDim, marginTop: 1 },
  recoCard: {
    width: 170,
    borderRadius: 18,
    padding: 16,
    height: 150,
    justifyContent: 'flex-end',
  },
  recoIcon: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoPlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoTitle: { fontSize: 16, fontWeight: '700' as const, color: theme.text },
  recoSubtitle: { fontSize: 12, color: 'rgba(232,234,242,0.7)', marginTop: 2 },
  sleepBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 14,
  },
  sleepIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(100,125,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepTitle: { fontSize: 16, fontWeight: '700' as const, color: theme.text },
  sleepSubtitle: { fontSize: 12, color: theme.textDim, marginTop: 2 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  listDot: { width: 8, height: 8, borderRadius: 4 },
  listTitle: { fontSize: 15, color: theme.text, fontWeight: '500' as const },
  listMeta: { fontSize: 11, color: theme.textDim, marginTop: 1 },
  favChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  favChipText: { fontSize: 13, color: theme.text, fontWeight: '500' as const },
});
