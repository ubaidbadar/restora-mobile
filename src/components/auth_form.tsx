import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { FieldValues } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import type FormProps from '@/types/form_props';
import Button from '@/ui/button';
import Form from '@/ui/form';

interface AuthFormProps {
  schema: FormProps['schema'];
  defaultValues?: FieldValues;
  submitLabel: string;
  /** What the button says while saving, e.g. "Signing in…", so a slow connection never looks like a dead tap. */
  busyLabel?: string;
  fields: (form: FormComponentProps) => ReactNode;
  onSubmit: NonNullable<FormProps['onSubmit']>;
}

/** The form shared by sign in, create account and the first-run setup. The server's answer shows above the button. */
export default function AuthForm({ schema, defaultValues, submitLabel, busyLabel = 'Please wait…', fields, onSubmit }: AuthFormProps) {
  return (
    <Form
      schema={schema}
      defaultValues={defaultValues}
      className="flex-1 gap-4"
      onSubmit={onSubmit}
      component={(form) => (
        <>
          {fields(form)}
          {/* The error and the button go to the bottom of the screen, where the thumb is. */}
          <View className="mt-auto" />
          {form.error && (
            <Text accessibilityRole="alert" className="rounded-control bg-danger-50 px-3 py-2.5 text-sm font-medium text-danger-700">
              {form.error}
            </Text>
          )}
          <Button size="lg" disabled={form.loading} onPress={form.onSubmit}>
            {form.loading ? busyLabel : submitLabel}
          </Button>
        </>
      )}
    />
  );
}
