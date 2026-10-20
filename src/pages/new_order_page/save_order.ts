import api from '@/config/api';
import getCache from '@/store/get_cache';
import useOutboxStore from '@/store/outbox_store';
import type Order from '@/types/order';
import type SubmitProps from '@/types/submit_props';
import printOrder from '@/utils/print_order';
import syncOutbox from '@/utils/sync_outbox';
import toast from '@/utils/toast';
import offlineOrder from './offline_order';
import offlineToken from './offline_token';

/**
 * Places a new order. Without internet it waits in the outbox with a device number, shows on the board at once, and is
 * sent later. Made here, the clientId keeps it from being saved twice however many times it is sent.
 */
export default function saveOrder({ data, onSuccess, onError }: SubmitProps) {
  const clientId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const body = { ...data, clientId, placedAt: new Date().toISOString() };
  const finish = (message: string, order?: Order) => {
    toast.success(message, order && { label: 'Print slip', onClick: () => void printOrder(order, 'kitchen') });
    onSuccess('');
  };
  const saveOffline = () => {
    const token = offlineToken();
    const preview = offlineOrder(data, clientId, token);
    useOutboxStore.getState().add({ id: clientId, method: 'post', url: '/orders', body, label: `Order ${token}`, createdAt: body.placedAt, preview });
    finish(`No internet. Order ${token} is saved on this phone and will be sent when you're back online.`, preview);
  };
  if (!useOutboxStore.getState().online) return saveOffline();
  api
    .post<Order>('/orders', body)
    .then((res) => {
      getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => (list ? [res.data, ...list] : list));
      finish(`Order #${res.data.dailyToken} placed`, res.data);
    })
    .catch((err) => (err.response ? onError(err) : (saveOffline(), void syncOutbox())));
}
