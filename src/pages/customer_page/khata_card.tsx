import { Text, View } from 'react-native';
import Can from '@/components/can';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import type Customer from '@/types/customer';
import Button from '@/ui/button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import formatRs from '@/utils/format_rs';
import toast from '@/utils/toast';
import paymentSchema from './payment_schema';

interface KhataCardProps {
  customer: Customer;
  /** Gets the customer with the new balance after a payment. */
  onSaved: (customer: Customer) => void;
}

/** What the customer owes on khata, loud only when they owe something, and recording a payment. */
export default function KhataCard({ customer, onSaved }: KhataCardProps) {
  const owes = customer.khataBalance > 0;

  return (
    <View className={`min-h-16 flex-row items-center justify-between gap-3 rounded-card py-2 ps-4 pe-2 ${owes ? 'bg-warning-50' : 'border border-border bg-surface'}`}>
      <View className="flex-1">
        <Text className="text-sm text-muted">Khata</Text>
        {owes ? (
          <Text className="text-lg font-bold text-warning-800">{formatRs(customer.khataBalance)} due</Text>
        ) : (
          <Text className="text-base text-body">{customer.khataBalance < 0 ? `${formatRs(-customer.khataBalance)} paid in advance` : 'Nothing due'}</Text>
        )}
      </View>
      <Can permission="customers:khata">
        <FormSheet
          title={`Payment from ${customer.name}`}
          schema={paymentSchema}
          defaultValues={{ amount: owes ? customer.khataBalance : '' }}
          submitLabel="Record payment"
          onSave={(values) =>
            api.post(`/customers/${customer._id}/khata`, { type: 'payment', amount: Number(values.amount), note: values.note }).then((res) => {
              toast.success(`${formatRs(Number(values.amount))} received from ${customer.name}`);
              onSaved(res.data.customer ?? { ...customer, khataBalance: customer.khataBalance - Number(values.amount) });
            })
          }
          fields={({ register, errors }) => (
            <>
              <Input label="Amount received (Rs)" keyboardType="number-pad" required {...register('amount')} error={fieldError(errors, 'amount')} />
              <Input label="Note (optional)" placeholder="e.g. JazzCash, cash at counter" {...register('note')} error={fieldError(errors, 'note')} />
            </>
          )}
          component={({ open }) => (
            <Button variant={owes ? 'primary' : 'ghost'} onPress={open}>
              Record payment
            </Button>
          )}
        />
      </Can>
    </View>
  );
}
