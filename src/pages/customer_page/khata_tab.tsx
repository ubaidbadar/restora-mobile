import { View } from 'react-native';
import EmptyState from '@/components/empty_state';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import type Customer from '@/types/customer';
import type KhataEntry from '@/types/khata_entry';
import KhataRow from './khata_row';
import KhataShare from './khata_share';

interface KhataTabProps {
  customer: Customer;
  onCustomer: (customer: Customer) => void;
}

/** Every credit and payment, newest first, with the balance after each; send or print the statement. */
export default function KhataTab({ customer, onCustomer }: KhataTabProps) {
  const { data: entries = [], loading, update } = useGet<KhataEntry[]>(`/customers/${customer._id}/khata`);
  if (loading) return <SkeletonList rows={4} />;
  if (!entries.length) return <EmptyState icon="book-outline" title="No khata yet" text="Orders put on khata and payments received will show here." />;

  return (
    <View className="gap-3">
      <KhataShare customer={customer} entries={entries} />
      <View className="rounded-card border border-border bg-surface px-4">
        {entries.map((entry, index) => (
          <KhataRow
            key={entry._id}
            entry={entry}
            customer={customer}
            first={index === 0}
            onReversed={(reversed, saved) => {
              update((list) => list?.map((item) => (item._id === reversed._id ? reversed : item)));
              onCustomer(saved);
            }}
          />
        ))}
      </View>
    </View>
  );
}
