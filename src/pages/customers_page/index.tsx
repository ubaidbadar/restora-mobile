import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, RefreshControl, View } from 'react-native';
import Can from '@/components/can';
import CustomerFields from '@/components/customer_fields';
import EmptyState from '@/components/empty_state';
import FormSheet from '@/components/form_sheet';
import TabScreen from '@/components/tab_screen';
import PageHeader from '@/components/page_header';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import customerSchema from '@/constants/customer_schema';
import SEGMENT_LABELS from '@/constants/segment_labels';
import SEGMENTS from '@/constants/segments';
import useGet from '@/hooks/useGet';
import type Customer from '@/types/customer';
import type Segment from '@/types/segment';
import Button from '@/ui/button';
import Tabs from '@/ui/tabs';
import IconButton from '@/ui/icon_button';
import SearchField from '@/ui/search_field';
import toast from '@/utils/toast';
import CustomerRow from './customer_row';
import inSegment from './in_segment';

const FILTERS = [{ value: 'all', label: 'All' }, ...SEGMENTS.map((value) => ({ value, label: SEGMENT_LABELS[value] }))];

/** The customer list: search under the title, segments as chips (kept in the route's params). */
export default function CustomersPage() {
  const { seg = 'all' } = useLocalSearchParams<{ seg?: string }>();
  // What is typed stays here (not in the route), so typing is instant.
  const [search, setSearch] = useState('');
  const q = search;
  const { data: all = [], loading, refreshing, update, get } = useGet<Customer[]>('/customers');
  const query = q.trim().toLowerCase();
  const digits = query.replace(/\D/g, '').replace(/^0/, '');
  const customers = all.filter((customer) => (!query || customer.name.toLowerCase().includes(query) || (digits && customer.phone.includes(digits))) && (seg === 'all' || inSegment(customer, seg as Segment)));

  const header = (
    <View className="gap-2">
      <PageHeader title="Customers">
        <Can permission="customers:manage">
          <FormSheet
            title="Add customer"
            schema={customerSchema}
            onSave={(values) =>
              api.post<Customer>('/customers', values).then((res) => {
                update((list) => [res.data, ...(list ?? [])]);
                toast.success(`${res.data.name} added`);
              })
            }
            fields={(form) => <CustomerFields {...form} quick />}
            component={({ open }) => <IconButton icon="person-add-outline" variant="outline" label="Add customer" onPress={open} />}
          />
        </Can>
      </PageHeader>
      <SearchField accessibilityLabel="Search customers by name or phone" placeholder="Name or phone" autoCapitalize="none" value={search} onChangeText={setSearch} />
      <Tabs scroll className="-mx-4" options={FILTERS} value={seg} onChange={(value) => router.setParams({ seg: value })} />
    </View>
  );

  return (
    <TabScreen>
      {loading ? (
        <View className="flex-1 gap-3 px-4">
          {header}
          <SkeletonList rows={8} />
        </View>
      ) : (
        <FlatList
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          className="flex-1 bg-canvas"
          contentContainerClassName="gap-2 px-4 pb-32"
          data={customers}
          keyExtractor={(customer) => customer._id}
          renderItem={({ item }) => <CustomerRow customer={item} />}
          refreshControl={<RefreshControl refreshing={Boolean(refreshing)} onRefresh={() => get()} />}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={query || seg !== 'all' ? 'No customers found' : 'No customers yet'}
              text={
                query || seg !== 'all'
                  ? `Nobody${query ? ` matches “${search.trim()}”` : ''}${seg !== 'all' ? ` in ${SEGMENT_LABELS[seg as Segment]}` : ''}.`
                  : 'Customers are saved when you add them or place an order with their number.'
              }
            >
              {(query || seg !== 'all') && (
                <Button
                  variant="secondary"
                  onPress={() => {
                    setSearch('');
                    router.setParams({ seg: 'all' });
                  }}
                >
                  Show all customers
                </Button>
              )}
            </EmptyState>
          }
        />
      )}
    </TabScreen>
  );
}
