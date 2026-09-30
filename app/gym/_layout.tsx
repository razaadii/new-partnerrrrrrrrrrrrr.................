import { Stack } from 'expo-router';
import React from 'react';

export default function GymLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Primary Tab Screens: Smooth crossfade transitions */}
      <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
      <Stack.Screen name="members" options={{ animation: 'fade' }} />
      <Stack.Screen name="attendance" options={{ animation: 'fade' }} />
      <Stack.Screen name="payments" options={{ animation: 'fade' }} />
      <Stack.Screen name="profile" options={{ animation: 'fade' }} />

      {/* Sub-screens / Detail Pages: Slide smoothly from right */}
      <Stack.Screen
        name="member-detail"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="plans"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="timings"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
