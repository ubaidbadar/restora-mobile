import { View } from 'react-native';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import Select from '@/ui/select';
import fieldError from '@/utils/field_error';
import pastDayOptions from '@/utils/past_day_options';

/** From and To, only once "Pick days" is chosen. Up to a year back. */
export default function PickDays({ register, errors, control }: Pick<FormComponentProps, 'register' | 'errors' | 'control'>) {
  const days = useWatch({ control, name: 'days' });
  if (days !== 'pick') return null;
  const options = pastDayOptions();
  return (
    <View className="flex-row gap-3">
      <View className="flex-1">
        <Select label="From" options={options} {...register('from')} error={fieldError(errors, 'from')} />
      </View>
      <View className="flex-1">
        <Select label="To" options={options} {...register('to')} error={fieldError(errors, 'to')} />
      </View>
    </View>
  );
}
