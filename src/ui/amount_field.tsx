import { Text, TextInput, View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import FieldError from './field_error';

interface AmountFieldProps {
  /** From `{...register('discount')}`. */
  name: string;
  control: Control<FieldValues>;
  label: string;
  error?: string;
}

/**
 * A money amount as one settings-style row: the label at the start, "Rs" and the number at the end, typed with the
 * number pad. For the small amounts of an order (discount, delivery fee).
 */
export default function AmountField({ name, control, label, error }: AmountFieldProps) {
  const { field } = useController({ name, control });

  return (
    <View className="gap-1">
      <View className={`min-h-12 flex-row items-center gap-2 rounded-control border bg-surface ps-3.5 pe-2 ${error ? 'border-danger-600' : 'border-border'}`}>
        <Text className="flex-1 text-base text-ink">{label}</Text>
        <Text className="text-base text-muted">Rs</Text>
        <TextInput
          accessibilityLabel={`${label} in rupees`}
          aria-invalid={Boolean(error)}
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
          // React Native swaps "right" to the start side in right-to-left languages, so this is the end side.
          textAlign="right"
          placeholder="0"
          placeholderTextColorClassName="accent-subtle"
          selectionColorClassName="accent-primary"
          cursorColorClassName="accent-primary"
          value={field.value === undefined || field.value === null ? '' : String(field.value)}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          className="min-h-11 min-w-20 text-base font-semibold text-ink"
        />
      </View>
      {error && <FieldError>{error}</FieldError>}
    </View>
  );
}
