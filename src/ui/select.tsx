import { Pressable, Text } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import formInputBaseClasses from '@/utils/form_input_base_classes';
import FieldShell from './field_shell';
import Icon from './icon';
import Sheet from './sheet';

interface SelectProps {
  name?: string;
  control?: Control<FieldValues>;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

function SelectView({ label, options, placeholder = 'Pick one', required, error, value, onChange }: SelectProps) {
  const picked = options.find((option) => option.value === value);

  return (
    <FieldShell label={label} required={required} error={error}>
      <Sheet
        title={label}
        component={({ open }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${picked?.label ?? placeholder}`}
            onPress={open}
            className={`${formInputBaseClasses} justify-between gap-2 px-3.5 active:bg-sunken ${error ? 'border-danger-600' : 'border-border-strong'}`}
          >
            <Text numberOfLines={1} className={`flex-1 text-base ${picked ? 'text-ink' : 'text-subtle'}`}>
              {picked?.label ?? placeholder}
            </Text>
            <Icon name="chevron-down" size={18} />
          </Pressable>
        )}
      >
        {({ close }) =>
          options.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: option.value === value }}
              onPress={() => {
                void Haptics.selectionAsync();
                onChange?.(option.value);
                close();
              }}
              className="min-h-12 flex-row items-center justify-between gap-3 rounded-control px-3 active:bg-hover"
            >
              <Text className={`flex-1 text-base ${option.value === value ? 'font-semibold text-accent-text' : 'text-ink'}`}>{option.label}</Text>
              {option.value === value && <Icon name="checkmark" className="accent-accent-text" />}
            </Pressable>
          ))
        }
      </Sheet>
    </FieldShell>
  );
}

function RegisteredSelect({ name, control, onChange, ...props }: SelectProps & { name: string; control: Control<FieldValues> }) {
  const { field } = useController({ name, control });
  return (
    <SelectView
      {...props}
      value={field.value ?? ''}
      onChange={(value) => {
        field.onChange(value);
        onChange?.(value);
      }}
    />
  );
}

/** Pick one from a list, in a bottom sheet. Registered (`{...register('tableId')}`) or controlled. */
export default function Select({ name, control, ...props }: SelectProps) {
  if (name && control) return <RegisteredSelect name={name} control={control} {...props} />;
  return <SelectView {...props} />;
}
