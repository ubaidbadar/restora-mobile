import { Switch, Text, View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';

interface ToggleProps {
  label: string;
  hint?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  /** From `{...register('hidden')}`. */
  name?: string;
  control?: Control<FieldValues>;
}

/** An on/off setting: label on the start side, the platform's switch on the end. */
function ToggleView({ label, hint, value = false, onChange, disabled }: ToggleProps) {
  return (
    <View className="min-h-12 flex-row items-center gap-3">
      <View className="flex-1">
        <Text className="text-base text-ink">{label}</Text>
        {hint && <Text className="text-sm text-muted">{hint}</Text>}
      </View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} disabled={disabled} trackColorOnClassName="accent-primary" trackColorOffClassName="accent-border-strong" thumbColorClassName="accent-surface" />
    </View>
  );
}

function RegisteredToggle({ name, control, ...props }: ToggleProps & { name: string; control: Control<FieldValues> }) {
  const { field } = useController({ name, control });
  return <ToggleView {...props} value={Boolean(field.value)} onChange={field.onChange} />;
}

/** Registered (`{...register('hidden')}`) or controlled (`value` + `onChange`). */
export default function Toggle({ name, control, ...props }: ToggleProps) {
  if (name && control) return <RegisteredToggle name={name} control={control} {...props} />;
  return <ToggleView {...props} />;
}
