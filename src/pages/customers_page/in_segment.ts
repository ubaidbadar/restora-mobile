import DAY_MS from '@/constants/day_ms';
import type Customer from '@/types/customer';
import type Segment from '@/types/segment';

/** Whether a customer falls in a segment: no order for 30 days, VIP tag, or owes khata. */
export default function inSegment(customer: Customer, segment: Segment, now = Date.now()) {
  if (segment === 'inactive') return !customer.lastOrderAt || now - new Date(customer.lastOrderAt).getTime() > 30 * DAY_MS;
  if (segment === 'vip') return customer.tags.includes('VIP');
  return customer.khataBalance > 0;
}
