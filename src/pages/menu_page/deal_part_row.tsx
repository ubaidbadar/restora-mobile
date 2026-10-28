import { View } from 'react-native';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import type MenuItem from '@/types/menu_item';
import IconButton from '@/ui/icon_button';
import Input from '@/ui/input';
import Select from '@/ui/select';
import fieldError from '@/utils/field_error';

interface DealPartRowProps extends Pick<FormComponentProps, 'control' | 'register' | 'errors' | 'setValue'> {
  index: number;
  /** The dishes a deal can hold (not deals). */
  dishes: MenuItem[];
  onRemove?: () => void;
}

/** One dish in the deal: which, its size when it has several, and how many. */
export default function DealPartRow({ index, dishes, onRemove, control, register, errors, setValue }: DealPartRowProps) {
  const itemId: string = useWatch({ control, name: `includes.${index}.itemId` });
  const sizes = dishes.find((dish) => dish._id === itemId)?.sizes ?? [];

  return (
    <View className="flex-row items-start gap-2">
      <View className="flex-1 gap-2">
        <Select
          label={`Dish ${index + 1}`}
          placeholder="Pick a dish"
          options={dishes.map((dish) => ({ value: dish._id, label: dish.hidden ? `${dish.name} (hidden)` : dish.name }))}
          {...register(`includes.${index}.itemId`)}
          onChange={() => setValue(`includes.${index}.sizeId`, '')}
          error={fieldError(errors, `includes.${index}.itemId`)}
        />
        {sizes.length > 1 && (
          <Select label="Size" placeholder={sizes[0]!.name} options={sizes.map((size) => ({ value: size._id, label: size.name }))} {...register(`includes.${index}.sizeId`)} />
        )}
      </View>
      <View className="w-20">
        <Input label="How many" keyboardType="number-pad" {...register(`includes.${index}.qty`)} error={fieldError(errors, `includes.${index}.qty`)} />
      </View>
      <IconButton icon="trash-outline" label={`Remove dish ${index + 1}`} className="mt-7" disabled={!onRemove} onPress={onRemove} />
    </View>
  );
}
