import OrderDetails from '@/components/order_details';
import type Order from '@/types/order';
import Sheet from '@/ui/sheet';
import OrderRowLine from './order_row_line';

/** A row of today's list; a tap opens the order's details. Moving it on and paying stay on the board's cards. */
export default function TodayOrderRow({ order }: { order: Order }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  return (
    <Sheet title={`Order #${order.dailyToken}`} component={({ open }) => <OrderRowLine order={{ ...order, itemCount }} onPress={open} />}>
      {() => <OrderDetails order={order} />}
    </Sheet>
  );
}
