import { useQuery } from "@tanstack/react-query";
import { SoundConfig } from "@/types/soundsConfig";

const CDN_URL = "https://cdn.jsdelivr.net/gh/xXDLINEXx/serenity/soundsConfig.json";

export const useSoundsConfig = () => {
  return useQuery<SoundConfig[]>({
    queryKey: ["sounds-config"],
    queryFn: async () => {
      console.log('[useSoundsConfig] Fetching from CDN:', CDN_URL);
      
      const response = await fetch(CDN_URL, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error(`Échec du chargement: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Format JSON invalide: tableau attendu");
      }

      console.log('[useSoundsConfig] Loaded', data.length, 'items from CDN');
      return data;
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });
};
