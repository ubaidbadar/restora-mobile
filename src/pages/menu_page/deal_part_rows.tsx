import { Text, View } from 'react-native';
import { useFieldArray } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import type MenuItem from '@/types/menu_item';
import Button from '@/ui/button';
import fieldError from '@/utils/field_error';
import DealPartRow from './deal_part_row';

interface DealPartRowsProps extends Pick<FormComponentProps, 'control' | 'register' | 'errors' | 'setValue'> {
  dishes: MenuItem[];
}

/** What is in the deal: a dish per row, with its size and how many ("Chicken Karahi, Half, 1" · "Naan, 2"). */
export default function DealPartRows({ dishes, ...form }: DealPartRowsProps) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'includes' });

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium text-ink">
        What is in it
        <Text className="text-danger-700"> *</Text>
      </Text>
      {fields.map((field, index) => (
        <DealPartRow key={field.id} index={index} dishes={dishes} onRemove={fields.length > 1 ? () => remove(index) : undefined} {...form} />
      ))}
      <Button variant="ghost" size="sm" icon="add" className="self-start" onPress={() => append({ itemId: '', sizeId: '', qty: '1' })}>
        Add a dish
      </Button>
      {fieldError(form.errors, 'includes') && <Text className="text-sm font-medium text-danger-700">{fieldError(form.errors, 'includes')}</Text>}
    </View>
  );
}
