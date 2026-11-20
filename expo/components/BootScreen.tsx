import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { theme } from '@/lib/theme';

const { width, height } = Dimensions.get('window');

const LOGO_MARK = require('../assets/images/logo-mark-noir.png');

interface BootScreenProps {
  onFinish: () => void;
}

/**
 * Écran de démarrage Serenity — fond noir pur, le logo (lune, étoiles,
 * égalisateur) se dépose en douceur, respire légèrement, puis s'efface.
 */
export function BootScreen({ onFinish }: BootScreenProps) {
  // Entrée / sortie
  const fade = useState(() => new Animated.Value(0))[0];
  const logoScale = useState(() => new Animated.Value(0.82))[0];
  const logoBreath = useState(() => new Animated.Value(1))[0];
  const wordOpacity = useState(() => new Animated.Value(0))[0];
  const wordRise = useState(() => new Animated.Value(12))[0];
  const exitScale = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    // Fondu d'entrée
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Le logo se dépose avec un léger rebond
    Animated.spring(logoScale, {
      toValue: 1,
      tension: 40,
      friction: 9,
      delay: 150,
      useNativeDriver: true,
    }).start();

    // Respiration très subtile du logo
    loops.push(
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoBreath, { toValue: 1.035, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(logoBreath, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );

    // Le mot-symbole glisse vers le haut et apparaît
    Animated.sequence([
      Animated.delay(750),
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 850, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(wordRise, { toValue: 0, duration: 850, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();

    loops.forEach(l => l.start());

    // Sortie : fondu + très léger zoom
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 600, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(exitScale, { toValue: 1.05, duration: 600, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start(() => onFinish());
    }, 3000);

    return () => {
      clearTimeout(timeout);
      loops.forEach(l => l.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.stage, { opacity: fade, transform: [{ scale: exitScale }] }]}>
          {/* Logo : lune + étoiles + égalisateur */}
          <Animated.View style={{ transform: [{ scale: Animated.multiply(logoScale, logoBreath) }] }}>
            <Animated.Image source={LOGO_MARK} style={[styles.logo, { opacity: fade }]} resizeMode="contain" />
          </Animated.View>

          {/* Mot-symbole */}
          <Animated.View style={{ opacity: wordOpacity, transform: [{ translateY: wordRise }] }}>
            <Text style={styles.wordmark}>Serenity</Text>
            <Text style={styles.tagline}>sons · fréquences · sommeil</Text>
          </Animated.View>
        </Animated.View>
      </View>
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
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  stage: {
    alignItems: 'center',
  },
  logo: {
    width: 210,
    height: 210,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '300' as const,
    color: theme.text,
    letterSpacing: 7,
    textAlign: 'center',
    marginTop: 18,
  },
  tagline: {
    fontSize: 11,
    color: theme.textDim,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 10,
  },
});
