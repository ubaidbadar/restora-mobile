import { Text, View } from 'react-native';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import STATUS_LABELS from '@/constants/status_labels';
import type Order from '@/types/order';
import Badge from '@/ui/badge';
import formatDate from '@/utils/format_date';
import formatRs from '@/utils/format_rs';
import formatTime from '@/utils/format_time';
import cancellationText from '@/utils/cancellation_text';

const PAYMENT_BADGES = { paid: 'success', unpaid: 'warning', khata: 'warning' } as const;
const PAYMENT_LABELS = { paid: 'Paid', unpaid: 'Unpaid', khata: 'On khata' };

/** One past order: when, what, how much, and whether it was paid. */
export default function OrderHistoryRow({ order, first }: { order: Order; first: boolean }) {
  const cancelled = order.status === 'cancelled';

  return (
    <View className={`flex-row items-start justify-between gap-3 py-3 ${first ? '' : 'border-t border-border'}`}>
      <View className="flex-1">
        <Text className="text-sm font-medium text-ink">
          {formatDate(order.createdAt)}, {formatTime(order.createdAt)} · {ORDER_TYPE_LABELS[order.type]}
        </Text>
        <Text numberOfLines={2} className="mt-0.5 text-sm text-muted">
          {order.items.map((item) => `${item.qty} × ${item.name}${item.sizeName ? ` (${item.sizeName})` : ''}`).join(', ')}
        </Text>
        {cancelled && order.cancellation && <Text className="mt-0.5 text-sm text-danger-700">{cancellationText(order.cancellation)}</Text>}
      </View>
      <View className="items-end gap-1">
        <Text className={`text-sm font-semibold ${cancelled ? 'text-muted line-through' : 'text-ink'}`}>{formatRs(order.total)}</Text>
        {cancelled ? <Badge variant="danger">{STATUS_LABELS.cancelled}</Badge> : <Badge variant={PAYMENT_BADGES[order.paymentStatus]}>{PAYMENT_LABELS[order.paymentStatus]}</Badge>}
      </View>
    </View>
  );
}
