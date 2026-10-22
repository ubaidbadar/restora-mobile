import { Pressable, Text, View } from 'react-native';
import STATUS_LABELS from '@/constants/status_labels';
import type FloorTable from '@/types/floor_table';
import type OrderStatus from '@/types/order_status';
import Badge from '@/ui/badge';
import Icon from '@/ui/icon';
import Sheet from '@/ui/sheet';
import formatRs from '@/utils/format_rs';
import TableOrder from './table_order';

const STATUS_TONES: Record<OrderStatus, 'primary' | 'warning' | 'success' | 'info' | 'neutral' | 'danger'> = {
  pending: 'warning',
  new: 'primary',
  preparing: 'warning',
  ready: 'success',
  out_for_delivery: 'info',
  completed: 'neutral',
  cancelled: 'danger',
};

/** One order at the table: its token, where it is, whether it is paid and its total. Tap for the whole order. */
export default function TableOrderRow({ order }: { order: FloorTable['orders'][number] }) {
  const status = order.status as OrderStatus;
  const paid = order.paymentStatus === 'paid';

  return (
    <Sheet
      title={`Order #${order.dailyToken}`}
      component={({ open }) => (
        <Pressable accessibilityRole="button" onPress={open} className="-mx-2 min-h-14 flex-row items-center gap-3 rounded-control px-2 active:bg-hover">
          <Text className="w-12 text-lg font-bold text-ink">#{order.dailyToken}</Text>
          <View className="flex-1 flex-row flex-wrap gap-1.5">
            <Badge variant={STATUS_TONES[status] ?? 'neutral'}>{STATUS_LABELS[status] ?? order.status}</Badge>
            <Badge variant={paid ? 'success' : 'warning'}>{paid ? 'Paid' : order.paymentStatus === 'khata' ? 'On khata' : 'Unpaid'}</Badge>
          </View>
          <Text className="text-base font-medium text-ink">{formatRs(order.total)}</Text>
          <Icon name="chevron-forward" size={18} />
        </Pressable>
      )}
    >
      <TableOrder id={order._id} />
    </Sheet>
  );
}
