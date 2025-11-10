// utils/tryRequire.ts
// Synchronisé avec soundsConfig.ts
// Gère automatiquement les chemins audio et vidéo pour SoundPlayer et FullscreenPlayer

export function getAudioSource(id: string) {
  switch (id) {
    case "pluie_douce":
      return require("../media/audio/pluie_douce.mp3");
    case "vent_foret":
      return require("../media/audio/vent_foret.mp3");
    case "vagues_mer":
      return require("../media/audio/vagues_mer.mp3");
    case "feu_crepitant":
      return require("../media/audio/feu_crepitant.mp3");
    case "rivière_calme":
      return require("../media/audio/riviere_calme.mp3");
    case "nuit_ete":
      return require("../media/audio/nuit_ete.mp3");
    case "chant_oiseaux":
      return require("../media/audio/chant_oiseaux.mp3");
    case "orage_lointain":
      return require("../media/audio/orage_lointain.mp3");
    case "vent_montagne":
      return require("../media/audio/vent_montagne.mp3");
    case "battement_coeur":
      return require("../media/audio/battement_coeur.mp3");
    case "frequence_432hz":
      return require("../media/frequency/432hz.mp3");
    case "frequence_528hz":
      return require("../media/frequency/528hz.mp3");
    case "frequence_639hz":
      return require("../media/frequency/639hz.mp3");
    case "frequence_741hz":
      return require("../media/frequency/741hz.mp3");
    case "frequence_852hz":
      return require("../media/frequency/852hz.mp3");
    case "bruit_blanc":
      return require("../media/audio/bruit_blanc.mp3");
    case "bruit_rose":
      return require("../media/audio/bruit_rose.mp3");
    case "bruit_marron":
      return require("../media/audio/bruit_marron.mp3");
    default:
      throw new Error(`Audio file not found: ${id}`);
  }
}

export function getVideoSource(id: string) {
  switch (id) {
    case "pluie_douce":
      return require("../media/video/pluie_douce.mp4");
    case "vent_foret":
      return require("../media/video/vent_foret.mp4");
    case "vagues_mer":
      return require("../media/video/vagues_mer.mp4");
    case "feu_crepitant":
      return require("../media/video/feu_crepitant.mp4");
    case "rivière_calme":
      return require("../media/video/riviere_calme.mp4");
    case "nuit_ete":
      return require("../media/video/nuit_ete.mp4");
    case "chant_oiseaux":
      return require("../media/video/chant_oiseaux.mp4");
    case "orage_lointain":
      return require("../media/video/orage_lointain.mp4");
    case "vent_montagne":
      return require("../media/video/vent_montagne.mp4");
    case "battement_coeur":
      return require("../media/video/battement_coeur.mp4");
    case "frequence_432hz":
      return require("../media/video/frequence_432hz.mp4");
    case "frequence_528hz":
      return require("../media/video/frequence_528hz.mp4");
    case "frequence_639hz":
      return require("../media/video/frequence_639hz.mp4");
    case "frequence_741hz":
      return require("../media/video/frequence_741hz.mp4");
    case "frequence_852hz":
      return require("../media/video/frequence_852hz.mp4");
    case "bruit_blanc":
      return require("../media/video/bruit_blanc.mp4");
    case "bruit_rose":
      return require("../media/video/bruit_rose.mp4");
    case "bruit_marron":
      return require("../media/video/bruit_marron.mp4");
    default:
      throw new Error(`Video file not found: ${id}`);
  }
}
