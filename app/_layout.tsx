import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="review-status" options={{ animation: 'fade' }} />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="jobs" />
        <Stack.Screen name="earnings" />
        <Stack.Screen name="live-location" />
        <Stack.Screen name="verify-customer" />
        <Stack.Screen name="location-verified" />
        <Stack.Screen name="complete-job" />
        <Stack.Screen name="profile" />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
