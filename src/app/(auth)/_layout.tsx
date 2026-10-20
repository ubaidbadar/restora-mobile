import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ statusBarStyle: useColorScheme() === 'dark' ? 'light' : 'dark', headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal', headerTitle: '' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
