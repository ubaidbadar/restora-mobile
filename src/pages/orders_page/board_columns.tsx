import { FlatList, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BOARD_STATUSES from '@/constants/board_statuses';
import STATUS_LABELS from '@/constants/status_labels';
import WIDE_WIDTH from '@/constants/wide_width';
import type Order from '@/types/order';
import Chip from '@/ui/chip';
import BoardColumn from './board_column';
import ColumnEmpty from './column_empty';
import type BoardProps from './board_props';
import OrderCard from './order_card';

type BoardStatus = (typeof BOARD_STATUSES)[number];
type Shown = BoardStatus | 'cancelled';
const oldestFirst = (a: Order, b: Order) => a.createdAt.localeCompare(b.createdAt);
// Orders sent from a table's QR page wait for someone to accept them, at the top of New.
const inColumn = (order: Order, status: BoardStatus) => order.status === status || (status === 'new' && order.status === 'pending');
const cancelledAt = (order: Order) => order.cancellation?.at ?? order.createdAt;
const latestCancelledFirst = (a: Order, b: Order) => cancelledAt(b).localeCompare(cancelledAt(a));
const pendingFirst = (a: Order, b: Order) => Number(b.status === 'pending') - Number(a.status === 'pending') || oldestFirst(a, b);

/**
 * Wide screens (tablets): every status as a column side by side. Phones: one status at a time, picked with the chips
 * at the top (kept in the route's params), and only that status's cards are rendered. Cancelled orders are the last
 * chip; on tablets a chip above the columns opens them.
 */
export default function BoardColumns({ orders, header, refreshing, onRefresh, onOrderUpdated }: BoardProps) {
  const wide = useWindowDimensions().width >= WIDE_WIDTH;
  const { status = 'new' } = useLocalSearchParams<{ status?: Shown }>();
  const shown = orders.filter((order) => order.status !== 'cancelled');
  const columns = BOARD_STATUSES.map((value) => {
    const orders = shown.filter((order) => inColumn(order, value)).sort(pendingFirst);
    // Done: the latest first; everything else: the one waiting longest first.
    return { status: value, orders: value === 'completed' ? orders.reverse() : orders };
  });
  const cancelled = { status: 'cancelled' as const, orders: orders.filter((order) => order.status === 'cancelled').sort(latestCancelledFirst) };
  const views: { status: Shown; orders: Order[] }[] = [...columns, cancelled];
  const refresh = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

  if (wide && status !== 'cancelled') {
    return (
      <View className="flex-1 bg-canvas px-3">
        <View className="px-1">{header}</View>
        {cancelled.orders.length > 0 && (
          <View className="flex-row justify-end px-1">
            <Chip label={STATUS_LABELS.cancelled} count={cancelled.orders.length} onPress={() => router.setParams({ status: 'cancelled' })} />
          </View>
        )}
        <View className="flex-1 flex-row gap-3 pt-2">
          {columns.map((column) => (
            <BoardColumn key={column.status} status={column.status} orders={column.orders} refreshControl={refresh} onOrderUpdated={onOrderUpdated} />
          ))}
        </View>
      </View>
    );
  }

  const current = views.find((view) => view.status === status) ?? views[0]!;
  return (
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-3 px-4 pb-32"
      data={current.orders}
      keyExtractor={(order) => order._id}
      renderItem={({ item }) => <OrderCard order={item} onOrderUpdated={onOrderUpdated} />}
      refreshControl={refresh}
      ListHeaderComponent={
        // The same chips as the customer list's filters (the web's status chips), with each status's count.
        <View>
          {header}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} className="-mx-4" contentContainerClassName="gap-2 px-4 py-2">
          {views.map((view) => (
            <Chip
              key={view.status}
              label={STATUS_LABELS[view.status]}
              count={view.orders.length}
              selected={view.status === current.status}
              onPress={() => router.setParams({ status: view.status })}
            />
          ))}
        </ScrollView>
        </View>
      }
      ListEmptyComponent={<ColumnEmpty />}
    />
  );
}
