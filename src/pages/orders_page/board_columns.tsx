import { FlatList, RefreshControl, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BOARD_STATUSES from '@/constants/board_statuses';
import STATUS_LABELS from '@/constants/status_labels';
import WIDE_WIDTH from '@/constants/wide_width';
import type Order from '@/types/order';
import Chip from '@/ui/chip';
import Button from '@/ui/button';
import Chips from '@/ui/chips';
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
const DONE_SHOWN = 10;
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
    // Everything but Done: the one waiting longest first.
    if (value !== 'completed') return { status: value, orders, count: orders.length };
    // Done: the latest first, and only the latest few plus every one still to be paid; the rest are in the list.
    const done = orders.reverse();
    return { status: value, orders: done.filter((order, index) => index < DONE_SHOWN || order.paymentStatus !== 'paid'), count: done.length };
  });
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled').sort(latestCancelledFirst);
  const cancelled = { status: 'cancelled' as const, orders: cancelledOrders, count: cancelledOrders.length };
  const views: { status: Shown; orders: Order[]; count: number }[] = [...columns, cancelled];
  const allDone = (count: number) => (
    <Button variant="ghost" icon="list" onPress={() => router.setParams({ view: 'list', status: 'completed' })}>
      {`All ${count} done`}
    </Button>
  );
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
            <BoardColumn
              key={column.status}
              status={column.status}
              orders={column.orders}
              count={column.count}
              footer={column.count > column.orders.length ? allDone(column.count) : undefined}
              refreshControl={refresh}
              onOrderUpdated={onOrderUpdated}
            />
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
        // The same tabs as the customer list's filters (the web's status tabs), with each status's count.
        <View>
          {header}
          <Chips
            className="-mx-4 py-2"
            options={views.map((view) => ({ value: view.status, label: STATUS_LABELS[view.status], count: view.count }))}
            value={current.status}
            onChange={(value) => router.setParams({ status: value })}
          />
        </View>
      }
      ListEmptyComponent={<ColumnEmpty />}
      ListFooterComponent={current.count > current.orders.length ? allDone(current.count) : undefined}
    />
  );
}
