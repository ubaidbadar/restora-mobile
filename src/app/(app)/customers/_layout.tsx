import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import TAB_STACK_OPTIONS from '@/constants/tab_stack_options';

export default function CustomersLayout() {
  return (
    <Stack screenOptions={{ ...TAB_STACK_OPTIONS, statusBarStyle: useColorScheme() === 'dark' ? 'light' : 'dark' }}>
      <Stack.Screen name="index" options={{ title: 'Customers', headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
