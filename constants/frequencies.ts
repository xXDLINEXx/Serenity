export interface HealingFrequency {
  id: string;
  frequency: number;
  title: string;
  description: string;
  color: string;
  audioUrl: string;
}

export const healingFrequencies: HealingFrequency[] = [
  {
    id: '174',
    frequency: 174,
    title: 'Réduit le stress',
    description: 'Fréquence de base qui aide à réduire le stress et la tension',
    color: '#8B5CF6',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '285',
    frequency: 285,
    title: 'Favorise la guérison',
    description: 'Aide à régénérer les tissus et favorise la guérison naturelle',
    color: '#A78BFA',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '396',
    frequency: 396,
    title: 'Libère les blocages cachés',
    description: 'Libère la culpabilité et les blocages émotionnels profonds',
    color: '#C4B5FD',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: '417',
    frequency: 417,
    title: 'Nettoie les traumatismes',
    description: 'Facilite le changement et nettoie les expériences traumatiques',
    color: '#DDD6FE',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: '432',
    frequency: 432,
    title: 'Harmonise le corps',
    description: 'Fréquence d\'harmonie naturelle avec l\'univers',
    color: '#E9D5FF',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: '528',
    frequency: 528,
    title: 'Répare le corps',
    description: 'Fréquence miracle qui répare l\'ADN et apporte la transformation',
    color: '#FAF5FF',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: '639',
    frequency: 639,
    title: 'Améliore les relations',
    description: 'Renforce les connexions et améliore les relations interpersonnelles',
    color: '#FDF4FF',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
  {
    id: '741',
    frequency: 741,
    title: 'Stimule l\'intuition',
    description: 'Éveille l\'intuition et favorise l\'expression de soi',
    color: '#FCE7F3',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  },
  {
    id: '852',
    frequency: 852,
    title: 'Éveille la spiritualité',
    description: 'Renforce l\'intuition spirituelle et la connexion au divin',
    color: '#FBCFE8',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  },
  {
    id: '963',
    frequency: 963,
    title: 'Connexion à l\'univers',
    description: 'Fréquence de l\'unité et de la connexion avec l\'énergie universelle',
    color: '#F9A8D4',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
  },
];
