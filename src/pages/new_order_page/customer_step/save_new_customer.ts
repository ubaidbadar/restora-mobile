import api from '@/config/api';
import getCache from '@/store/get_cache';
import type Customer from '@/types/customer';
import normalizePhone from '@/utils/normalize_phone';
import toast from '@/utils/toast';

/**
 * Saves a new customer and picks them. Saved already (found only by the server, or added on another phone): picks that
 * customer. No internet: picks them as typed, and the server saves them when the order arrives (`offline`).
 */
const saveNewCustomer = (values: Record<string, unknown>, onPick: (customer: Customer, offline?: boolean) => void) =>
  api
    .post<Customer>('/customers', values)
    .then((res) => {
      getCache.update<Customer[]>(getCache.keyOf('/customers'), (current) => (current ? [res.data, ...current] : current));
      onPick(res.data);
    })
    .catch(async (err) => {
      if (err.response?.status === 409) {
        const { data: found } = await api.get<Customer[]>('/customers', { params: { q: values.phone } });
        const existing = found.find((customer) => customer.phone === normalizePhone(String(values.phone)));
        if (!existing) throw err;
        toast.info(`${existing.name} is already saved with this number, so they are picked`);
        return onPick(existing);
      }
      if (err.response) throw err;
      const phone = normalizePhone(String(values.phone)) ?? '';
      onPick({ _id: '', name: String(values.name), phone, area: values.area as string | undefined, tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: new Date().toISOString() }, true);
    });

export default saveNewCustomer;
