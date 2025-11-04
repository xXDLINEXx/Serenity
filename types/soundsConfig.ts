export interface SoundConfig {
  title: string;
  type: string;
  audio?: string | null;
  video?: string | null;
  frequency?: string | null;
  description?: string | null;
  benefits?: string | null;
}

export type SoundsConfig = SoundConfig[];
