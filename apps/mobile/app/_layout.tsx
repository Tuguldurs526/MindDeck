// apps/mobile/app/_layout.tsx
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: "#020617" }}>
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
