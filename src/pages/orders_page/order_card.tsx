import can from '@shared/can';
import { router } from 'expo-router';
import STATUS_LABELS from '@/constants/status_labels';
import useAuthStore from '@/store/auth_store';
import type MenuAction from '@/types/menu_action';
import type Order from '@/types/order';
import MenuSheet from '@/ui/menu_sheet';
import SwipeRow from '@/ui/swipe_row';
import printSlip from '@/utils/print_slip';
import ADVANCE_LABELS from './advance_labels';
import changeOrder from './change_order';
import nextStatus from './next_status';
import OrderCardBody from './order_card_body';
import OrderDetailsSheet from './order_details_sheet';
import PayOrderSheet from './pay_order_sheet';
import CancelOrderSheet from './cancel_order_sheet';
import type OrderCancellation from '@/types/order_cancellation';

interface OrderCardProps {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}

/**
 * One order on the board. Tap: details. Swipe toward the end: move it on (Start, Mark ready…). Swipe toward the start:
 * record payment. Long-press or ⋯: every action.
 */
export default function OrderCard({ order, onOrderUpdated }: OrderCardProps) {
  const me = useAuthStore((state) => state.me);
  const workplace = me?.workplace;
  // Each action shows only with its permission (the server checks again).
  const next = can(workplace, 'orders:update') ? nextStatus(order) : null;
  const token = order.dailyToken;
  // Payments change what customers owe, so they wait for internet (and for the order to reach the server).
  // A guest's order from the table is accepted before it is paid.
  const payable = can(workplace, 'orders:payment') && order.paymentStatus === 'unpaid' && !order.pendingSync && order.status !== 'pending' && order.status !== 'cancelled';
  const fromTable = order.status === 'pending';
  const cancellable = can(workplace, 'orders:cancel') && Boolean(nextStatus(order));
  // Dishes can change until the order is on the way or done, while the bill is still open.
  const editable = Boolean(next) && order.status !== 'out_for_delivery' && order.paymentStatus === 'unpaid' && !order.pendingSync;

  const advance = () =>
    next &&
    changeOrder(
      order,
      'patch',
      `/orders/${order._id}`,
      { status: next, updatedBy: me?.user.name, updatedAt: new Date().toISOString() },
      fromTable ? `Order #${token} accepted` : `Order #${token} moved to ${STATUS_LABELS[next]}`,
      onOrderUpdated
    );
  const cancel = (body: Pick<OrderCancellation, 'reason' | 'note'>) =>
    changeOrder(
      order,
      'post',
      `/orders/${order._id}/cancel`,
      { ...body, cancelledBy: me?.user.name, cancelledAt: new Date().toISOString() },
      fromTable ? `Order #${token} turned down` : `Order #${token} cancelled`,
      onOrderUpdated
    );

  const advanceLabel = next ? (ADVANCE_LABELS[next] ?? 'Move on') : undefined;
  // Edit, print and cancel: under ⋯ and long-press after the main actions, and as rows in the details sheet.
  const moreWith = (openCancel: () => void): MenuAction[] => [
    { label: 'Edit dishes', icon: 'create-outline', symbol: 'square.and.pencil', onPress: () => router.push(`/order/${order._id}`), hidden: !editable },
    { label: 'Print kitchen slip', icon: 'restaurant-outline', symbol: 'printer', onPress: () => void printSlip(order, 'kitchen') },
    { label: 'Print receipt', icon: 'receipt-outline', symbol: 'receipt', onPress: () => void printSlip(order, 'receipt') },
    { label: fromTable ? 'Turn down' : 'Cancel order', icon: 'close-circle-outline', symbol: 'xmark.circle', onPress: openCancel, destructive: true, hidden: !cancellable },
  ];
  /** Everything, for ⋯ and long-press. */
  const allWith = (openPay: () => void, openDetails: () => void, openCancel: () => void): MenuAction[] => [
    { label: advanceLabel ?? 'Move on', icon: 'arrow-forward', symbol: 'arrow.right', onPress: advance, hidden: !next },
    { label: 'Record payment', icon: 'cash-outline', symbol: 'banknote', onPress: openPay, hidden: !payable },
    { label: 'Details', icon: 'document-text-outline', symbol: 'doc.text', onPress: openDetails },
    ...moreWith(openCancel),
  ];

  return (
    <CancelOrderSheet
      order={order}
      onCancel={cancel}
      component={({ open: openCancel }) => (
        <PayOrderSheet
          order={order}
          onOrderUpdated={onOrderUpdated}
          component={({ open: openPay }) => (
            <OrderDetailsSheet
              order={order}
              advance={advanceLabel ? { label: advanceLabel, onPress: advance } : undefined}
              onPay={payable ? openPay : undefined}
              // The details already offer the receipt (print or WhatsApp).
              actions={moreWith(openCancel).filter((action) => action.label !== 'Print receipt')}
              component={({ open: openDetails }) => (
                <MenuSheet
                  title={`Order #${token}`}
                  items={allWith(openPay, openDetails, openCancel)}
                  component={({ open: openMenu }) => (
                    <SwipeRow
                      start={advanceLabel ? { label: advanceLabel, icon: 'arrow-forward', className: 'bg-primary', onPress: advance } : undefined}
                      end={payable ? { label: 'Record payment', icon: 'cash-outline', className: 'bg-success-600', onPress: openPay } : undefined}
                    >
                      <OrderCardBody
                        order={order}
                        actions={allWith(openPay, openDetails, openCancel)}
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
      )}
    />
  );
}
