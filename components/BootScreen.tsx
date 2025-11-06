import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface BootScreenProps {
  onFinish: () => void;
}

export function BootScreen({ onFinish }: BootScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;
  const particle3Y = useRef(new Animated.Value(0)).current;
  const particle4Y = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particle1Y, {
          toValue: -150,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(particle1Y, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particle2Y, {
          toValue: -200,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(particle2Y, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particle3Y, {
          toValue: -180,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(particle3Y, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particle4Y, {
          toValue: -220,
          duration: 5500,
          useNativeDriver: true,
        }),
        Animated.timing(particle4Y, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2500);

    return () => {
      clearTimeout(timeout);
    };
  }, [fadeAnim, scaleAnim, logoOpacity, glow, particle1Y, particle2Y, particle3Y, particle4Y, rotate, onFinish]);



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#1A2A4A', '#2A3A5A']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.particle,
            {
              left: '20%',
              bottom: 100,
              opacity: particle1Y.interpolate({
                inputRange: [-150, 0],
                outputRange: [0, 0.6],
              }),
              transform: [{ translateY: particle1Y }],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.particle,
            {
              left: '60%',
              bottom: 80,
              opacity: particle2Y.interpolate({
                inputRange: [-200, 0],
                outputRange: [0, 0.4],
              }),
              transform: [{ translateY: particle2Y }],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.particle,
            {
              left: '75%',
              bottom: 120,
              opacity: particle3Y.interpolate({
                inputRange: [-180, 0],
                outputRange: [0, 0.5],
              }),
              transform: [{ translateY: particle3Y }],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.particle,
            {
              left: '35%',
              bottom: 90,
              opacity: particle4Y.interpolate({
                inputRange: [-220, 0],
                outputRange: [0, 0.7],
              }),
              transform: [{ translateY: particle4Y }],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.glowCircle,
            {
              opacity: glow.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
              transform: [
                {
                  scale: glow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
                {
                  rotate: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
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
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: 400,
    height: 400,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  glowCircle: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: 'transparent',
  },
});
