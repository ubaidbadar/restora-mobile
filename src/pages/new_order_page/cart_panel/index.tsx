import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import AmountField from '@/ui/amount_field';
import Can from '@/components/can';
import fieldError from '@/utils/field_error';
import CartLines from './cart_lines';
import OrderTotals from './order_totals';
import OrderTypePicker from './order_type_picker';
import PaymentPicker from './payment_picker';

/**
 * The order: its lines, type, payment and discount. Every field is registered here or in a child. Type, payment, discount
 * and totals show once a dish is in the cart, so an empty order is one short hint.
 */
export default function CartPanel({ editing, heading = true, ...props }: FormComponentProps & { editing: boolean; heading?: boolean }) {
  const itemCount = useWatch({ control: props.control, name: 'items' })?.length ?? 0;

  return (
    <View className="gap-6">
      {/* In the phone's sheet, the sheet's own title says it. */}
      {heading && (
        <Text accessibilityRole="header" className="text-xl font-bold text-ink">
          Order
        </Text>
      )}
      <CartLines {...props} />
      {itemCount > 0 && (
        <>
          <OrderTypePicker {...props} />
          {/* A placed order is paid from the board, so editing leaves payment out. Without the payment permission it
              starts as Pay later; each part shows only to people the server lets use it. */}
          {!editing && (
            <Can permission="orders:payment">
              <PaymentPicker {...props} />
            </Can>
          )}
          <Can permission="orders:discount">
            <AmountField label="Discount" {...props.register('discount')} error={fieldError(props.errors, 'discount')} />
          </Can>
          <OrderTotals {...props} />
        </>
      )}
    </View>
  );
}
