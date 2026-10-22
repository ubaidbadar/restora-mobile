import type OrderStatus from '@/types/order_status';

/** The advance button's words, by the status it moves the order to. */
const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
  new: 'Accept',
  preparing: 'Start',
  ready: 'Mark ready',
  out_for_delivery: 'Send out',
  completed: 'Complete',
};

export default ADVANCE_LABELS;
