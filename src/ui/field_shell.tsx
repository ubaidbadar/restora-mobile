import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import FieldError from './field_error';

interface FieldShellProps {
  label?: string;
  required?: boolean;
  /** A line under the field that helps fill it in. */
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label (with a red * when required), the control, then a hint or the error. */
export default function FieldShell({ label, required, hint, error, children }: FieldShellProps) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-ink">
          {label}
          {required && <Text className="text-danger-600"> *</Text>}
        </Text>
      )}
      {children}
      {error ? <FieldError>{error}</FieldError> : hint ? <Text className="text-sm text-muted">{hint}</Text> : null}
    </View>
  );
}
