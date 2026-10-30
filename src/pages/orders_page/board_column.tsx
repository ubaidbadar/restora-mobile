import type { ReactElement } from 'react';
import { FlatList, Text, View, type RefreshControlProps } from 'react-native';
import STATUS_LABELS from '@/constants/status_labels';
import type Order from '@/types/order';
import type OrderStatus from '@/types/order_status';
import ColumnEmpty from './column_empty';
import OrderCard from './order_card';

interface BoardColumnProps {
  status: OrderStatus;
  orders: Order[];
  /** Every order of the status, also those not shown (Done shows only the latest). */
  count: number;
  /** Under the cards, e.g. the way to every done order. */
  footer?: ReactElement;
  refreshControl: ReactElement<RefreshControlProps>;
  onOrderUpdated: (order: Order) => void;
}

/** One status on a wide screen: its name and count, and its cards scrolling under them. */
export default function BoardColumn({ status, orders, count, footer, refreshControl, onOrderUpdated }: BoardColumnProps) {
  return (
    <View accessibilityLabel={`${STATUS_LABELS[status]}, ${count} orders`} className="flex-1 gap-2">
      <View className="flex-row items-center justify-between border-b-2 border-border-strong px-1 pb-2">
        <Text className="text-sm font-semibold text-ink">{STATUS_LABELS[status]}</Text>
        <Text className="min-w-6 rounded-small bg-surface px-1.5 py-0.5 text-center text-xs font-semibold text-muted">{count}</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(order) => order._id}
        renderItem={({ item }) => <OrderCard order={item} onOrderUpdated={onOrderUpdated} />}
        contentContainerClassName="gap-3 pb-32"
        refreshControl={refreshControl}
        ListEmptyComponent={<ColumnEmpty />}
        ListFooterComponent={footer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
