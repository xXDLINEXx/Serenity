import { useQuery } from "@tanstack/react-query";
import { SoundConfig } from "@/types/soundsConfig";

const CONFIG_URL = "https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/soundsConfig.json";

export const useSoundsConfig = () => {
  return useQuery<SoundConfig[]>({
    queryKey: ["sounds-config", CONFIG_URL],
    queryFn: async () => {
      console.log('[useSoundsConfig] Fetching from:', CONFIG_URL);
      
      const response = await fetch(CONFIG_URL, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        console.error('[useSoundsConfig] HTTP error:', response.status);
        throw new Error(`Failed to load JSON: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('[useSoundsConfig] Invalid format:', typeof data);
        throw new Error("Invalid JSON format: expected array");
      }

      console.log('[useSoundsConfig] Loaded', data.length, 'items');
      return data;
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });
};
