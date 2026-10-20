import { Text, View } from 'react-native';
import type FormComponentProps from '@/types/form_component_props';
import AmountField from '@/ui/amount_field';
import fieldError from '@/utils/field_error';
import CartLines from './cart_lines';
import OrderTotals from './order_totals';
import OrderTypePicker from './order_type_picker';
import PaymentPicker from './payment_picker';

/** The order: its lines, type, payment and discount. Every field is registered here or in a child; no React state. */
export default function CartPanel({ editing, heading = true, ...props }: FormComponentProps & { editing: boolean; heading?: boolean }) {
  return (
    <View className="gap-6">
      {/* In the phone's sheet, the sheet's own title says it. */}
      {heading && (
        <Text accessibilityRole="header" className="text-xl font-bold text-ink">
          Order
        </Text>
      )}
      <CartLines {...props} />
      <OrderTypePicker {...props} />
      {/* A placed order is paid from the board, so editing leaves payment out. */}
      {!editing && <PaymentPicker {...props} />}
      <AmountField label="Discount" {...props.register('discount')} error={fieldError(props.errors, 'discount')} />
      <OrderTotals {...props} />
    </View>
  );
}
