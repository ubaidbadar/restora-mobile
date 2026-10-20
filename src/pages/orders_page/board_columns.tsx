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
const oldestFirst = (a: Order, b: Order) => a.createdAt.localeCompare(b.createdAt);

/**
 * Wide screens (tablets): every status as a column side by side. Phones: one status at a time, picked with the chips
 * at the top (kept in the route's params), and only that status's cards are rendered.
 */
export default function BoardColumns({ orders, header, refreshing, onRefresh, onOrderUpdated }: BoardProps) {
  const wide = useWindowDimensions().width >= WIDE_WIDTH;
  const { status = 'new' } = useLocalSearchParams<{ status?: BoardStatus }>();
  const shown = orders.filter((order) => order.status !== 'cancelled');
  const columns = BOARD_STATUSES.map((value) => {
    const inColumn = shown.filter((order) => order.status === value).sort(oldestFirst);
    // Done: the latest first; everything else: the one waiting longest first.
    return { status: value, orders: value === 'completed' ? inColumn.reverse() : inColumn };
  });
  const refresh = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

  if (wide) {
    return (
      <View className="flex-1 bg-canvas px-3">
        <View className="px-1">{header}</View>
        <View className="flex-1 flex-row gap-3 pt-2">
          {columns.map((column) => (
            <BoardColumn key={column.status} status={column.status} orders={column.orders} refreshControl={refresh} onOrderUpdated={onOrderUpdated} />
          ))}
        </View>
      </View>
    );
  }

  const current = columns.find((column) => column.status === status) ?? columns[0]!;
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
          {columns.map((column) => (
            <Chip
              key={column.status}
              label={STATUS_LABELS[column.status]}
              count={column.orders.length}
              selected={column.status === current.status}
              onPress={() => router.setParams({ status: column.status })}
            />
          ))}
        </ScrollView>
        </View>
      }
      ListEmptyComponent={<ColumnEmpty />}
    />
  );
}
