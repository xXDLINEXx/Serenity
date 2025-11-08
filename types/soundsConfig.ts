export interface SoundConfig {
  id: string;
  title: string;
  type: string;
  audio?: string | number | null;
  video?: string | number | null;
  frequency?: string | null;
  description?: string | null;
  benefits?: string | null;
}

export type SoundsConfig = SoundConfig[];
