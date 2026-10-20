import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import EmptyState from '@/components/empty_state';
import useGet from '@/hooks/useGet';
import type Customer from '@/types/customer';
import Skeleton from '@/ui/skeleton';
import CustomerActions from './customer_actions';
import KhataCard from './khata_card';
import ProfileHeader from './profile_header';
import ProfileStats from './profile_stats';
import ProfileTabs from './profile_tabs';
import nameCase from '@/utils/name_case';

/** One customer: who they are, their numbers, khata, orders and notes. */
export default function CustomerPage() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { data: customer, loading, update } = useGet<Customer>(`/customers/${id}`);
  const save = (saved: Customer) => update(() => saved);

  if (!customer) {
    return (
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 p-4">
        {loading ? (
          <View accessibilityLabel="Loading the customer" className="gap-4">
            <View className="flex-row items-center gap-3">
              <Skeleton className="size-16 rounded-pill" />
              <View className="flex-1 gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </View>
            </View>
            <Skeleton className="h-36 rounded-card" />
            <Skeleton className="h-64 rounded-card" />
          </View>
        ) : (
          <EmptyState icon="person-remove-outline" title="Customer not found" text="This customer may have been removed. Go back to the list to find someone else." />
        )}
      </ScrollView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: nameCase(customer.name), headerRight: () => <CustomerActions customer={customer} onCustomer={save} /> }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets className="flex-1 bg-canvas" contentContainerClassName="gap-4 p-4 pb-32">
        <ProfileHeader customer={customer} />
        <ProfileStats customer={customer} />
        <KhataCard customer={customer} onSaved={save} />
        <ProfileTabs customer={customer} onCustomer={save} />
      </ScrollView>
    </>
  );
}
