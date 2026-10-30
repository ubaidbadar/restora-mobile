import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SearchField from '@/ui/search_field';
import OrdersFilter from './orders_filter';

/**
 * Above the orders, today's or other days': the search, and the Filter button for everything else. Today's orders are
 * all on the device, so they narrow while typing; other days ask the server once the search is sent.
 */
export default function OrdersToolbar({ live }: { live: boolean }) {
  const { q = '' } = useLocalSearchParams<{ q?: string }>();
  const search = (text: string) => router.setParams({ q: text.trim() || undefined });
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1">
        <SearchField
          accessibilityLabel="Search orders by token, name, phone or table"
          placeholder="Search orders"
          defaultValue={q}
          onChangeText={live ? search : undefined}
          onSubmitEditing={(event) => search(event.nativeEvent.text)}
        />
      </View>
      <OrdersFilter />
    </View>
  );
}
