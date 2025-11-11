import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { soundsConfig } from '@/constants/soundsConfig';

export default function MediaDiagnosticScreen() {
  const [testResults, setTestResults] = useState<Record<string, {
    audio: string;
    video: string;
    audioStatus: 'pending' | 'success' | 'error';
    videoStatus: 'pending' | 'success' | 'error';
  }>>({});

  const testMedia = async (id: string, audio: any, video: any) => {
    console.log(`[Diagnostic] Testing ${id}`);
    console.log(`[Diagnostic] Audio value:`, audio);
    console.log(`[Diagnostic] Video value:`, video);

    setTestResults(prev => ({
      ...prev,
      [id]: {
        audio: JSON.stringify(audio),
        video: JSON.stringify(video),
        audioStatus: 'pending',
        videoStatus: 'pending',
      }
    }));

    const audioResult = await testSource(audio);
    const videoResult = await testSource(video);

    setTestResults(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        audioStatus: audioResult ? 'success' : 'error',
        videoStatus: videoResult ? 'success' : 'error',
      }
    }));
  };

  const testSource = async (src: any): Promise<boolean> => {
    if (!src) return false;

    if (typeof src === 'number') {
      return true;
    }

    if (typeof src === 'object' && 'uri' in src && src.uri) {
      try {
        const response = await fetch(src.uri, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    }

    if (typeof src === 'string') {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    }

    return false;
  };

  const testAll = () => {
    soundsConfig.forEach(media => {
      testMedia(media.id, media.audio, media.video);
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Media Diagnostic' }} />
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity style={styles.button} onPress={testAll}>
          <Text style={styles.buttonText}>Test All Media</Text>
        </TouchableOpacity>

        {soundsConfig.map(media => {
          const result = testResults[media.id];
          return (
            <View key={media.id} style={styles.mediaItem}>
              <Text style={styles.mediaTitle}>{media.title}</Text>
              <Text style={styles.mediaId}>ID: {media.id}</Text>
              
              {result ? (
                <>
                  <View style={styles.resultRow}>
                    <Text style={styles.label}>Audio:</Text>
                    <Text style={[
                      styles.status,
                      result.audioStatus === 'success' && styles.statusSuccess,
                      result.audioStatus === 'error' && styles.statusError,
                    ]}>
                      {result.audioStatus}
                    </Text>
                  </View>
                  <Text style={styles.value} numberOfLines={2}>{result.audio}</Text>

                  <View style={styles.resultRow}>
                    <Text style={styles.label}>Video:</Text>
                    <Text style={[
                      styles.status,
                      result.videoStatus === 'success' && styles.statusSuccess,
                      result.videoStatus === 'error' && styles.statusError,
                    ]}>
                      {result.videoStatus}
                    </Text>
                  </View>
                  <Text style={styles.value} numberOfLines={2}>{result.video}</Text>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={() => testMedia(media.id, media.audio, media.video)}
                >
                  <Text style={styles.testButtonText}>Test This</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  mediaItem: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  mediaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  mediaId: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600' as const,
    width: 60,
  },
  status: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  statusSuccess: {
    color: '#10B981',
  },
  statusError: {
    color: '#EF4444',
  },
  value: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 60,
  },
  testButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
