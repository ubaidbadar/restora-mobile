import { Pressable, Text, View } from 'react-native';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import STATUS_LABELS from '@/constants/status_labels';
import type OrderRow from '@/types/order_row';
import Badge from '@/ui/badge';
import formatDay from '@/utils/format_day';
import formatRs from '@/utils/format_rs';
import formatTime from '@/utils/format_time';

interface OrderRowLineProps {
  order: OrderRow;
  /** Over several days the day goes before the time. */
  showDay?: boolean;
  onPress: () => void;
}

const statusBadges = { completed: 'success', cancelled: 'danger', pending: 'warning' } as const;
const paymentBadges = { paid: ['success', 'Paid'], unpaid: ['warning', 'Unpaid'], khata: ['warning', 'On khata'] } as const;

/** One order in two short lines: token, customer and total; then time, type or table, dishes, status and payment. */
export default function OrderRowLine({ order, showDay = false, onPress }: OrderRowLineProps) {
  const [paymentVariant, paymentLabel] = paymentBadges[order.paymentStatus];
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="min-h-16 flex-row items-center gap-3 rounded-card bg-surface px-4 py-2.5 active:bg-sunken">
      <Text className="w-12 text-lg font-semibold text-ink">#{order.dailyToken}</Text>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="font-medium text-ink">
          {order.customer?.name ?? 'Walk-in'}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted">
          {showDay ? `${formatDay(order.createdAt)}, ` : ''}
          {formatTime(order.createdAt)} · {ORDER_TYPE_LABELS[order.type]}
          {order.tableName ? ` · Table ${order.tableName}` : ''} · {order.itemCount === 1 ? '1 item' : `${order.itemCount} items`}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="font-semibold text-ink">{formatRs(order.total)}</Text>
        <View className="flex-row gap-1">
          <Badge variant={statusBadges[order.status as keyof typeof statusBadges] ?? 'neutral'}>{STATUS_LABELS[order.status]}</Badge>
          {!(order.status === 'cancelled' && order.paymentStatus === 'unpaid') && <Badge variant={paymentVariant}>{paymentLabel}</Badge>}
        </View>
      </View>
    </Pressable>
  );
}
