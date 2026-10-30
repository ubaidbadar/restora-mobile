import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ORDER_TYPE_OPTIONS from '@/constants/order_type_options';
import SearchField from '@/ui/search_field';
import Tabs from '@/ui/tabs';

const VIEWS = [
  { value: 'board', label: 'Board' },
  { value: 'list', label: 'List' },
];

/** Above today's orders: search, the order type, and the board or a list. All kept in the route's params. */
export default function TodayToolbar() {
  const { q = '', type = 'all', view = 'board' } = useLocalSearchParams<{ q?: string; type?: string; view?: string }>();
  return (
    <View className="gap-2">
      <SearchField accessibilityLabel="Search orders" placeholder="Token, name, phone or table" defaultValue={q} onChangeText={(text) => router.setParams({ q: text.trim() || undefined })} />
      <Tabs scroll className="-mx-4" options={ORDER_TYPE_OPTIONS} value={type} onChange={(value) => router.setParams({ type: value === 'all' ? undefined : value })} />
      {/* Each view has its own status default (New on the board, All in the list), so switching starts it afresh. */}
      <Tabs options={VIEWS} value={view} onChange={(value) => router.setParams({ view: value === 'board' ? undefined : value, status: undefined })} />
    </View>
  );
}
