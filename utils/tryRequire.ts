import { Platform } from 'react-native';

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/media';

export function tryRequire(localPath: string): any {
  if (Platform.OS === 'web') {
    const fileName = localPath.replace('../media/', '');
    return { uri: `${CDN_BASE}/${fileName}` };
  }

  try {
    if (localPath.includes('/audio/')) {
      const filename = localPath.split('/audio/')[1].replace('.mp3', '');
      switch (filename) {
        case 'ocean':
        case 'vague-de-locean':
          return require('../media/audio/ocean.mp3');
        case 'rain':
        case 'pluie-douce':
          return require('../media/audio/rain.mp3');
        case 'firecamp':
        case 'feu-de-camp':
          return require('../media/audio/firecamp.mp3');
        case 'forest':
        case 'foret-paisible':
          return require('../media/audio/forest.mp3');
        case 'lake':
        case 'riviere-calme':
          return require('../media/audio/lake.mp3');
        case 'wind':
        case 'vent-leger':
          return require('../media/audio/wind.mp3');
        case 'thunder':
        case 'orage-apaisant':
          return require('../media/audio/thunder.mp3');
        case 'stream':
          return require('../media/audio/stream.mp3');
        case 'night':
          return require('../media/audio/night.mp3');
        case 'meditation':
        case 'bruit-blanc':
          return require('../media/audio/meditation.mp3');
        default:
          const fileName = localPath.replace('../media/', '');
          return { uri: `${CDN_BASE}/${fileName}` };
      }
    } else if (localPath.includes('/video/')) {
      const filename = localPath.split('/video/')[1].replace('.mp4', '');
      switch (filename) {
        case 'ocean':
        case 'vague-de-locean':
          return require('../media/video/ocean.mp4');
        case 'rain':
        case 'pluie-douce':
          return require('../media/video/rain.mp4');
        case 'firecamp':
        case 'feu-de-camp':
          return require('../media/video/firecamp.mp4');
        case 'forest':
        case 'foret-paisible':
          return require('../media/video/forest.mp4');
        case 'lake':
        case 'riviere-calme':
          return require('../media/video/lake.mp4');
        case 'wind':
        case 'vent-leger':
          return require('../media/video/wind.mp4');
        case 'thunder':
        case 'orage-apaisant':
          return require('../media/video/thunder.mp4');
        case 'stream':
          return require('../media/video/stream.mp4');
        case 'night':
          return require('../media/video/night.mp4');
        case 'meditation':
        case 'bruit-blanc':
          return require('../media/video/meditation.mp4');
        case 'frequence':
          return require('../media/video/frequence.mp4');
        default:
          const fileName = localPath.replace('../media/', '');
          return { uri: `${CDN_BASE}/${fileName}` };
      }
    } else if (localPath.includes('/frequency/')) {
      const filename = localPath.split('/frequency/')[1].replace('.mp3', '');
      switch (filename) {
        case '4-7hz-with-417hz-639hz':
          return require('../media/frequency/4-7hz-with-417hz-639hz.mp3');
        case '8-to-12-hz':
          return require('../media/frequency/8-to-12-hz.mp3');
        case '10hz':
          return require('../media/frequency/10hz.mp3');
        case '33hz':
          return require('../media/frequency/33hz.mp3');
        case '66hz':
          return require('../media/frequency/66hz.mp3');
        case '396-hz-417-hz-639hz':
          return require('../media/frequency/396-hz-417-hz-639hz.mp3');
        case '417hz':
          return require('../media/frequency/417hz.mp3');
        case '852hz':
          return require('../media/frequency/852hz.mp3');
        case '1441hz':
          return require('../media/frequency/1441hz.mp3');
        case '2772hz':
          return require('../media/frequency/2772hz.mp3');
        default:
          const fileName = localPath.replace('../media/', '');
          return { uri: `${CDN_BASE}/${fileName}` };
      }
    }

    const fileName = localPath.replace('../media/', '');
    return { uri: `${CDN_BASE}/${fileName}` };
  } catch {
    console.warn(`[tryRequire] Failed to require ${localPath}, falling back to CDN`);
    const fileName = localPath.replace('../media/', '');
    return { uri: `${CDN_BASE}/${fileName}` };
  }
}
