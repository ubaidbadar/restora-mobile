import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import type Customer from '@/types/customer';
import Tabs from '@/ui/tabs';
import KhataTab from './khata_tab';
import NotesTab from './notes_tab';
import OrdersTab from './orders_tab';

const TABS = [
  { value: 'orders', label: 'Orders' },
  { value: 'khata', label: 'Khata' },
  { value: 'notes', label: 'Notes' },
];

interface ProfileTabsProps {
  customer: Customer;
  onCustomer: (customer: Customer) => void;
}

/** Orders, khata and notes; the open one is kept in the route's params. */
export default function ProfileTabs({ customer, onCustomer }: ProfileTabsProps) {
  const { tab = 'orders' } = useLocalSearchParams<{ tab?: string }>();

  return (
    <View className="gap-4">
      <Tabs options={TABS} value={tab} onChange={(value) => router.setParams({ tab: value })} />
      {tab === 'khata' ? (
        // Keyed by the balance: a payment recorded above (or taken back here) loads the lines again.
        <KhataTab key={customer.khataBalance} customer={customer} onCustomer={onCustomer} />
      ) : tab === 'notes' ? (
        <NotesTab customer={customer} onCustomer={onCustomer} />
      ) : (
        <OrdersTab customerId={customer._id} />
      )}
    </View>
  );
}
