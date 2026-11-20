import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/theme';

const { width, height } = Dimensions.get('window');

interface BootScreenProps {
  onFinish: () => void;
}

/**
 * Écran de démarrage Serenity — palette nuit (#07090F → violet),
 * orbe qui respire lentement, ondes concentriques et égalisateur.
 */
export function BootScreen({ onFinish }: BootScreenProps) {
  // Entrée en scène
  const fade = useState(() => new Animated.Value(0))[0];
  const orbScale = useState(() => new Animated.Value(0.6))[0];
  // Respiration de l'orbe
  const breathe = useState(() => new Animated.Value(0.5))[0];
  // Ondes concentriques
  const ring1 = useState(() => new Animated.Value(0))[0];
  const ring2 = useState(() => new Animated.Value(0))[0];
  const ring3 = useState(() => new Animated.Value(0))[0];
  // Texte
  const textOpacity = useState(() => new Animated.Value(0))[0];
  const textRise = useState(() => new Animated.Value(14))[0];
  // Égalisateur (3 barres)
  const bar1 = useState(() => new Animated.Value(0.3))[0];
  const bar2 = useState(() => new Animated.Value(0.3))[0];
  const bar3 = useState(() => new Animated.Value(0.3))[0];

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.spring(orbScale, {
      toValue: 1,
      tension: 38,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // L'orbe respire, très lentement
    loops.push(
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0.5, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );

    // Trois ondes qui se propagent, décalées
    const ringLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(3000 - delay),
        ])
      );
    loops.push(ringLoop(ring1, 0), ringLoop(ring2, 1000), ringLoop(ring3, 2000));

    // Le titre apparaît en glissant
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(textRise, { toValue: 0, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();

    // Égalisateur : trois barres qui dansent doucement
    const barLoop = (anim: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.35, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    loops.push(barLoop(bar1, 550, 0), barLoop(bar2, 700, 180), barLoop(bar3, 620, 360));

    loops.forEach(l => l.start());

    // Sortie en douceur
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 650, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1.25, duration: 650, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]).start(() => onFinish());
    }, 2800);

    return () => {
      clearTimeout(timeout);
      loops.forEach(l => l.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderRing = (anim: Animated.Value, baseSize: number, tint: string) => {
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 2.4] });
    const opacity = anim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });
    return (
      <Animated.View
        style={[
          styles.ring,
          { width: baseSize, height: baseSize, borderRadius: baseSize / 2, borderColor: tint, transform: [{ scale }], opacity },
        ]}
      />
    );
  };

  const barHeight = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [6, 26] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.bg, theme.bg2, '#171331']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      >
        {/* Halo diffus derrière l'orbe */}
        <Animated.View style={[styles.halo, { opacity: breathe.interpolate({ inputRange: [0.5, 1], outputRange: [0.25, 0.55] }) }]} />

        {/* Ondes concentriques */}
        <View style={styles.rings}>
          {renderRing(ring1, 190, theme.halo)}
          {renderRing(ring2, 190, 'rgba(136, 113, 201, 0.3)')}
          {renderRing(ring3, 190, 'rgba(100, 125, 255, 0.22)')}
        </View>

        {/* Orbe centrale */}
        <Animated.View style={[styles.orbWrap, { opacity: fade, transform: [{ scale: orbScale }] }]}>
          <Animated.View style={{ transform: [{ scale: breathe.interpolate({ inputRange: [0.5, 1], outputRange: [1, 1.07] }) }] }}>
            <LinearGradient
              colors={[theme.blue, theme.violet, '#2A2A55']}
              style={styles.orb}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.orbInner} />
            </LinearGradient>
          </Animated.View>
          <View style={styles.orbEdge} />
        </Animated.View>

        {/* Titre + sous-titre + égalisateur */}
        <Animated.View style={[styles.textWrap, { opacity: fade }]}>
          <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textRise }] }}>
            <Text style={styles.title}>Serenity</Text>
            <Text style={styles.subtitle}>BIEN-ÊTRE SONORE</Text>
          </Animated.View>
          <Animated.View style={[styles.eqRow, { opacity: textOpacity }]}>
            <Animated.View style={[styles.eqBar, { height: barHeight(bar1) }]} />
            <Animated.View style={[styles.eqBar, { height: barHeight(bar2) }]} />
            <Animated.View style={[styles.eqBar, { height: barHeight(bar3) }]} />
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
  halo: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(100, 125, 255, 0.16)',
  },
  rings: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  orbWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 20,
  },
  orbInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232, 234, 242, 0.25)',
  },
  orbEdge: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(232, 234, 242, 0.2)',
  },
  textWrap: {
    position: 'absolute',
    bottom: '18%',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '300' as const,
    color: theme.text,
    letterSpacing: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: theme.textDim,
    letterSpacing: 5,
    textAlign: 'center',
    marginTop: 2,
  },
  eqRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 26,
    marginTop: 10,
  },
  eqBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: theme.blue,
    opacity: 0.85,
  },
});
