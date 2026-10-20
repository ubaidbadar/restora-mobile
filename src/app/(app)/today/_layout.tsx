import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import TAB_STACK_OPTIONS from '@/constants/tab_stack_options';

export default function TodayLayout() {
  return (
    <Stack screenOptions={{ ...TAB_STACK_OPTIONS, statusBarStyle: useColorScheme() === 'dark' ? 'light' : 'dark' }}>
      <Stack.Screen name="index" options={{ title: 'Today', headerShown: false }} />
    </Stack>
  );
}
