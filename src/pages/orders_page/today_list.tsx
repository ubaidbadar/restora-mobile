import { FlatList, RefreshControl, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BOARD_STATUSES from '@/constants/board_statuses';
import STATUS_LABELS from '@/constants/status_labels';
import type Order from '@/types/order';
import Tabs from '@/ui/tabs';
import type BoardProps from './board_props';
import ColumnEmpty from './column_empty';
import TodayOrderRow from './today_order_row';

const inStatus = (order: Order, status: string) => status === 'all' || order.status === status || (status === 'new' && order.status === 'pending');
const STATUSES = [...BOARD_STATUSES, 'cancelled' as const];

/** Today's orders one per row, the latest first: many at a glance. The status tabs narrow it, with their counts. */
export default function TodayList({ orders, header, refreshing, onRefresh }: BoardProps) {
  const { status = 'all' } = useLocalSearchParams<{ status?: string }>();
  const tabs = [{ value: 'all', label: 'All', count: orders.length }, ...STATUSES.map((value) => ({ value: value as string, label: STATUS_LABELS[value], count: orders.filter((order) => inStatus(order, value)).length }))];
  const shown = orders.filter((order) => inStatus(order, status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-2 px-4 pb-32"
      data={shown}
      keyExtractor={(order) => order._id}
      renderItem={({ item }) => <TodayOrderRow order={item} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View className="pb-1">
          {header}
          <Tabs scroll className="-mx-4 py-2" options={tabs} value={status} onChange={(value) => router.setParams({ status: value === 'all' ? undefined : value })} />
        </View>
      }
      ListEmptyComponent={<ColumnEmpty />}
    />
  );
}
