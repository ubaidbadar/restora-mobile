import { Text, View } from 'react-native';
import api from '@/config/api';
import can from '@shared/can';
import useAuthStore from '@/store/auth_store';
import type Customer from '@/types/customer';
import Button from '@/ui/button';
import Form from '@/ui/form';
import Input from '@/ui/input';
import notesSchema from './notes_schema';

interface NotesTabProps {
  customer: Customer;
  /** Gets the customer with the saved notes. */
  onCustomer: (customer: Customer) => void;
}

/** What the staff should remember about the customer, and their saved addresses. */
export default function NotesTab({ customer, onCustomer }: NotesTabProps) {
  const canEdit = useAuthStore((state) => can(state.me?.workplace, 'customers:manage'));
  return (
    <View className="gap-5">
      <Form
        schema={notesSchema}
        defaultValues={{ notes: customer.notes ?? '' }}
        className="gap-3"
        onSubmit={({ data, onSuccess, onError }) =>
          api
            .patch<Customer>(`/customers/${customer._id}`, { notes: data.notes ?? '' })
            .then((res) => {
              onSuccess('Saved');
              onCustomer(res.data);
            })
            .catch(onError)
        }
        component={({ register, loading, message, error, onSubmit }) => (
          <>
            <Input label="Notes" multiline editable={canEdit} placeholder="Allergies, favourite table, how they like their karahi…" {...register('notes')} error={error} />
            {canEdit && <View className="flex-row items-center gap-3">
              <Button disabled={loading} onPress={onSubmit}>
                Save notes
              </Button>
              {message && <Text className="text-sm font-medium text-success-700">{message}</Text>}
            </View>}
          </>
        )}
      />
      {Boolean(customer.addresses?.length) && (
        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">Addresses</Text>
          <View className="rounded-card border border-border bg-surface px-4">
            {customer.addresses?.map((address, index) => (
              <Text key={address} className={`py-3 text-sm text-body ${index ? 'border-t border-border' : ''}`}>
                {address}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
