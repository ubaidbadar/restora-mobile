import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import type { FieldValues } from 'react-hook-form';
import type { ZodType } from 'zod';
import type FormComponentProps from './form_component_props';
import type SubmitProps from './submit_props';

export default interface FormProps extends ViewProps {
  component: (props: FormComponentProps) => ReactNode;
  onSubmit?: (props: SubmitProps) => unknown;
  defaultValues?: FieldValues;
  schema?: ZodType<any, any, any>;
}
