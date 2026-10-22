import can from '@shared/can';
import { router } from 'expo-router';
import STATUS_LABELS from '@/constants/status_labels';
import useAuthStore from '@/store/auth_store';
import type MenuAction from '@/types/menu_action';
import type Order from '@/types/order';
import MenuSheet from '@/ui/menu_sheet';
import SwipeRow from '@/ui/swipe_row';
import confirm from '@/utils/confirm';
import printOrder from '@/utils/print_order';
import ADVANCE_LABELS from './advance_labels';
import changeOrder from './change_order';
import nextStatus from './next_status';
import OrderCardBody from './order_card_body';
import OrderDetailsSheet from './order_details_sheet';
import PayOrderSheet from './pay_order_sheet';

interface OrderCardProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

/**
 * One order on the board. Tap: details. Swipe toward the end: move it on (Start, Mark ready…). Swipe toward the start:
 * record payment. Long-press or ⋯: every action.
 */
export default function OrderCard({ order, onOrderUpdated }: OrderCardProps) {
  const workplace = useAuthStore((state) => state.me?.workplace);
  // Each action shows only with its permission (the server checks again).
  const next = can(workplace, 'orders:update') ? nextStatus(order) : null;
  const token = order.dailyToken;
  // Payments change what customers owe, so they wait for internet (and for the order to reach the server).
  // A guest's order from the table is accepted before it is paid.
  const payable = can(workplace, 'orders:payment') && order.paymentStatus === 'unpaid' && !order.pendingSync && order.status !== 'pending';
  const fromTable = order.status === 'pending';
  const cancellable = can(workplace, 'orders:cancel') && Boolean(nextStatus(order));
  // Dishes can change until the order is on the way or done, while the bill is still open.
  const editable = Boolean(next) && order.status !== 'out_for_delivery' && order.paymentStatus === 'unpaid' && !order.pendingSync;

  const advance = () =>
    next && changeOrder(order, 'patch', `/orders/${order._id}`, { status: next }, fromTable ? `Order #${token} accepted` : `Order #${token} moved to ${STATUS_LABELS[next]}`, onOrderUpdated);
  const cancel = () =>
    confirm({
      title: fromTable ? `Turn down order #${token}?` : `Cancel order #${token}?`,
      message: fromTable ? 'The guest’s order leaves the board. Let them know at the table.' : "It leaves the board and is not counted in sales. Its customer's khata and totals are corrected.",
      confirmLabel: fromTable ? 'Turn down' : 'Cancel order',
      destructive: true,
    }).then((ok) => ok && changeOrder(order, 'post', `/orders/${order._id}/cancel`, undefined, `Order #${token} cancelled`, onOrderUpdated));

  const advanceLabel = next ? (ADVANCE_LABELS[next] ?? 'Move on') : undefined;
  // Edit, print and cancel: under ⋯ and long-press after the main actions, and as rows in the details sheet.
  const more: MenuAction[] = [
    { label: 'Edit dishes', icon: 'create-outline', symbol: 'square.and.pencil', onPress: () => router.push(`/order/${order._id}`), hidden: !editable },
    { label: 'Print kitchen slip', icon: 'restaurant-outline', symbol: 'printer', onPress: () => void printOrder(order, 'kitchen') },
    { label: 'Print receipt', icon: 'receipt-outline', symbol: 'receipt', onPress: () => void printOrder(order, 'receipt') },
    { label: fromTable ? 'Turn down' : 'Cancel order', icon: 'close-circle-outline', symbol: 'xmark.circle', onPress: () => void cancel(), destructive: true, hidden: !cancellable },
  ];
  /** Everything, for ⋯ and long-press. */
  const allWith = (openPay: () => void, openDetails: () => void): MenuAction[] => [
    { label: advanceLabel ?? 'Move on', icon: 'arrow-forward', symbol: 'arrow.right', onPress: advance, hidden: !next },
    { label: 'Record payment', icon: 'cash-outline', symbol: 'banknote', onPress: openPay, hidden: !payable },
    { label: 'Details', icon: 'document-text-outline', symbol: 'doc.text', onPress: openDetails },
    ...more,
  ];

  return (
    <PayOrderSheet
      order={order}
      onOrderUpdated={onOrderUpdated}
      component={({ open: openPay }) => (
        <OrderDetailsSheet
          order={order}
          advance={advanceLabel ? { label: advanceLabel, onPress: advance } : undefined}
          onPay={payable ? openPay : undefined}
          // The details already offer the receipt (print or WhatsApp).
          actions={more.filter((action) => action.label !== 'Print receipt')}
          component={({ open: openDetails }) => (
            <MenuSheet
              title={`Order #${token}`}
              items={allWith(openPay, openDetails)}
              component={({ open: openMenu }) => (
                <SwipeRow
                  start={advanceLabel ? { label: advanceLabel, icon: 'arrow-forward', className: 'bg-primary', onPress: advance } : undefined}
                  end={payable ? { label: 'Record payment', icon: 'cash-outline', className: 'bg-success-600', onPress: openPay } : undefined}
                >
                  <OrderCardBody
                    order={order}
                    actions={allWith(openPay, openDetails)}
                    advanceLabel={advanceLabel}
                    payable={payable}
                    onPress={openDetails}
                    onMenu={openMenu}
                    onAdvance={advance}
                    onPay={openPay}
                  />
                </SwipeRow>
              )}
            />
          )}
        />
      )}
    />
  );
}
