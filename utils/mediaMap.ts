export interface MediaItem {
  id: string;
  title: string;
  description: string;
  audioPath: any;
  videoPath: any;
  thumbnail: string;
}

export const mediaMap: MediaItem[] = [
  {
    id: 'ocean',
    title: 'Vagues de l\'Océan',
    description: 'Vagues rythmiques pour la relaxation',
    audioPath: require('../media/audio/ocean.mp3'),
    videoPath: require('../media/video/ocean.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&q=80',
  },
  {
    id: 'rain',
    title: 'Pluie Douce',
    description: 'Ambiance apaisante de la pluie',
    audioPath: require('../media/audio/rain.mp3'),
    videoPath: require('../media/video/rain.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&q=80',
  },
  {
    id: 'firecamp',
    title: 'Feu de Camp',
    description: 'Sons chaleureux du feu pour un sommeil profond',
    audioPath: require('../media/audio/firecamp.mp3'),
    videoPath: require('../media/video/firecamp.mp4'),
    thumbnail: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/vr26mlk4l6oqchaekmtwk',
  },
  {
    id: 'forest',
    title: 'Nuit en Forêt',
    description: 'Sons de la nature et grillons',
    audioPath: require('../media/audio/forest.mp3'),
    videoPath: require('../media/video/forest.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
  },
  {
    id: 'lake',
    title: 'Lac Paisible',
    description: 'Douces vagues et sons de l\'eau',
    audioPath: require('../media/audio/lake.mp3'),
    videoPath: require('../media/video/lake.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  },
  {
    id: 'wind',
    title: 'Vent Calme',
    description: 'Douce brise à travers les arbres',
    audioPath: require('../media/audio/wind.mp3'),
    videoPath: require('../media/video/wind.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=400&q=80',
  },
  {
    id: 'thunder',
    title: 'Tonnerre Lointain',
    description: 'Douce ambiance d\'orage',
    audioPath: require('../media/audio/thunder.mp3'),
    videoPath: require('../media/video/thunder.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&q=80',
  },
  {
    id: 'stream',
    title: 'Ruisseau de Montagne',
    description: 'Sons d\'eau qui coule',
    audioPath: require('../media/audio/stream.mp3'),
    videoPath: require('../media/video/stream.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1520869562399-e772f042f422?w=400&q=80',
  },
  {
    id: 'night',
    title: 'Ambiance Nocturne',
    description: 'Sons paisibles de la nuit',
    audioPath: require('../media/audio/night.mp3'),
    videoPath: require('../media/video/night.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&q=80',
  },
  {
    id: 'meditation',
    title: 'Cloches de Méditation',
    description: 'Tons de cloche apaisants',
    audioPath: require('../media/audio/meditation.mp3'),
    videoPath: require('../media/video/meditation.mp4'),
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
  },
];

export function getMediaById(id: string): MediaItem | undefined {
  return mediaMap.find(item => item.id === id);
}

export function getMediaIndex(id: string): number {
  return mediaMap.findIndex(item => item.id === id);
}

export function getNextMedia(currentId: string): MediaItem | undefined {
  const currentIndex = getMediaIndex(currentId);
  if (currentIndex === -1) return undefined;
  const nextIndex = (currentIndex + 1) % mediaMap.length;
  return mediaMap[nextIndex];
}

export function getPreviousMedia(currentId: string): MediaItem | undefined {
  const currentIndex = getMediaIndex(currentId);
  if (currentIndex === -1) return undefined;
  const prevIndex = currentIndex === 0 ? mediaMap.length - 1 : currentIndex - 1;
  return mediaMap[prevIndex];
}
