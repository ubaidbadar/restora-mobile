import { View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import Chip from '@/ui/chip';

interface ChipRadiosProps {
  name: string;
  control: Control<FieldValues>;
  options: { value: string; label: string }[];
}

/** A registered pick-one as chips that wrap (`{...register('paymentMethod')}`). */
export default function ChipRadios({ name, control, options }: ChipRadiosProps) {
  const { field } = useController({ name, control });
  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Chip key={option.value} label={option.label} selected={field.value === option.value} onPress={() => field.onChange(option.value)} />
      ))}
    </View>
  );
}
