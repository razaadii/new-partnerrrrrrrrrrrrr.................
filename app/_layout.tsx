import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Splash & Auth Screens */}
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="verify-otp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="review-status" options={{ animation: 'fade' }} />

        {/* Gym Partner Nested Stack Layout */}
        <Stack.Screen name="gym" options={{ headerShown: false, animation: 'fade' }} />

        {/* Service Partner Main Tab Screens (Smooth fade transitions) */}
        <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
        <Stack.Screen name="jobs" options={{ animation: 'fade' }} />
        <Stack.Screen name="earnings" options={{ animation: 'fade' }} />
        <Stack.Screen name="profile" options={{ animation: 'fade' }} />

        {/* Service Partner Flow Sub-screens */}
        <Stack.Screen name="live-location" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="verify-customer" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="location-verified" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="complete-job" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
