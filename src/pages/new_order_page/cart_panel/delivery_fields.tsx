import { View } from 'react-native';
import type FormComponentProps from '@/types/form_component_props';
import AmountField from '@/ui/amount_field';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';

/** Shown only for delivery orders. */
export default function DeliveryFields({ register, errors }: FormComponentProps) {
  return (
    <View className="gap-4">
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
