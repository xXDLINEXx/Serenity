// Thème Serenity — conçu pour la nuit
export const theme = {
  bg: '#07090F',
  bg2: '#0D111B',
  card: '#141A27',
  cardElevated: '#1B2233',
  blue: '#647DFF',
  violet: '#8871C9',
  text: '#E8EAF2',
  textDim: '#8790A5',
  border: 'rgba(100, 125, 255, 0.18)',
  halo: 'rgba(100, 125, 255, 0.35)',
} as const;

export type Theme = typeof theme;
