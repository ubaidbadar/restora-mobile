import { useColorScheme } from 'react-native';
import { router, Stack } from 'expo-router';
import IconButton from '@/ui/icon_button';

/**
 * Taking or changing an order: its own screen over the tabs (no tab bar, the order bar owns the bottom). Back with the
 * arrow or by swiping from the edge; with unsaved changes, `leave_guard` asks first.
 */
export default function OrderLayout() {
  return (
    <Stack
      screenOptions={{
        statusBarStyle: useColorScheme() === 'dark' ? 'light' : 'dark',
        headerShadowVisible: false,
        // The order screen lays out its own top (customer, search, categories): it starts under the header, not behind it.
        headerTransparent: false,
        headerLeft: () => <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />,
      }}
    >
      <Stack.Screen name="new" options={{ title: 'New order' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit order' }} />
    </Stack>
  );
}
