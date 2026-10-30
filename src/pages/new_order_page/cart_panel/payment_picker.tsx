import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import type IconName from '@/types/icon_name';
import ChoiceCards from '@/ui/choice_cards';
import Chips from '@/ui/chips';
import Icon from '@/ui/icon';
import PAYMENT_LABELS from '@/constants/payment_labels';
import PAYMENT_METHODS from '@/constants/payment_methods';
import type FormComponentProps from '@/types/form_component_props';
import fieldError from '@/utils/field_error';

// Said the way a cashier says them, with what the two less obvious ones mean.
const STATUSES: { value: string; label: string; hint?: string; icon: IconName }[] = [
  { value: 'paid', label: 'Paid now', icon: 'checkmark-circle-outline' },
  { value: 'unpaid', label: 'Pay later', hint: 'at the end', icon: 'time-outline' },
  { value: 'khata', label: 'Khata', hint: 'on their account', icon: 'book-outline' },
];
const METHOD_ICONS: Record<(typeof PAYMENT_METHODS)[number], IconName> = { cash: 'wallet-outline', card: 'card-outline', jazzcash: 'phone-portrait-outline', easypaisa: 'phone-portrait-outline', bank: 'business-outline' };
const METHODS = PAYMENT_METHODS.map((value) => ({ value, label: PAYMENT_LABELS[value], icon: METHOD_ICONS[value] }));

/**
 * Whether the customer pays now, later (a table pays at the end) or on khata. "Pay later" is the start; how they pay is
 * asked only when they pay now or go on khata.
 */
export default function PaymentPicker({ control, register, errors }: FormComponentProps) {
  const [status, customerId, newName] = useWatch({ control, name: ['paymentStatus', 'customerId', 'newName'] });
  const error = fieldError(errors, 'paymentStatus') ?? fieldError(errors, 'paymentMethod');

  return (
    <View className="gap-3">
      <ChoiceCards {...register('paymentStatus')} label="Payment" options={STATUSES} />
      {status !== 'unpaid' && (
        <View className="gap-2">
          {/* On khata nothing is paid yet: the method only sets the tax, as the customer will pay that way. */}
          <Text className="text-sm font-semibold text-ink">{status === 'paid' ? 'Paid by' : 'They will pay by (sets the tax)'}</Text>
          <Chips {...register('paymentMethod')} options={METHODS} wrap />
        </View>
      )}
      {status === 'khata' && !customerId && !newName && !error && (
        <View className="flex-row items-center gap-2 rounded-control bg-warning-50 px-3 py-2">
          <Icon name="person-outline" size={16} className="accent-warning-800" />
          <Text className="flex-1 text-sm font-medium text-warning-800">Khata needs a customer: pick one at the top.</Text>
        </View>
      )}
      {error && (
        <Text accessibilityRole="alert" className="text-sm font-medium text-danger-700">
          {error}
        </Text>
      )}
    </View>
  );
}
