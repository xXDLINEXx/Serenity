# 🎵 Tutoriel d'utilisation - Serenity CDN Player

## 📋 Vue d'ensemble

Votre application SERENITY charge maintenant les sons depuis votre repository GitHub via jsDelivr CDN. Ce système permet de gérer tous vos médias (audio, vidéo, fréquences) de manière centralisée.

## 🔧 Architecture

### 1. Structure du Repository GitHub

```
serenity/
├── media/
│   ├── audio/
│   │   ├── pluie-douce.mp3
│   │   ├── vent-leger.mp3
│   │   └── ...
│   ├── video/
│   │   ├── pluie-douce.mp4
│   │   ├── vent-leger.mp4
│   │   └── frequence.mp4  (vidéo commune pour toutes les fréquences)
│   └── frequency/
│       ├── 528hz.mp3
│       └── ...
└── soundsConfig.ts  (fichier de configuration)
```

### 2. Format du fichier `soundsConfig.ts`

```typescript
export const soundsConfig = [
  {
    title: "Pluie douce",
    audio: "https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/media/audio/pluie-douce.mp3",
    video: "https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/media/video/pluie-douce.mp4",
    description: "Son relaxant de pluie",
    frequency: null,
  },
  {
    title: "Vent léger",
    audio: "https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/media/audio/vent-leger.mp3",
    video: "https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/media/video/vent-leger.mp4",
    description: "Brise douce et apaisante",
    frequency: null,
  },
  {
    title: "528 Hz - Fréquence de l'amour",
    audio: null,
    video: null,
    frequency: "https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/media/frequency/528hz.mp3",
    description: "Fréquence de guérison",
    benefits: "Réparation ADN, transformation, amour",
  },
];
```

### 3. Types TypeScript

```typescript
interface SoundConfig {
  title: string;
  audio?: string | null;      // URL vers fichier audio
  video?: string | null;       // URL vers fichier vidéo
  frequency?: string | null;   // URL vers fichier fréquence
  description?: string;        // Description courte
  benefits?: string;           // Bienfaits (pour fréquences)
}
```

## 🚀 Utilisation

### Accéder au CDN Player

1. Ouvrez l'application SERENITY
2. Sur l'écran d'accueil, cliquez sur le bouton **"CDN"** en haut à droite
3. La liste des sons chargés depuis GitHub s'affiche

### Jouer un son

1. Parcourez la liste des sons disponibles
2. Cliquez sur une carte de son
3. Le player s'ouvre en plein écran
4. Utilisez les contrôles :
   - **▶** : Lecture / Pause
   - **⏮** : Recommencer
   - **✕** : Arrêter et fermer
   - **🔊** : Contrôle du volume
   - **🔇** : Activer/désactiver le son

### Types de médias supportés

#### 1. Sons relaxants (audio + vidéo)
- Audio et vidéo jouent ensemble en boucle
- Nom de fichier identique : `pluie-douce.mp3` + `pluie-douce.mp4`

#### 2. Fréquences régénérantes (frequency + vidéo commune)
- Utilise le fichier audio de fréquence
- Vidéo commune `frequence.mp4` pour toutes les fréquences
- Affiche les bienfaits de la fréquence

## 🔄 Mise à jour des sons

### Option 1 : Modifier soundsConfig.ts

1. Allez sur GitHub : https://github.com/xXDLINEXx/serenity
2. Éditez `soundsConfig.ts`
3. Ajoutez/modifiez/supprimez des entrées
4. Commit les changements
5. Attendez 1-2 minutes (cache CDN)
6. Relancez l'app ou tirez pour rafraîchir

### Option 2 : Ajouter de nouveaux fichiers

1. Uploadez vos fichiers audio/vidéo dans les dossiers appropriés
2. Mettez à jour `soundsConfig.ts` avec les nouvelles URLs
3. Les URLs utilisent ce format :
   ```
   https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/media/[type]/[filename]
   ```

## 🎨 Fonctionnalités

### ✅ Implémenté

- Chargement depuis jsDelivr CDN
- Affichage liste avec miniatures
- Player avec contrôles complets
- Lecture en boucle audio/vidéo
- Gestion du volume
- Support audio + vidéo synchronisés
- Support fréquences + vidéo commune
- Préchargement optimisé
- Gestion erreurs robuste
- Retry automatique
- Cache React Query (30 min)

### 🔧 Composants

#### `useSoundsConfig` (hook)
- Charge le fichier de configuration depuis CDN
- Parse le TypeScript vers JSON
- Cache les résultats
- Retry automatique en cas d'erreur

#### `<SoundList />` (composant)
- Affiche tous les sons disponibles
- Sépare sons relaxants et fréquences
- Miniatures personnalisées
- États de chargement/erreur

#### `<SoundPlayer />` (composant)
- Lecteur audio/vidéo complet avec **expo-av** et **expo-video**
- **Vidéo en plein écran** avec overlay transparent
- Contrôles : lecture, pause, stop, restart
- Contrôle du volume avec slider visuel
- Affichage des infos (titre, description, bienfaits)
- Gestion des erreurs de chargement
- **Synchronisation parfaite** audio/vidéo

## 📝 Notes techniques

### URLs supportées

Le hook `useSoundsConfig` accepte les formats :
```typescript
// Format 1 : export const
export const soundsConfig = [...]

// Format 2 : export default
export default [...]
```

### Cache et performances

- **Cache React Query** : 30 minutes
- **Garbage collection** : 60 minutes
- **Retry** : 3 tentatives avec backoff exponentiel
- **Préchargement** : Audio chargé à la demande

### Compatibilité web

- ✅ Fonctionne sur mobile (iOS/Android)
- ✅ Fonctionne sur web (React Native Web)
- ✅ Pas de dépendances natives spécifiques

## 🐛 Résolution de problèmes

### Le fichier ne charge pas

1. Vérifiez que `soundsConfig.ts` est accessible :
   ```
   https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/soundsConfig.ts
   ```
2. Vérifiez le format du fichier (doit être valide TypeScript)
3. Attendez la purge du cache CDN (1-2 minutes)

### Audio ne joue pas

1. Vérifiez que les URLs des fichiers sont correctes
2. Testez les URLs directement dans le navigateur
3. Vérifiez que les fichiers sont bien uploadés sur GitHub
4. Regardez les logs console : `[SoundPlayer]`

### Vidéo ne s'affiche pas

1. Vérifiez que les URLs des vidéos sont correctes
2. Testez les URLs directement dans le navigateur
3. Vérifiez que les fichiers vidéo sont uploadés sur GitHub
4. Regardez les logs console : `[SoundPlayer] Loading video from:`

## ✨ Fonctionnalités avancées

### Lecture simultanée Audio + Vidéo

- ✅ **Audio** : Expo AV avec loop automatique
- ✅ **Vidéo** : Expo Video en plein écran avec loop
- ✅ **Synchronisation** : Les deux se lancent ensemble
- ✅ **Contrôles** : Play/Pause contrôle les deux médias simultanément

### Vidéo en arrière-plan

- La vidéo s'affiche en **plein écran** avec un overlay semi-transparent
- Les contrôles et infos sont affichés par-dessus
- Si aucune vidéo n'est disponible, un gradient coloré est affiché

## 🎯 Prochaines étapes

1. **Ajouter animations** pendant la lecture
2. **Implémenter favoris** (stockage local)
3. **Ajouter timer de sommeil** dans le CDN player
4. **Préchargement avancé** des prochains sons
5. **Ajouter playlists personnalisées**

## 📚 Ressources

- Repository GitHub : https://github.com/xXDLINEXx/serenity
- jsDelivr CDN : https://www.jsdelivr.com/
- Expo AV Docs : https://docs.expo.dev/versions/latest/sdk/av/
- React Query Docs : https://tanstack.com/query/latest

---

**✨ Profitez de votre application de relaxation !**
