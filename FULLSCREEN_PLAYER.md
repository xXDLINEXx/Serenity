# 🎬 Lecteur Audio/Vidéo Fullscreen - Serenity

## 📂 Structure des fichiers

### Fichiers créés/modifiés :
1. **`utils/mediaMap.ts`** - Mapping des fichiers audio/vidéo locaux
2. **`components/FullScreenPlayer.tsx`** - Composant du lecteur fullscreen
3. **`app/fullscreen-player.tsx`** - Route Expo Router pour le lecteur
4. **`components/SoundCard.tsx`** - Modifié pour ouvrir le lecteur au clic
5. **`app/_layout.tsx`** - Configuration de la route en modal fullscreen

## 📁 Organisation des médias

Vos médias doivent être placés dans `/media` :
```
/media
  /audio
    - ocean.mp3
    - rain.mp3
    - firecamp.mp3
    - forest.mp3
    - lake.mp3
    - wind.mp3
    - thunder.mp3
    - stream.mp3
    - night.mp3
    - meditation.mp3
  /video
    - ocean.mp4
    - rain.mp4
    - firecamp.mp4
    - forest.mp4
    - lake.mp4
    - wind.mp4
    - thunder.mp4
    - stream.mp4
    - night.mp4
    - meditation.mp4
```

**Important :** Chaque son doit avoir un fichier audio ET vidéo avec exactement le même nom.

## 🎮 Fonctionnalités du lecteur

### Lecture automatique
- Au clic sur une carte sonore, le lecteur s'ouvre en fullscreen
- La vidéo démarre automatiquement (muted, loop)
- L'audio démarre simultanément (non muted, loop)

### Contrôles disponibles

#### 🔊 Volume
- Slider pour ajuster le volume de l'audio (0-100%)
- Icône Volume2 pour identification

#### 🔆 Luminosité
- Slider pour ajuster la luminosité de l'appareil (0-100%)
- Utilise expo-brightness
- **Uniquement sur mobile** (pas sur web)

#### ⏮️ Précédent
- Bouton avec icône SkipBack
- Charge le média précédent dans la liste

#### ⏭️ Suivant
- Bouton avec icône SkipForward
- Charge le média suivant dans la liste

#### ⏹️ Stop
- Grand bouton rouge central
- Arrête l'audio ET la vidéo
- Ferme le lecteur et retourne à l'écran précédent

### Interface
- **Tap sur l'écran** : Affiche/Masque les contrôles (auto-hide après 4 secondes)
- **Vidéo en arrière-plan** : Plein écran, cover le contenu
- **StatusBar** : Masquée pour une expérience immersive
- **Overlay transparent** : Contrôles avec fond semi-transparent

## 🔧 Intégration dans votre code

### Modifier mediaMap.ts si nécessaire
Si vous ajoutez/supprimez des sons, éditez `utils/mediaMap.ts` :

```typescript
export const mediaMap: MediaItem[] = [
  {
    id: 'nouveau-son',
    title: 'Nouveau Son',
    description: 'Description du nouveau son',
    audioPath: require('../media/audio/nouveau-son.mp3'),
    videoPath: require('../media/video/nouveau-son.mp4'),
    thumbnail: 'https://...',
  },
  // ...
];
```

### Ouvrir le lecteur programmatiquement
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push(\`/fullscreen-player?mediaId=\${mediaId}\`);
```

## 🎨 Personnalisation

### Styles
Les styles sont dans `components/FullScreenPlayer.tsx` :
- Couleurs des boutons
- Taille des contrôles
- Opacité de l'overlay
- Animations fade

### Comportement
Variables modifiables :
- **Auto-hide delay** : 4000ms (ligne 91)
- **Fade duration** : 300ms (ligne 79)
- **Volume initial** : 1.0 (ligne 33)
- **Luminosité initiale** : 0.5 (ligne 34)

## 🔄 Navigation circulaire

Le système implémente une navigation circulaire :
- **Suivant** depuis le dernier média → Retourne au premier
- **Précédent** depuis le premier média → Va au dernier

## 🐛 Debugging

Des logs sont présents pour le debugging :
```
[FullScreenPlayer] Loading media: ocean
[FullScreenPlayer] Audio started
[FullScreenPlayer] Video started
[FullScreenPlayer] Next media: rain
[SoundCard] Opening fullscreen player for: ocean
```

## 📦 Dépendances ajoutées

```json
{
  "expo-brightness": "^13.x.x",
  "@react-native-community/slider": "^4.x.x"
}
```

## ⚠️ Notes importantes

1. **React Native Web** : expo-brightness ne fonctionne pas sur web (conditionnel avec Platform.OS)
2. **Permissions** : expo-brightness peut nécessiter des permissions sur certains appareils
3. **Mémoire** : Les vidéos sont chargées/déchargées à chaque changement pour optimiser la mémoire
4. **Audio Mode** : Configuré pour jouer même en mode silencieux (iOS)

## 🎯 Ce qui reste à faire

✅ Lecteur fullscreen avec vidéo + audio synchronisés
✅ Contrôles : Stop, Next, Previous
✅ Sliders : Volume, Luminosité
✅ Navigation circulaire
✅ Auto-hide des contrôles
✅ Integration avec SoundCard

Votre application est maintenant prête ! 🎉
