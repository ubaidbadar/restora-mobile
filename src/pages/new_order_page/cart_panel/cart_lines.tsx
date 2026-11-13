import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import QtyStepper from '@/components/qty_stepper';
import Can from '@/components/can';
import type CartItem from '@/types/cart_item';
import type FormComponentProps from '@/types/form_component_props';
import AmountField from '@/ui/amount_field';
import fieldError from '@/utils/field_error';
import formatRs from '@/utils/format_rs';
import lineDetails from '@/utils/line_details';
import setQty from '@/utils/set_qty';

/** The lines in the cart. Reads `items` from the form and writes quantity changes back with setValue. */
export default function CartLines({ control, setValue, errors, register }: FormComponentProps) {
  const items: CartItem[] = useWatch({ control, name: 'items' }) ?? [];
  const error = fieldError(errors, 'items');

  if (!items.length) {
    return (
      <Text
        accessibilityRole={error ? 'alert' : undefined}
        className={`rounded-control border border-dashed px-3 py-5 text-center text-sm ${error ? 'border-danger-300 text-danger-700' : 'border-border-strong text-muted'}`}
      >
        {error ?? 'Tap a dish to add it.'}
      </Text>
    );
  }

  return (
    <View>
      {items.map((line, index) => (
        <View key={line.key} className={`flex-row items-center gap-3 py-2.5 ${index ? 'border-t border-border' : ''}`}>
          <View className="flex-1">
            <Text numberOfLines={1} className="text-base font-medium text-ink">
              {line.name}
            </Text>
            {lineDetails(line) !== '' && <Text className="text-sm text-body">{lineDetails(line)}</Text>}
            {line.note && <Text className="text-sm italic text-muted">“{line.note}”</Text>}
            <Text className="text-sm text-muted">{formatRs(line.priceOverride ?? line.price)} each · {formatRs((line.priceOverride ?? line.price) * line.qty)}</Text>
            {line.menuPrice !== undefined && line.menuPrice !== (line.priceOverride ?? line.price) && <Text className="text-xs text-muted">Menu price: {formatRs(line.menuPrice)}</Text>}
            <Can permission="orders:price_override">
              <AmountField
                {...register(`items.${index}.priceOverride`)}
                label={`New unit price · current ${formatRs(line.priceOverride ?? line.price)}`}
                error={fieldError(errors, `items.${index}.priceOverride`)}
              />
            </Can>
          </View>
          <QtyStepper itemId={line.key} name={line.name} qty={line.qty} onChange={(key, qty) => setValue('items', setQty(items, key, qty), { shouldDirty: true })} />
        </View>
      ))}
    </View>
  );
}
