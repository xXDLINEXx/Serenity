import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Music, Radio } from 'lucide-react-native';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container} testID="home-screen">
      <View style={{ backgroundColor: '#000000', height: insets.top }} />
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sélectionnez votre ambiance</Text>
        </View>
        
        <View style={styles.menuContainer}>
          <MenuCard
            icon={Music}
            title="Sons Ambiance"
            description="Pluie, océan, forêt et plus"
            colors={['#1E3A8A', '#3B82F6']}
            onPress={() => router.push('/local-player')}
          />
          
          <MenuCard
            icon={Radio}
            title="Fréquences de Guérison"
            description="Ondes binaurales et Solfège"
            colors={['#581C87', '#7C3AED']}
            onPress={() => router.push('/cdn-player')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function MenuCard({
  icon: Icon,
  title,
  description,
  colors,
  onPress,
}: {
  icon: any;
  title: string;
  description: string;
  colors: [string, string];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors[0] }]}>
        <Icon size={32} color="#FFFFFF" strokeWidth={2} />
      </View>
      <View style={styles.menuCardContent}>
        <Text style={styles.menuCardTitle}>{title}</Text>
        <Text style={styles.menuCardDescription}>{description}</Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCardContent: {
    flex: 1,
    gap: 4,
  },
  menuCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  menuCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  arrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '300' as const,
  },
});
