import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import getCache from '@/store/get_cache';
import type Customer from '@/types/customer';
import type FormComponentProps from '@/types/form_component_props';
import type Order from '@/types/order';
import Icon from '@/ui/icon';
import CustomerMatchCard from './customer_match_card';
import CustomerStepPicker from './customer_step_picker';

/** The customer as picked: the full record when the customer list is already on the device. */
const startWith = (id: string | undefined, picked?: Order['customer']): Customer | null => {
  const saved = (getCache.get(getCache.keyOf('/customers')) as Customer[] | undefined)?.find((customer) => customer._id === id);
  if (saved) return saved;
  return picked ? { _id: picked._id, name: picked.name, phone: picked.phone, tags: [], khataBalance: 0, orderCount: 0, totalSpent: 0, createdAt: '' } : null;
};

/** Who the order is for: a row that opens the customer picker, then the picked customer. Optional: walk-ins have none. */
export default function CustomerStep({ setValue, picked }: FormComponentProps & { picked?: Order['customer'] }) {
  const { customer: fromParams } = useLocalSearchParams<{ customer?: string }>();
  const [customer, setCustomer] = useState(() => startWith(picked?._id ?? fromParams, picked));

  /** A saved customer; or, without internet, a new one the server saves when the order arrives (`newName`, `newPhone`). */
  const pick = (chosen: Customer | null, offline = false) => {
    setValue('customerId', chosen && !offline ? chosen._id : undefined, { shouldDirty: true });
    setValue('newName', offline ? chosen?.name : undefined);
    setValue('newPhone', offline ? chosen?.phone : undefined);
    setCustomer(chosen);
  };

  return (
    <CustomerStepPicker
      onPick={pick}
      component={({ open }) =>
        customer ? (
          <CustomerMatchCard customer={customer} onChange={open} onClear={() => pick(null)} />
        ) : (
          <Pressable accessibilityRole="button" accessibilityHint="Optional for walk-ins" onPress={open} className="min-h-13 flex-row items-center gap-3 rounded-control border border-border bg-surface px-3 active:bg-sunken">
            <Icon name="person-add-outline" size={20} className="accent-accent-text" />
            <Text className="flex-1 text-base font-medium text-ink">
              Add customer <Text className="text-sm font-normal text-muted">· optional for walk-ins</Text>
            </Text>
            <Icon name="chevron-forward" size={18} />
          </Pressable>
        )
      }
    />
  );
}
