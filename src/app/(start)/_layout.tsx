import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';

export default function StartLayout() {
  return (
    <Stack screenOptions={{ statusBarStyle: useColorScheme() === 'dark' ? 'light' : 'dark', headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create_restaurant" options={{ title: '' }} />
    </Stack>
  );
}
