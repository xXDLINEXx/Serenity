import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface BootScreenProps {
  onFinish: () => void;
}

export function BootScreen({ onFinish }: BootScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  
  const waves = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      scaleAnim: new Animated.Value(0),
      opacityAnim: new Animated.Value(0.6),
    })),
  []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    waves.forEach((wave, index) => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(wave.scaleAnim, {
            toValue: 2.5,
            duration: 2500,
            delay: index * 600,
            useNativeDriver: true,
          }),
          Animated.timing(wave.opacityAnim, {
            toValue: 0,
            duration: 2500,
            delay: index * 600,
            useNativeDriver: true,
          }),
        ])
      ).start(() => {
        wave.scaleAnim.setValue(0);
        wave.opacityAnim.setValue(0.6);
      });
    });

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [fadeAnim, scaleAnim, logoOpacity, onFinish, waves]);



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d0d', '#1a1a2e', '#0d0d0d']}
        style={styles.gradient}
      >
        {waves.map((wave, index) => (
          <Animated.View
            key={wave.id}
            style={[
              styles.wave,
              {
                opacity: wave.opacityAnim,
                transform: [{ scale: wave.scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(147, 51, 234, 0.4)',
                'rgba(59, 130, 246, 0.4)',
                'rgba(147, 51, 234, 0.0)',
              ]}
              style={styles.waveGradient}
            />
          </Animated.View>
        ))}

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoShadow} />
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/uiamvomi7oant6plfs9c6' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: 400,
    height: 400,
  },
  logoShadow: {
    position: 'absolute',
    width: 400,
    height: 400,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 200,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  wave: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    overflow: 'hidden',
  },
  waveGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
});
