import { View } from 'react-native';
import EmptyState from '@/components/empty_state';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import type Order from '@/types/order';
import OrderHistoryRow from './order_history_row';

/** A customer's past orders, newest first. */
export default function OrdersTab({ customerId }: { customerId: string }) {
  const { data: orders = [], loading } = useGet<Order[]>('/orders', { params: { customerId } });
  if (loading) return <SkeletonList rows={4} />;
  if (!orders.length) return <EmptyState icon="receipt-outline" title="No orders yet" text="Orders for this customer will show here." />;
  return (
    <View className="rounded-card border border-border bg-surface px-4">
      {orders.map((order, index) => (
        <OrderHistoryRow key={order._id} order={order} first={index === 0} />
      ))}
    </View>
  );
}
