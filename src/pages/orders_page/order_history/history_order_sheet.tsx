import type OrderRow from '@/types/order_row';
import Sheet from '@/ui/sheet';
import OrderRowLine from '@/pages/orders_page/order_row_line';
import HistoryOrderDetails from './history_order_details';

/** A row of the list; a tap opens the whole order in a sheet. */
export default function HistoryOrderSheet({ order, showDay }: { order: OrderRow; showDay: boolean }) {
  return (
    <Sheet title={`Order #${order.dailyToken}`} component={({ open }) => <OrderRowLine order={order} showDay={showDay} onPress={open} />}>
      {() => <HistoryOrderDetails id={order._id} />}
    </Sheet>
  );
}
