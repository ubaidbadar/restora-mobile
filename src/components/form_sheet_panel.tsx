import type { ReactNode } from 'react';
import { Text } from 'react-native';
import type { FieldValues } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import type FormProps from '@/types/form_props';
import type OverlayProps from '@/types/overlay_props';
import Button from '@/ui/button';
import Form from '@/ui/form';
import SheetPanel from '@/ui/sheet_panel';

interface FormSheetPanelProps extends OverlayProps {
  title: string;
  schema: FormProps['schema'];
  defaultValues?: FieldValues;
  submitLabel?: string;
  /** What the button says while saving. */
  busyLabel?: string;
  /** The fields. They receive `register`, `errors` and the rest from `Form`. */
  fields: (form: FormComponentProps) => ReactNode;
  /** Receives validated values. When it throws (the server refused), the sheet stays open and shows why. */
  onSave?: (values: FieldValues) => unknown;
}

/** A bottom sheet with one form in it (the web's FormDrawer). It closes itself when `onSave` succeeds. */
export default function FormSheetPanel({ title, schema, defaultValues, submitLabel = 'Save', busyLabel = 'Saving…', fields, onSave, ...overlay }: FormSheetPanelProps) {
  return (
    <SheetPanel {...overlay} title={title} full>
      <Form
        schema={schema}
        defaultValues={defaultValues}
        className="gap-4"
        onSubmit={async ({ data, onReset }) => {
          await onSave?.(data);
          onReset();
          overlay.close();
        }}
        component={(form) => (
          <>
            {fields(form)}
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
    </SheetPanel>
  );
}
