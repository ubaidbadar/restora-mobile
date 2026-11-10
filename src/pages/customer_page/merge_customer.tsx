import { useState } from 'react';
import { Text, View } from 'react-native';
import api from '@/config/api';
import useGet from '@/hooks/useGet';
import getCache from '@/store/get_cache';
import type Customer from '@/types/customer';
import Button from '@/ui/button';
import SearchField from '@/ui/search_field';
import Sheet from '@/ui/sheet';
import confirm from '@/utils/confirm';
import formatPhone from '@/utils/format_phone';
import formatRs from '@/utils/format_rs';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import type OverlayTrigger from '@/types/overlay_trigger';

function MergeSearch({ keep, onMerged, close }: { keep: Customer; onMerged: (saved: Customer) => void; close: () => void }) {
  const [search, setSearch] = useState('');
  const { data: found, loading, get } = useGet<Customer[]>('/customers', { active: true });
  const query = search.trim().toLowerCase();
  const results = (found ?? []).filter((other) => other._id !== keep._id && (
    other.name.toLowerCase().includes(query) || other.phone.includes(query.replace(/\D/g, ''))
  ));

  const merge = async (other: Customer) => {
    const agreed = await confirm({
      title: `Merge ${other.name} into ${keep.name}?`,
      message: `${other.orderCount} orders, bookings and khata move to ${keep.name}. The duplicate record is deleted. This cannot be undone.`,
      confirmLabel: 'Merge',
      destructive: true,
    });
    if (!agreed) return;
    api.post<Customer>(`/customers/${keep._id}/merge`, { customerId: other._id })
      .then((res) => {
        getCache.update<Customer[]>(getCache.keyOf('/customers'), (list) => list
          ?.filter((row) => row._id !== other._id)
          .map((row) => row._id === keep._id ? res.data : row));
        onMerged(res.data);
        close();
        toast.success(`${other.name} merged into ${keep.name}`);
      }).catch((error) => toast.error(getAxiosMessage(error)));
  };

  return (
    <View className="gap-3">
      <Text className="text-sm text-body">Search for the duplicate record. Its orders, bookings and khata will move to this customer.</Text>
      <SearchField accessibilityLabel="Search by customer name or phone" placeholder="Name or phone" value={search}
        onChangeText={(value) => {
          setSearch(value);
          if (value.trim().length >= 2) get({ params: { q: value.trim() } });
        }} />
      {query.length < 2 ? <Text className="text-sm text-muted">Type at least two characters to search.</Text>
        : loading ? <Text className="text-sm text-muted">Searching…</Text>
          : !results.length ? <Text className="text-sm text-muted">Nobody else matches.</Text>
            : results.slice(0, 10).map((other) => (
              <View key={other._id} className="flex-row items-center gap-3 border-b border-border py-3">
                <View className="flex-1 gap-1">
                  <Text numberOfLines={1} className="font-semibold text-ink">{other.name}</Text>
                  <Text className="text-sm text-muted">{formatPhone(other.phone)} · {other.orderCount} orders{other.khataBalance ? ` · khata ${formatRs(other.khataBalance)}` : ''}</Text>
                </View>
                <Button variant="outline" size="sm" onPress={() => void merge(other)}>Merge</Button>
              </View>
            ))}
    </View>
  );
}

/** Merge a duplicate into the current customer using the backend's existing merge endpoint. */
export default function MergeCustomer({ customer, onMerged, component }: { customer: Customer; onMerged: (saved: Customer) => void; component: OverlayTrigger }) {
  return (
    <Sheet title={`Merge into ${customer.name}`} component={component} full>
      {({ close }) => <MergeSearch keep={customer} onMerged={onMerged} close={close} />}
    </Sheet>
  );
}
