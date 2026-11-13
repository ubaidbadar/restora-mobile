import { Pressable, Text } from 'react-native';
import api from '@/config/api';
import PAYMENT_LABELS from '@/constants/payment_labels';
import PAYMENT_METHODS from '@/constants/payment_methods';
import useAuthStore from '@/store/auth_store';
import type Order from '@/types/order';
import type OverlayProps from '@/types/overlay_props';
import SheetPanel from '@/ui/sheet_panel';
import calcTotals from '@/utils/calc_totals';
import formatRs from '@/utils/format_rs';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';

interface PayOrderPanelProps extends OverlayProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

/** Record payment: one tap on how the customer paid, each with its own total (tax depends on it). */
export default function PayOrderPanel({ order, onOrderUpdated, ...overlay }: PayOrderPanelProps) {
  const taxByPaymentMethod = useAuthStore((state) => state.me!.workplace!.settings.taxByPaymentMethod);

  const pay = (method: (typeof PAYMENT_METHODS)[number]) =>
    api
      .post<Order>(`/orders/${order._id}/payment`, { paymentMethod: method })
      .then((res) => {
        overlay.close();
        onOrderUpdated(res.data);
        toast.success(`Order #${order.dailyToken} paid by ${PAYMENT_LABELS[method]}`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <SheetPanel {...overlay} title={`Order #${order.dailyToken}${order.tableName ? ` · Table ${order.tableName}` : ''}`}>
      <Text className="text-sm text-muted">How did the customer pay? Tax depends on it, so each way shows its own total.</Text>
      {PAYMENT_METHODS.map((method) => (
        <Pressable
          key={method}
          accessibilityRole="button"
          onPress={() => void pay(method)}
          className="min-h-14 flex-row items-center justify-between rounded-control border border-border-strong bg-surface px-4 active:bg-sunken"
        >
          <Text className="text-base font-medium text-ink">{PAYMENT_LABELS[method]}</Text>
          <Text className="text-base font-semibold text-ink">{formatRs(calcTotals(order.items, order.discount, taxByPaymentMethod[method] ?? 0, order.deliveryFee, order.serviceCharge ?? 0, order.serviceChargeTaxable ?? true).total)}</Text>
        </Pressable>
      ))}
    </SheetPanel>
  );
}
