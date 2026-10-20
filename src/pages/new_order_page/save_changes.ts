import api from '@/config/api';
import getCache from '@/store/get_cache';
import useOutboxStore from '@/store/outbox_store';
import type Order from '@/types/order';
import type SubmitProps from '@/types/submit_props';
import printOrder from '@/utils/print_order';
import syncOutbox from '@/utils/sync_outbox';
import toast from '@/utils/toast';
import offlineOrder from './offline_order';

/** Saves changes to a placed order (payment is left out: it is recorded from the board). Works offline like a new order. */
export default function saveChanges(order: Order, { data, onSuccess, onError }: SubmitProps) {
  const { paymentStatus: _status, paymentMethod: _method, ...changes } = data;
  const token = order.dailyToken;
  const done = (message: string, saved: Order) => {
    toast.success(message, { label: 'Print slip', onClick: () => void printOrder(saved, 'kitchen') });
    onSuccess('');
  };
  // The order as the board will show it, worked out here from the form and the menu prices.
  const worked = offlineOrder(data, order._id, String(token));
  // The customer list may not be loaded: an unchanged customer keeps the name the order already has.
  const local = { ...worked, customer: worked.customer ?? (data.customerId && data.customerId === order.customerId ? order.customer : undefined) };
  const outbox = useOutboxStore.getState();
  const waitingOrder = outbox.items.find((item) => item.id === order._id && item.url === '/orders');
  // Taken offline and not sent yet: change the waiting order itself, so the server only ever gets the final one.
  if (waitingOrder) {
    const preview = { ...local, dailyToken: token, createdAt: order.createdAt, takenBy: order.takenBy };
    outbox.replace(order._id, { body: { ...(waitingOrder.body as object), ...changes }, preview });
    return done(`Order ${token} changed. It will be sent when the internet is back.`, preview);
  }
  // No internet: the edit waits in the outbox and the board shows it at once.
  const queue = () => {
    const { customerId, customer, type, items, subtotal, discount, tax, taxRate, total, deliveryFee, tableId, tableName, area, address, rider } = local;
    const preview = { customerId, customer, type, items, subtotal, discount, tax, taxRate, total, deliveryFee, tableId, tableName, area, address, rider };
    useOutboxStore.getState().add({ id: `${order._id}-edit-${Date.now().toString(36)}`, method: 'put', url: `/orders/${order._id}`, body: changes, label: `Changes to order #${token}`, createdAt: new Date().toISOString(), preview });
    done(`Order #${token} changed. It will be sent when the internet is back.`, { ...order, ...preview });
  };
  // Changes already waiting for this order go first, so this one waits behind them.
  const behind = outbox.items.some((item) => item.url.startsWith(`/orders/${order._id}`));
  if (!outbox.online || behind) return queue();
  api
    .put<Order>(`/orders/${order._id}`, changes)
    .then((res) => {
      getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => list?.map((item) => (item._id === res.data._id ? res.data : item)));
      getCache.set(getCache.keyOf(`/orders/${order._id}`), res.data);
      done(`Order #${res.data.dailyToken} updated`, res.data);
    })
    .catch((err) => (err.response ? onError(err) : (queue(), void syncOutbox())));
}
