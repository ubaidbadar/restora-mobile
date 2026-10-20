import { View } from 'react-native';
import EmptyState from '@/components/empty_state';
import LoadFailed from '@/components/load_failed';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import NewOrderPage from '@/pages/new_order_page';
import type Menu from '@/types/menu';
import type Order from '@/types/order';
import cartOf from './cart_of';

/** Statuses an order can still be edited in: until it is on the way or done (the server checks too). */
const EDITABLE = ['new', 'preparing', 'ready'];

/** The menu, to turn the order's lines back into cart lines; then the New order screen with them. */
export default function MenuLoader({ order }: { order: Order }) {
  const menu = useGet<Menu>('/menu');

  if (!EDITABLE.includes(order.status) || order.paymentStatus !== 'unpaid') {
    return (
      <EmptyState
        icon="lock-closed-outline"
        title={`Order #${order.dailyToken} can't be changed`}
        text={order.paymentStatus !== 'unpaid' ? 'Its bill is settled. Place a new order for anything extra.' : 'It is on the way or done. Place a new order for anything extra.'}
      />
    );
  }
  if (!menu.data) return <View className="flex-1 bg-canvas p-4">{menu.loading ? <SkeletonList rows={5} /> : <LoadFailed what="the menu" onRetry={() => menu.get()} />}</View>;
  return <NewOrderPage editing={{ order, items: cartOf(order, menu.data) }} />;
}
