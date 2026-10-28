import api from '@/config/api';
import type Order from '@/types/order';
import printOrder from './print_order';
import toast from './toast';

/**
 * Prints an order's kitchen slip or receipt, as the web app does. With internet the backend hands it to the branch's
 * print agent (a PC set up in More → Printers). A phone can't reach the agent itself, so without a printer set up,
 * without internet, or for an order not sent yet, the phone's own print dialog opens.
 */
export default async function printSlip(order: Order, kind: 'kitchen' | 'receipt') {
  const sent =
    !order.pendingSync &&
    (await api
      .post('/print-jobs', { orderId: order._id, kind })
      .then(() => true)
      .catch(() => false));
  if (sent) toast.success(kind === 'kitchen' ? 'Kitchen slip sent to the printer' : 'Receipt sent to the printer');
  else await printOrder(order, kind);
}
