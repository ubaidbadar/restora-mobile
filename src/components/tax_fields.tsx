import { View } from 'react-native';
import PAYMENT_LABELS from '@/constants/payment_labels';
import PAYMENT_METHODS from '@/constants/payment_methods';
import type FormComponentProps from '@/types/form_component_props';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';

/** One percentage per payment method, two to a row. */
export default function TaxFields({ register, errors }: Pick<FormComponentProps, 'register' | 'errors'>) {
  return (
    <View className="flex-row flex-wrap gap-x-3 gap-y-4">
      {PAYMENT_METHODS.map((method) => (
        <View key={method} className="min-w-36 flex-1 basis-[45%]">
          <Input label={`${PAYMENT_LABELS[method]} %`} keyboardType="decimal-pad" {...register(`taxByPaymentMethod.${method}`)} error={fieldError(errors, `taxByPaymentMethod.${method}`)} />
        </View>
      ))}
    </View>
  );
}
