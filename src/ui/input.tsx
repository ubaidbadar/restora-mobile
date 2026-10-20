import { TextInput, View } from 'react-native';
import { useController } from 'react-hook-form';
import type InputProps from '@/types/input_props';
import formInputBaseClasses from '@/utils/form_input_base_classes';
import FieldShell from './field_shell';

function InputView({ label, hint, error, required, trailing, multiline, ...props }: InputProps) {
  return (
    <FieldShell label={label} required={required} hint={hint} error={error}>
      <View className={`${formInputBaseClasses} ${multiline ? 'items-start' : ''} ${error ? 'border-danger-600' : 'border-border-strong'}`}>
        <TextInput
          accessibilityLabel={label}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColorClassName="accent-subtle"
          selectionColorClassName="accent-primary"
          cursorColorClassName="accent-primary"
          className={`flex-1 px-3.5 text-base text-ink ${multiline ? 'min-h-24 py-3' : 'min-h-12'}`}
          {...props}
          aria-invalid={Boolean(error)}
          aria-required={required}
        />
        {trailing}
      </View>
    </FieldShell>
  );
}

function RegisteredInput({ name, control, onChangeText, onBlur, ...props }: InputProps & Required<Pick<InputProps, 'name' | 'control'>>) {
  const { field } = useController({ name, control });
  return (
    <InputView
      {...props}
      value={field.value === undefined || field.value === null ? '' : String(field.value)}
      onChangeText={(text) => {
        field.onChange(text);
        onChangeText?.(text);
      }}
      onBlur={(event) => {
        field.onBlur();
        onBlur?.(event);
      }}
    />
  );
}

/** A text field. Registered (`{...register('phone')}`) or controlled (`value` + `onChangeText`). */
export default function Input({ name, control, ...props }: InputProps) {
  if (name && control) return <RegisteredInput name={name} control={control} {...props} />;
  return <InputView {...props} />;
}
