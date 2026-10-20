import type { ReactNode } from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import type { TextInputProps } from 'react-native';

export default interface InputProps extends TextInputProps {
  /** From `{...register('name')}`. */
  name?: string;
  control?: Control<FieldValues>;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Something at the end of the box, e.g. the show-password button. */
  trailing?: ReactNode;
}
