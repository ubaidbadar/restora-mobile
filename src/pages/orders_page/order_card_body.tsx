import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import useOrderAlertStore from '@/store/order_alert_store';
import type Order from '@/types/order';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import type MenuAction from '@/types/menu_action';
import ActionMenu from '@/ui/action_menu';
import formatRs from '@/utils/format_rs';
import formatTime from '@/utils/format_time';
import lineDetails from '@/utils/line_details';
import DeliveryInfo from './delivery_info';
import ElapsedChip from './elapsed_chip';
import nameCase from '@/utils/name_case';
import cancellationText from '@/utils/cancellation_text';

const PAYMENT_BADGES = { paid: ['success', 'Paid'], unpaid: ['warning', 'Unpaid'], khata: ['warning', 'On khata'] } as const;
const SHOWN_LINES = 5;

interface OrderCardBodyProps {
  order: Order;
  /** For the ⋯ button. */
  actions: MenuAction[];
  /** The next step's words ("Mark ready"), or nothing when the order is finished. */
  advanceLabel?: string;
  payable: boolean;
  onPress: () => void;
  onMenu: () => void;
  onAdvance: () => void;
  onPay: () => void;
}

/**
 * What the card shows: token, wait, type and payment; the customer; the dishes with their prices and the total on a
 * tinted panel; then the actions along the bottom (pay, next step, ⋯).
 */
export default function OrderCardBody({ order, actions, advanceLabel, payable, onPress, onMenu, onAdvance, onPay }: OrderCardBodyProps) {
  const [paymentVariant, paymentLabel] = PAYMENT_BADGES[order.paymentStatus];
  const cancelled = order.status === 'cancelled';
  const finished = order.status === 'completed' || cancelled;
  const hidden = order.items.length - SHOWN_LINES;
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  // Just came in on the live stream: outlined until someone opens it or moves it on.
  const isNew = useOrderAlertStore((state) => state.fresh.includes(order._id));

  return (
    <Pressable
      accessibilityLabel={`Order ${order.dailyToken}, ${ORDER_TYPE_LABELS[order.type]}, ${formatRs(order.total)}, ${cancelled ? 'cancelled' : paymentLabel}`}
      accessibilityHint="Opens the details. Long press for every action."
      onPress={() => {
        useOrderAlertStore.getState().seen(order._id);
        onPress();
      }}
      onLongPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onMenu();
      }}
      delayLongPress={350}
      className={`gap-3 rounded-card bg-surface p-4 active:bg-sunken ${isNew ? 'border-2 border-primary' : 'border border-border'}`}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="text-display font-bold text-ink">#{order.dailyToken}</Text>
        <View className="shrink items-end gap-1.5">
          {finished ? <Text className="text-xs text-muted">{formatTime(order.createdAt)}</Text> : <ElapsedChip since={order.createdAt} />}
          <View className="flex-row flex-wrap items-center justify-end gap-1.5">
            <Text numberOfLines={1} className="text-sm font-medium text-muted">
              {ORDER_TYPE_LABELS[order.type]}
              {order.tableName ? ` · Table ${order.tableName}` : ''}
            </Text>
            {cancelled && <Badge variant="danger">Cancelled</Badge>}
            {/* A cancelled order is not owed; only say it if money had changed hands. */}
            {!(cancelled && order.paymentStatus === 'unpaid') && <Badge variant={paymentVariant}>{paymentLabel}</Badge>}
          </View>
          {isNew && <Badge variant="primary">Just in</Badge>}
          {order.pendingSync && <Badge>Waiting to sync</Badge>}
          {order.status === 'pending' && <Badge variant="warning">From table QR</Badge>}
        </View>
      </View>

      {cancelled && order.cancellation && <Text className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700">{cancellationText(order.cancellation)}</Text>}

      {order.customer && (
        <Text numberOfLines={1} className="text-base font-semibold text-ink">
          {nameCase(order.customer.name)}
        </Text>
      )}

      <View className="gap-2 rounded-card bg-primary-soft px-3.5 py-3">
        {order.items.slice(0, SHOWN_LINES).map((item, index) => (
          <View key={index} className="flex-row items-start gap-3">
            <Text numberOfLines={2} className="flex-1 text-base text-body">
              {item.qty}× {item.name}
              {lineDetails(item) !== '' && ` (${lineDetails(item)})`}
              {item.note && <Text className="italic text-muted"> “{item.note}”</Text>}
            </Text>
            <Text className="text-base font-semibold text-ink">{formatRs(item.price * item.qty)}</Text>
          </View>
        ))}
        {hidden > 0 && <Text className="text-sm font-medium text-muted">+ {hidden} more</Text>}
        <View className="mt-1 flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-base font-medium text-muted">
              Total ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </Text>
            {!order.paymentMethod && <Text className="text-xs text-muted">+ tax when paid</Text>}
          </View>
          <Text className="text-metric font-bold text-ink">{formatRs(order.total)}</Text>
        </View>
      </View>

      {order.type === 'delivery' && <DeliveryInfo order={order} />}

      <View className="flex-row items-center gap-2">
        {payable && (
          <Button variant="secondary" size="lg" icon="cash-outline" className="flex-1" onPress={onPay}>
            Pay
          </Button>
        )}
        {advanceLabel && (
          <Button size="lg" icon="arrow-forward" className="flex-1" onPress={onAdvance}>
            {advanceLabel}
          </Button>
        )}
        <ActionMenu label={`More actions for order ${order.dailyToken}`} title={`Order #${order.dailyToken}`} items={actions} />
      </View>
    </Pressable>
  );
}
