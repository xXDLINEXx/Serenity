# Mode Local - Serenity App

## 📦 Structure des fichiers

Ton app fonctionne maintenant en **mode 100% local/offline**, comme Netflix téléchargé !

### Fichiers créés/modifiés :

#### 1. `/constants/soundsConfig.ts`
- **Contient** : Liste complète des sons et fréquences avec `require()` pour les assets locaux
- **Format** : `audio: require("../media/audio/vent-leger.mp3")`
- **Plus de CDN** : Tous les chemins utilisent `require()` au lieu d'URLs

#### 2. `/types/soundsConfig.ts`
- **Modifié** : `audio` et `video` sont maintenant de type `number` (asset ID from require)
- **Avant** : `audio?: string | null`
- **Après** : `audio?: number | null`

#### 3. `/components/SoundList.tsx`
- Nouveau composant qui affiche la liste des sons/fréquences
- Utilise `soundsConfig` directement (pas de fetch)
- Pas d'état de chargement async, tout est synchrone

#### 4. `/components/SoundPlayer.tsx`
- **Modifié** : Joue les assets locaux avec `Audio.Sound.createAsync(audioAsset, ...)`
- **Vidéo** : Full-screen en arrière-plan avec `VideoView` + loop activé
- **Audio** : Loop activé, volume control, play/pause/stop

#### 5. `/app/local-player.tsx`
- Nouvelle page pour le mode local
- Combine `<SoundList />` + `<SoundPlayer />`
- Navigation simple : liste → lecteur → retour

#### 6. `/app/index.tsx`
- **Ajouté** : Bouton vert "LOCAL" pour ouvrir `/local-player`
- **Conservé** : Bouton "CDN" pour l'ancien mode en ligne

---

## 🎯 Structure des media attendue

```
/media
  /audio
    - vent-leger.mp3
    - vague-de-locean.mp3
    - riviere-calme.mp3
    - pluie-douce.mp3
    - orage-apaisant.mp3
    - feu-de-camp.mp3
  /video
    - vent-leger.mp4
    - vague-de-locean.mp4
    - riviere-calme.mp4
    - pluie-douce.mp4
    - orage-apaisant.mp4
    - feu-de-camp.mp4
  /frequency
    - 4-7hz.mp3
    - 8-12hz.mp3
    - 10hz.mp3
    - 33hz.mp3
    - 66hz.mp3
    - 396hz.mp3
    - 417hz.mp3
    - 528hz.mp3
    - 852hz.mp3
    - 1441hz.mp3
    - 2772hz.mp3
    - frequence.mp4  (vidéo commune pour toutes les fréquences)
```

---

## 🚀 Comment utiliser

1. **Ajoute tes fichiers media** dans les dossiers `/media/audio/`, `/media/video/`, `/media/frequency/`

2. **Lance l'app** :
   ```bash
   npm start
   # ou
   bun start
   ```

3. **Clique sur le bouton vert "LOCAL"** dans l'écran d'accueil

4. **Sélectionne un son ou une fréquence** dans la liste

5. **Profite** :
   - ✅ Audio en loop
   - ✅ Vidéo full-screen en arrière-plan (loop)
   - ✅ Contrôles : Play/Pause/Stop/Volume
   - ✅ Tout fonctionne offline !

---

## 🔥 Différences CDN vs Local

| Feature | CDN Mode | Local Mode |
|---------|----------|------------|
| **Internet** | ✅ Requis | ❌ Pas besoin |
| **Chargement** | Async fetch | Synchrone (require) |
| **Vidéos** | Streamées | Embarquées dans l'app |
| **Assets** | URLs jsDelivr | Fichiers locaux |
| **Taille app** | Légère | Plus lourde (+ media) |

---

## ⚙️ Personnalisation

### Ajouter un nouveau son :

1. **Ajoute les fichiers** :
   - `/media/audio/mon-nouveau-son.mp3`
   - `/media/video/mon-nouveau-son.mp4`

2. **Modifie** `/constants/soundsConfig.ts` :
   ```typescript
   {
     title: "Mon nouveau son",
     type: "sound",
     audio: require("../media/audio/mon-nouveau-son.mp3"),
     video: require("../media/video/mon-nouveau-son.mp4"),
     description: "Description ici"
   }
   ```

3. **C'est tout** ! Le son apparaîtra automatiquement dans la liste.

---

## 🐛 Debug

Si ça ne marche pas :

1. **Vérifie que les fichiers existent** : `/media/audio/*.mp3` et `/media/video/*.mp4`
2. **Regarde les logs** : `console.log` dans `SoundPlayer.tsx`
3. **Vérifie les chemins** : Les chemins dans `require()` doivent être relatifs et corrects
4. **Rebuild** : Parfois Metro bundler doit redémarrer : `r` dans le terminal

---

## 📝 Notes importantes

- **Expo Go** : Compatible ! Les assets locaux sont bundlés avec le JS
- **Web** : Marche aussi avec React Native Web
- **Build** : Les media seront inclus dans le build .apk/.ipa

---

Profite bien de ton app Serenity en mode offline ! 🎧✨
