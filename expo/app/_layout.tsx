import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BootScreen } from "@/components/BootScreen";
import { engine } from "@/lib/engine";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="fullscreen-player"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
    void engine.init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView testID="gesture-root">
        <ErrorBoundary>
          <RootLayoutNav />
          {showBoot && <BootScreen onFinish={() => setShowBoot(false)} />}
        </ErrorBoundary>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
