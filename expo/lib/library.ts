/**
 * Bibliothèque de sons d'ambiance pour l'explorateur et le mixeur.
 * Tous les fichiers sont locaux (require) → 100 % hors ligne.
 * Pour intégrer d'autres sons libres de droits : ajoutez le fichier
 * dans /media/audio puis une entrée ici.
 */
import { CloudRain, CloudLightning, Trees, Waves, Wind, Flame, Circle, Waves as PinkIcon, CircleDot } from 'lucide-react-native';

export interface LibrarySound {
  id: string;
  title: string;
  subtitle: string;
  audio: number;
  gradient: [string, string];
  icon: typeof CloudRain;
}

export const soundLibrary: LibrarySound[] = [
  {
    id: 'pluie',
    title: 'Pluie',
    subtitle: 'Averse douce et régulière',
    audio: require('../media/audio/pluie-douce.mp3'),
    gradient: ['#16283F', '#0D1420'],
    icon: CloudRain,
  },
  {
    id: 'orage',
    title: 'Orage',
    subtitle: 'Tonnerre lointain apaisant',
    audio: require('../media/audio/orage-apaisant.mp3'),
    gradient: ['#1E1E3C', '#141126'],
    icon: CloudLightning,
  },
  {
    id: 'foret',
    title: 'Forêt',
    subtitle: 'Oiseaux et feuillage',
    audio: require('../media/audio/foret-paisible.mp3'),
    gradient: ['#1C3D26', '#12261A'],
    icon: Trees,
  },
  {
    id: 'ocean',
    title: 'Océan',
    subtitle: 'Vagues au rythme lent',
    audio: require('../media/audio/vague-de-locean.mp3'),
    gradient: ['#0F3D52', '#0A1F2B'],
    icon: Waves,
  },
  {
    id: 'vent',
    title: 'Vent',
    subtitle: 'Souffle léger et aérien',
    audio: require('../media/audio/vent-leger.mp3'),
    gradient: ['#1F4247', '#122A2E'],
    icon: Wind,
  },
  {
    id: 'feu',
    title: 'Feu de cheminée',
    subtitle: 'Flamme chaleureuse',
    audio: require('../media/audio/feu-de-camp.mp3'),
    gradient: ['#4A1F0A', '#26120A'],
    icon: Flame,
  },
  {
    id: 'bruit-blanc',
    title: 'Bruit blanc',
    subtitle: 'Statique uniforme',
    audio: require('../media/audio/bruit-blanc.mp3'),
    gradient: ['#2A2F3D', '#171B24'],
    icon: Circle,
  },
  {
    id: 'bruit-rose',
    title: 'Bruit rose',
    subtitle: 'Plus grave, très reposant',
    audio: require('../media/audio/bruit-rose.mp3'),
    gradient: ['#3A2A4D', '#1E1430'],
    icon: PinkIcon,
  },
  {
    id: 'bruit-brun',
    title: 'Bruit brun',
    subtitle: 'Profond, comme une chute d eau',
    audio: require('../media/audio/bruit-brun.mp3'),
    gradient: ['#26201A', '#141009'],
    icon: CircleDot,
  },
];
