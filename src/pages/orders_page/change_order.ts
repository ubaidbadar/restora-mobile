import api from '@/config/api';
import useOutboxStore from '@/store/outbox_store';
import type Order from '@/types/order';
import getAxiosMessage from '@/utils/get_axios_message';
import syncOutbox from '@/utils/sync_outbox';
import toast from '@/utils/toast';

/**
 * Sends a change to an order (a new status, a cancel). Without internet, or for an order still waiting to sync, it is
 * kept in the outbox and shows on the board at once (board_with_outbox); it is sent, in order, once the internet is back.
 */
export default function changeOrder(order: Order, method: 'post' | 'patch', url: string, body: unknown, done: string, onOrderUpdated: (order: Order) => void) {
  const queue = () => {
    useOutboxStore.getState().add({ id: `${order._id}-${Date.now().toString(36)}`, method, url, body, label: `Order #${order.dailyToken}`, createdAt: new Date().toISOString() });
    toast.success(`${done}. It will be sent when the internet is back.`);
  };
  if (order.pendingSync || !useOutboxStore.getState().online) return queue();
  api
    .request<Order>({ method, url, data: body })
    .then((res) => {
      onOrderUpdated(res.data);
      toast.success(done);
    })
    .catch((err) => (err.response ? toast.error(getAxiosMessage(err)) : (queue(), void syncOutbox())));
}
