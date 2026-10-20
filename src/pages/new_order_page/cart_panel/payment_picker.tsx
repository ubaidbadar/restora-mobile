import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import ChipRadios from '@/components/chip_radios';
import PAYMENT_LABELS from '@/constants/payment_labels';
import PAYMENT_METHODS from '@/constants/payment_methods';
import PAYMENT_STATUS_LABELS from '@/constants/payment_status_labels';
import type FormComponentProps from '@/types/form_component_props';
import Segmented from '@/ui/segmented';
import fieldError from '@/utils/field_error';

const STATUSES = (['unpaid', 'paid', 'khata'] as const).map((value) => ({ value, label: PAYMENT_STATUS_LABELS[value] }));
const METHODS = PAYMENT_METHODS.map((value) => ({ value, label: PAYMENT_LABELS[value] }));

/**
 * Whether the customer pays now, later (a table pays at the end) or on khata. "Pay later" is the start; how they pay is
 * asked only when they pay now or go on khata.
 */
export default function PaymentPicker({ control, register, errors }: FormComponentProps) {
  const [status, customerId, newName] = useWatch({ control, name: ['paymentStatus', 'customerId', 'newName'] });
  const error = fieldError(errors, 'paymentStatus') ?? fieldError(errors, 'paymentMethod');

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-muted">Payment</Text>
      <Segmented {...register('paymentStatus')} options={STATUSES} />
      {status !== 'unpaid' && (
        <View className="gap-2">
          {/* On khata nothing is paid yet: the method only sets the tax, as the customer will pay that way. */}
          <Text className="text-sm text-body">{status === 'paid' ? 'Paid by' : 'They will pay by (sets the tax)'}</Text>
          <ChipRadios {...register('paymentMethod')} options={METHODS} />
        </View>
      )}
      {status === 'khata' && !customerId && !newName && !error && <Text className="text-sm font-medium text-warning-800">Khata needs a customer: pick one above.</Text>}
      {error && (
        <Text accessibilityRole="alert" className="text-sm font-medium text-danger-700">
          {error}
        </Text>
      )}
    </View>
  );
}
