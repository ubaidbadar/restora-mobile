import { useEffect } from 'react';
import { View } from 'react-native';
import { useWatch } from 'react-hook-form';
import type Customer from '@/types/customer';
import type FormComponentProps from '@/types/form_component_props';
import useGet from '@/hooks/useGet';
import AmountField from '@/ui/amount_field';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';

/** Customer searches omit saved addresses, so only the selected delivery customer needs a profile read. */
function CustomerDeliveryDefaults({ customerId, setValue, watch }:
  Pick<FormComponentProps, 'setValue' | 'watch'> & { customerId: string }) {
  const { data: customer } = useGet<Customer>(`/customers/${customerId}`);

  useEffect(() => {
    if (!customer || customer._id !== customerId) return;
    const savedAddress = customer.addresses?.find(address => address.trim());
    if (savedAddress && !watch('address')) setValue('address', savedAddress);
    if (customer.area && !watch('area')) setValue('area', customer.area);
  }, [customer, customerId, setValue, watch]);

  return null;
}

/** Delivery starts with the selected customer's saved details, but staff can edit them per order. */
export default function DeliveryFields({ control, register, errors, setValue, watch }: FormComponentProps) {
  const customerId = useWatch({ control, name: 'customerId' });

  return (
    <View className="gap-4">
      {customerId && <CustomerDeliveryDefaults key={customerId} customerId={customerId}
        setValue={setValue} watch={watch} />}
      <Input label="Address" required multiline {...register('address')} error={fieldError(errors, 'address')} />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input label="Area" autoCapitalize="words" {...register('area')} />
        </View>
        <View className="flex-1">
          <Input label="Rider" autoCapitalize="words" {...register('rider')} />
        </View>
      </View>
      <AmountField label="Delivery fee" {...register('deliveryFee')} error={fieldError(errors, 'deliveryFee')} />
    </View>
  );
}
