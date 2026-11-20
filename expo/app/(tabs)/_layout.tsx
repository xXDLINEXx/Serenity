import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, AudioWaveform, Compass, Moon, User, type LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/lib/theme';
import { useSerenityStore } from '@/lib/storage';
import { engine } from '@/lib/engine';

const TAB_ICONS: Record<string, LucideIcon> = {
  index: Home,
  frequences: AudioWaveform,
  explorer: Compass,
  sommeil: Moon,
  profil: User,
};

const TAB_LABELS: Record<string, string> = {
  index: 'Accueil',
  frequences: 'Fréquences',
  explorer: 'Explorer',
  sommeil: 'Sommeil',
  profil: 'Profil',
};

function SerenityTabBar(props: {
  state: { routes: { key: string; name: string }[]; index: number };
  navigateToTab: (routeKey: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const dim = useSerenityStore(s => s.settings.dim);
  const [playingCount, setPlayingCount] = React.useState(engine.channelCount());

  React.useEffect(() => {
    const unsub = engine.subscribe(() => setPlayingCount(engine.channelCount() + (engine.getToneState().playing ? 1 : 0)));
    return () => { unsub(); };
  }, []);

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) + 8, opacity: 1 - dim * 0.9 }]}>
        {props.state.routes.map((route, i) => {
          const active = props.state.index === i;
          const Icon = TAB_ICONS[route.name] ?? Circle;
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                props.navigateToTab(route.key);
              }}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {active && (
                <React.Fragment>
                  <LinearGradient
                    colors={['rgba(100,125,255,0.25)', 'rgba(136,113,201,0.08)', 'transparent']}
                    style={styles.activeHalo}
                  />
                  <View style={styles.activeDot} />
                </React.Fragment>
              )}
              <Icon
                size={22}
                color={active ? theme.blue : theme.textDim}
                strokeWidth={active ? 2.2 : 1.6}
              />
              <Text style={[styles.label, active && { color: theme.text, fontWeight: '600' as const }]}>
                {TAB_LABELS[route.name] ?? route.name}
              </Text>
              {route.name === 'explorer' && playingCount > 0 && (
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function Circle({ size, color, strokeWidth }: { size: number; color: string; strokeWidth: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: color }} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => (
        <SerenityTabBar
          state={props.state as unknown as { routes: { key: string; name: string }[]; index: number }}
          navigateToTab={props.navigateToTab}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="frequences" options={{ title: 'Fréquences' }} />
      <Tabs.Screen name="explorer" options={{ title: 'Explorer' }} />
      <Tabs.Screen name="sommeil" options={{ title: 'Sommeil' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 17, 27, 0.96)',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: theme.textDim,
  },
  activeHalo: {
    position: 'absolute',
    top: -22,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.blue,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
