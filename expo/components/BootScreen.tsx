import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sparkle } from 'lucide-react-native';
import { theme } from '@/lib/theme';

const { width, height } = Dimensions.get('window');

/** Hauteurs des barres de l'égalisateur (motif symétrique du logo). */
const BAR_HEIGHTS = [16, 28, 42, 26, 12, 26, 42, 28, 16];

interface BootScreenProps {
  onFinish: () => void;
}

/**
 * Écran de démarrage Serenity — le logo (croissant, étoiles, égalisateur)
 * recréé en vectoriel et animé : lune qui pulse, étoiles qui scintillent,
 * vague sonore qui traverse les barres.
 */
export function BootScreen({ onFinish }: BootScreenProps) {
  // Entrée / sortie globale
  const fade = useState(() => new Animated.Value(0))[0];
  const exitScale = useState(() => new Animated.Value(1))[0];

  // Lune
  const moonScale = useState(() => new Animated.Value(0.5))[0];
  const moonGlow = useState(() => new Animated.Value(0.3))[0];

  // Étoiles qui scintillent
  const star1 = useState(() => new Animated.Value(0.2))[0];
  const star2 = useState(() => new Animated.Value(0.2))[0];

  // Barres de l'égalisateur (une valeur par barre)
  const bars = useState(() => BAR_HEIGHTS.map(() => new Animated.Value(0.25)))[0];

  // Mot « Serenity »
  const wordOpacity = useState(() => new Animated.Value(0))[0];
  const wordTracking = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    // Fondu d'entrée général
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // La lune se dépose au centre
    Animated.spring(moonScale, {
      toValue: 1,
      tension: 42,
      friction: 8,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Halo lunaire qui respire
    loops.push(
      Animated.loop(
        Animated.sequence([
          Animated.timing(moonGlow, { toValue: 0.75, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(moonGlow, { toValue: 0.3, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );

    // Étoiles : scintillements décalés
    const twinkle = (anim: Animated.Value, period: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: period, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.2, duration: period, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    loops.push(twinkle(star1, 1100), twinkle(star2, 1500));

    // Égalisateur : la vague traverse les barres en boucle
    bars.forEach((v, i) => {
      loops.push(
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 120),
            Animated.timing(v, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(v, { toValue: 0.3, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.delay((BAR_HEIGHTS.length - 1 - i) * 120),
          ])
        )
      );
    });

    // Le mot apparaît avec un léger resserrement du tracking
    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(wordTracking, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();

    loops.forEach(l => l.start());

    // Sortie en douceur
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 650, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(exitScale, { toValue: 1.08, duration: 650, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start(() => onFinish());
    }, 3200);

    return () => {
      clearTimeout(timeout);
      loops.forEach(l => l.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wordSpacing = wordTracking.interpolate({ inputRange: [0, 1], outputRange: [10, 3] });
  const glowScale = moonGlow.interpolate({ inputRange: [0.3, 0.75], outputRange: [1, 1.25] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050608', theme.bg, '#0B0E1A']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <Animated.View style={[styles.stage, { opacity: fade, transform: [{ scale: exitScale }] }]}>
          {/* Marque : lune + étoiles + égalisateur */}
          <View style={styles.markWrap}>
            {/* Halo derrière la lune */}
            <Animated.View
              style={[styles.moonHalo, { opacity: moonGlow, transform: [{ scale: glowScale }] }]}
            />

            {/* Étoiles */}
            <Animated.View style={[styles.star1, { opacity: star1 }]}>
              <Sparkle size={16} color="#FFFFFF" fill="#FFFFFF" />
            </Animated.View>
            <Animated.View style={[styles.star2, { opacity: star2 }]}>
              <Sparkle size={11} color="#FFFFFF" fill="#FFFFFF" />
            </Animated.View>

            {/* Croissant de lune */}
            <Animated.View style={{ transform: [{ scale: moonScale }] }}>
              <Moon size={74} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.4} />
            </Animated.View>

            {/* Égalisateur */}
            <View style={styles.eqRow}>
              {BAR_HEIGHTS.map((h, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.eqBar,
                    { height: h, transform: [{ scaleY: bars[i] }] },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Mot-symbole */}
          <Animated.View style={{ opacity: wordOpacity }}>
            <Text style={[styles.wordmark, { letterSpacing: wordSpacing }]}>Serenity</Text>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stage: {
    alignItems: 'center',
  },
  markWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 200,
  },
  moonHalo: {
    position: 'absolute',
    top: -34,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(100, 125, 255, 0.18)',
  },
  star1: {
    position: 'absolute',
    top: 4,
    left: -46,
  },
  star2: {
    position: 'absolute',
    top: 30,
    right: -50,
  },
  eqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -22,
    zIndex: -1,
  },
  eqBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  wordmark: {
    fontSize: 38,
    fontWeight: '400' as const,
    color: '#FFFFFF',
    marginTop: 34,
  },
});
