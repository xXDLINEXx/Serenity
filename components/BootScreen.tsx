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
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

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
      Animated.timing(wave1, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(wave2, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(wave3, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: true,
      })
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
  }, [fadeAnim, scaleAnim, logoOpacity, wave1, wave2, wave3, onFinish]);



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#1A2A4A', '#2A3A5A']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.wave,
            styles.wave1,
            {
              opacity: wave1.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.1],
              }),
              transform: [
                {
                  scale: wave1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 2],
                  }),
                },
              ],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.wave,
            styles.wave2,
            {
              opacity: wave2.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.1],
              }),
              transform: [
                {
                  scale: wave2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 2],
                  }),
                },
              ],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.wave,
            styles.wave3,
            {
              opacity: wave3.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 0.1],
              }),
              transform: [
                {
                  scale: wave3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 2],
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
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  wave1: {
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
  wave2: {
    borderColor: 'rgba(96, 165, 250, 0.5)',
  },
  wave3: {
    borderColor: 'rgba(147, 197, 253, 0.4)',
  },
});
