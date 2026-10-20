import { Text, View } from 'react-native';
import type FormComponentProps from '@/types/form_component_props';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import PriceRows from './price_rows';

/** An add-on group: its name, how many can be picked, and its options with what each adds. */
export default function AddonGroupFields(form: FormComponentProps) {
  const { register, errors } = form;
  return (
    <>
      <Input label="Group name" required placeholder="e.g. Extras, Spice level" {...register('name')} error={fieldError(errors, 'name')} />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input label="Must pick at least" keyboardType="number-pad" {...register('min')} error={fieldError(errors, 'min')} />
        </View>
        <View className="flex-1">
          <Input label="Can pick at most" keyboardType="number-pad" {...register('max')} error={fieldError(errors, 'max')} />
        </View>
      </View>
      <Text className="-mt-2 text-sm text-muted">0 at least = optional. 1 and 1 = pick exactly one, like a spice level.</Text>
      <PriceRows {...form} name="options" label="Options" namePlaceholder="e.g. Raita" priceLabel="Adds (Rs)" addLabel="Add an option" />
    </>
  );
}
