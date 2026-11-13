import { Text, View } from 'react-native';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import PAYMENT_LABELS from '@/constants/payment_labels';
import STATUS_LABELS from '@/constants/status_labels';
import useAuthStore from '@/store/auth_store';
import type Order from '@/types/order';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import formatDate from '@/utils/format_date';
import formatRs from '@/utils/format_rs';
import formatTime from '@/utils/format_time';
import lineDetails from '@/utils/line_details';
import printSlip from '@/utils/print_slip';
import TotalsList from './totals_list';
import WhatsAppLink from './whatsapp_link';
import nameCase from '@/utils/name_case';
import cancellationText from '@/utils/cancellation_text';

const PAYMENT_TEXT = { paid: 'Paid', unpaid: 'Not paid yet', khata: 'On khata' };
const PAYMENT_LINES = { paid: 'Paid by', unpaid: 'To pay by', khata: 'Added to khata, tax as for' } as const;

/** A plain-text receipt, short enough to read in a WhatsApp message. */
function receiptText(order: Order, restaurantName: string): string {
  return [
    restaurantName,
    `Order #${order.dailyToken} · ${ORDER_TYPE_LABELS[order.type]} · ${formatDate(order.createdAt)}, ${formatTime(order.createdAt)}`,
    '',
    ...order.items.map((item) => `${item.qty} x ${[item.name, lineDetails(item)].filter(Boolean).join(', ')}: ${formatRs(item.price * item.qty)}`),
    '',
    `Subtotal: ${formatRs(order.subtotal)}`,
    ...(order.discount ? [`Discount: -${formatRs(order.discount)}`] : []),
    ...(order.serviceCharge ? [`Service charge: ${formatRs(order.serviceCharge)}`] : []),
    order.paymentMethod ? `Tax (${order.taxRate}%): ${formatRs(order.tax)}` : 'Tax: added when paid',
    ...(order.deliveryFee ? [`Delivery: ${formatRs(order.deliveryFee)}`] : []),
    `Total: ${formatRs(order.total)}`,
    order.paymentMethod ? `${PAYMENT_LINES[order.paymentStatus]} ${PAYMENT_LABELS[order.paymentMethod]}` : 'Not paid yet',
    '',
    'Thank you!',
  ].join('\n');
}

/** Everything about one order: what was ordered, what it cost, how it is being paid; print or send the receipt. */
export default function OrderDetails({ order }: { order: Order }) {
  const restaurantName = useAuthStore((state) => state.me?.workplace?.restaurant.name ?? '');
  const customer = order.customer;
  const where = [order.tableName && `Table ${order.tableName}`, order.area, order.address, order.rider && `Rider: ${order.rider}`].filter(Boolean).join(' · ');

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-sm text-muted">
          {ORDER_TYPE_LABELS[order.type]} · {STATUS_LABELS[order.status]} · {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
        </Text>
        {customer && <Text className="text-base font-semibold text-ink">{nameCase(customer.name)}</Text>}
        {where !== '' && <Text className="text-sm text-body">{where}</Text>}
      </View>
      {order.cancellation && (
        <Text className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700">
          <Text className="font-semibold text-danger-700">Cancelled</Text> · {cancellationText(order.cancellation)}
        </Text>
      )}
      <View className="border-y border-border">
        {order.items.map((item, index) => (
          <View key={index} className={`flex-row justify-between gap-3 py-2.5 ${index ? 'border-t border-border' : ''}`}>
            <View className="flex-1">
              <Text className="text-base text-ink">
                {item.qty} × {item.name}
              </Text>
              {lineDetails(item) !== '' && <Text className="text-sm text-muted">{lineDetails(item)}</Text>}
              {item.menuPrice !== undefined && item.menuPrice !== item.price && <Text className="text-xs text-muted">Price adjusted · Menu {formatRs(item.menuPrice)} / charged {formatRs(item.price)} each</Text>}
              {item.note && <Text className="text-sm italic text-muted">“{item.note}”</Text>}
            </View>
            <Text className="text-base text-body">{formatRs(item.price * item.qty)}</Text>
          </View>
        ))}
      </View>
      <TotalsList totals={order} taxRate={order.paymentMethod ? order.taxRate : null} deliveryFee={order.deliveryFee} />
      <View className="flex-row justify-between border-t border-border pt-3">
        <Text className="text-xl font-semibold text-ink">Total</Text>
        <Text className="text-xl font-semibold text-ink">{formatRs(order.total)}</Text>
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-base text-muted">Payment</Text>
        <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
          {[PAYMENT_TEXT[order.paymentStatus], order.paymentMethod && PAYMENT_LABELS[order.paymentMethod]].filter(Boolean).join(' · ')}
        </Badge>
      </View>
      <View className="gap-2">
        {customer?.phone && <WhatsAppLink phone={customer.phone} message={receiptText(order, restaurantName)}>Send receipt on WhatsApp</WhatsAppLink>}
        <Button variant="outline" size="lg" icon="print-outline" onPress={() => void printSlip(order, 'receipt')}>
          Print receipt
        </Button>
      </View>
    </View>
  );
}
