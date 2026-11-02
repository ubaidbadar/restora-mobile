import api from '@/config/api';
import getCache from '@/store/get_cache';
import useAuthStore from '@/store/auth_store';
import useOutboxStore from '@/store/outbox_store';
import type Order from '@/types/order';
import type SubmitProps from '@/types/submit_props';
import printSlip from '@/utils/print_slip';
import syncOutbox from '@/utils/sync_outbox';
import toast from '@/utils/toast';
import offlineOrder from './offline_order';

/** Saves changes to a placed order (payment is left out: it is recorded from the board). Works offline like a new order. */
export default function saveChanges(order: Order, { data, onSuccess, onError }: SubmitProps) {
  const { paymentStatus: _status, paymentMethod: _method, ...changes } = data;
  const token = order.dailyToken;
  const done = (message: string, saved: Order) => {
    toast.success(message, { label: 'Print slip', onClick: () => void printSlip(saved, 'kitchen') });
    onSuccess('');
  };
  // The order as the board will show it, worked out here from the form and the menu prices.
  const worked = offlineOrder(data, order._id, String(token));
  // The customer list may not be loaded: an unchanged customer keeps the name the order already has.
  const local = { ...worked, customer: worked.customer ?? (data.customerId && data.customerId === order.customerId ? order.customer : undefined) };
  const outbox = useOutboxStore.getState();
  const me = useAuthStore.getState().me;
  const editMeta = {
    ...changes,
    editedBy: me?.user.name,
    editedAt: new Date().toISOString(),
  };
  // No internet: the edit waits in the outbox and the board shows it at once.
  const queue = () => {
    const { customerId, customer, type, items, subtotal, discount, tax, taxRate, total, deliveryFee, tableId, tableName, area, address, rider } = local;
    const preview = { customerId, customer, type, items, subtotal, discount, tax, taxRate, total, deliveryFee, tableId, tableName, area, address, rider };
    useOutboxStore.getState().add({ id: `${order._id}-edit-${Date.now().toString(36)}`, method: 'put', url: `/orders/${order._id}`, body: editMeta, label: `Changes to order #${token}`, createdAt: editMeta.editedAt, preview });
    done(`Order #${token} changed. It will be sent when the internet is back.`, { ...order, ...preview });
  };
  // Changes already waiting for this order go first, so this one waits behind them.
  const behind = outbox.items.some((item) => item.url.startsWith(`/orders/${order._id}`));
  if (!outbox.online || behind) return queue();
  api
    .put<Order>(`/orders/${order._id}`, editMeta)
    .then((res) => {
      getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => list?.map((item) => (item._id === res.data._id ? res.data : item)));
      getCache.deleteMatching((key) => key.includes(`/orders/${order._id}`));
      getCache.set(getCache.keyOf(`/orders/${order._id}`), res.data);
      done(`Order #${res.data.dailyToken} updated`, res.data);
    })
    .catch((err) => (err.response ? onError(err) : (queue(), void syncOutbox())));
}
