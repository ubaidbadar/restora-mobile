import type { FieldValues } from 'react-hook-form';
import useAuthStore from '@/store/auth_store';
import getCache from '@/store/get_cache';
import type Customer from '@/types/customer';
import type Order from '@/types/order';
import calcTotals from '@/utils/calc_totals';

/** The order as the board shows it while it waits to sync, worked out on this device from the form and the menu prices. */
export default function offlineOrder(data: FieldValues, clientId: string, token: string): Order {
  const me = useAuthStore.getState().me!;
  const method = data.paymentStatus === 'unpaid' ? undefined : data.paymentMethod;
  const rates: Record<string, number> = me.workplace!.settings.taxByPaymentMethod;
  const taxRate = method ? (rates[method] ?? 0) : 0;
  const deliveryFee = data.type === 'delivery' ? data.deliveryFee : 0;
  const saved = (getCache.get(getCache.keyOf('/customers')) as Customer[] | undefined)?.find((customer) => customer._id === data.customerId);
  const name = saved?.name ?? data.newName;
  return {
    _id: clientId,
    dailyToken: token,
    branchId: me.workplace!.branch?._id ?? '',
    customerId: data.customerId,
    customer: name ? { _id: data.customerId ?? '', name, phone: saved?.phone ?? data.newPhone ?? '' } : undefined,
    type: data.type,
    status: 'new',
    items: data.items,
    ...calcTotals(data.items, data.discount, taxRate, deliveryFee),
    taxRate,
    deliveryFee,
    paymentMethod: method,
    paymentStatus: data.paymentStatus,
    tableId: data.tableId,
    tableName: data.tableName,
    area: data.area,
    address: data.address,
    rider: data.rider,
    takenBy: me.user.name,
    createdAt: new Date().toISOString(),
    pendingSync: true,
  };
}
