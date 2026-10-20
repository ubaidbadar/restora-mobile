import type Order from '@/types/order';
import type OrderStatus from '@/types/order_status';

/** Where "advance" takes an order next, or null when it is finished. */
export default function nextStatus(order: Pick<Order, 'status' | 'type'>): OrderStatus | null {
  if (order.status === 'new') return 'preparing';
  if (order.status === 'preparing') return 'ready';
  if (order.status === 'ready') return order.type === 'delivery' ? 'out_for_delivery' : 'completed';
  if (order.status === 'out_for_delivery') return 'completed';
  return null;
}
