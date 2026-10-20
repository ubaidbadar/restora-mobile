import { Text, View } from 'react-native';
import { useFieldArray } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import Button from '@/ui/button';
import IconButton from '@/ui/icon_button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';

interface PriceRowsProps extends Pick<FormComponentProps, 'control' | 'register' | 'errors'> {
  /** `sizes` (a dish's prices) or `options` (an add-on group's choices). */
  name: 'sizes' | 'options';
  label: string;
  namePlaceholder: string;
  priceLabel: string;
  addLabel: string;
  /** Sizes: one row needs no name, so the name boxes show from the second row on. Options always have names. */
  namesFromTwo?: boolean;
}

/** Rows of name + price (a dish's sizes, an add-on group's options): add a row, remove one. */
export default function PriceRows({ name, label, namePlaceholder, priceLabel, addLabel, namesFromTwo = false, control, register, errors }: PriceRowsProps) {
  const { fields, append, remove } = useFieldArray({ control, name });
  const named = !namesFromTwo || fields.length > 1;

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-ink">
        {named ? label : priceLabel}
        <Text className="text-danger-700"> *</Text>
      </Text>
      {fields.map((field, index) => (
        <View key={field.id} className="flex-row items-start gap-2">
          {named && (
            <View className="flex-1">
              <Input accessibilityLabel={`Row ${index + 1} name`} placeholder={namePlaceholder} {...register(`${name}.${index}.name`)} error={fieldError(errors, `${name}.${index}.name`)} />
            </View>
          )}
          <View className={named ? 'w-28' : 'flex-1'}>
            <Input accessibilityLabel={`Row ${index + 1}: ${priceLabel}`} placeholder={named ? priceLabel : undefined} keyboardType="number-pad" {...register(`${name}.${index}.price`)} error={fieldError(errors, `${name}.${index}.price`)} />
          </View>
          {fields.length > 1 && <IconButton icon="trash-outline" label={`Remove row ${index + 1}`} className="mt-0.5" onPress={() => remove(index)} />}
        </View>
      ))}
      <Button variant="ghost" size="sm" icon="add" className="self-start" onPress={() => append({ name: '', price: name === 'options' ? '0' : '' })}>
        {addLabel}
      </Button>
      {fieldError(errors, name) && <Text className="text-sm font-medium text-danger-700">{fieldError(errors, name)}</Text>}
    </View>
  );
}
