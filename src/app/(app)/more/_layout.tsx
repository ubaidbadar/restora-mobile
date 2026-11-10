import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import TAB_STACK_OPTIONS from '@/constants/tab_stack_options';

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ ...TAB_STACK_OPTIONS, statusBarStyle: useColorScheme() === 'dark' ? 'light' : 'dark' }}>
      <Stack.Screen name="index" options={{ title: 'More', headerShown: false }} />
      <Stack.Screen name="menu" options={{ title: 'Menu' }} />
      <Stack.Screen name="reservations" options={{ title: 'Reservations' }} />
      <Stack.Screen name="staff" options={{ title: 'Staff' }} />
      <Stack.Screen name="printers" options={{ title: 'Printers' }} />
      <Stack.Screen name="whatsapp" options={{ title: 'WhatsApp inbox' }} />
      <Stack.Screen name="whatsapp-thread" options={{ title: 'WhatsApp' }} />
    </Stack>
  );
}
