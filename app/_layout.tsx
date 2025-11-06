import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AudioProvider } from "@/contexts/AudioContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BootScreen } from "@/components/BootScreen";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="debug-json" options={{ title: "Debug Local Config" }} />
      <Stack.Screen name="player" options={{ headerShown: false }} />
      <Stack.Screen name="cdn-player" options={{ headerShown: false }} />
      <Stack.Screen name="local-player" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleBootFinish = () => {
    setShowBoot(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView testID="gesture-root">
        <AudioProvider>
          <ErrorBoundary>
            <RootLayoutNav />
            {showBoot && <BootScreen onFinish={handleBootFinish} />}
          </ErrorBoundary>
        </AudioProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
