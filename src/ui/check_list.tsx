import { Pressable, Text, View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import FieldError from './field_error';
import Icon from './icon';

interface CheckListProps {
  /** From `{...register('roleIds')}`: the field holds the ticked values. */
  name: string;
  control: Control<FieldValues>;
  label: string;
  hint?: string;
  options: { value: string; label: string; hint?: string }[];
  error?: string;
}

/** Tick any number of choices (roles, branches, add-on groups): rows with a check box at the start. */
export default function CheckList({ name, control, label, hint, options, error }: CheckListProps) {
  const { field } = useController({ name, control });
  const ticked: string[] = field.value ?? [];

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-ink">{label}</Text>
      {hint && <Text className="text-sm text-muted">{hint}</Text>}
      <View className="mt-1 overflow-hidden rounded-control border border-border">
        {options.map((option, index) => {
          const checked = ticked.includes(option.value);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              onPress={() => {
                void Haptics.selectionAsync();
                field.onChange(checked ? ticked.filter((value) => value !== option.value) : [...ticked, option.value]);
              }}
              className={`min-h-12 flex-row items-center gap-3 bg-surface px-3 py-2 active:bg-sunken ${index ? 'border-t border-border' : ''}`}
            >
              <View className={`size-5.5 items-center justify-center rounded-chip border-2 ${checked ? 'border-primary bg-primary' : 'border-border-strong'}`}>
                {checked && <Icon name="checkmark" size={14} className="accent-on-primary" />}
              </View>
              <View className="flex-1">
                <Text className="text-base text-ink">{option.label}</Text>
                {option.hint && <Text className="text-sm text-muted">{option.hint}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      <FieldError>{error}</FieldError>
    </View>
  );
}
