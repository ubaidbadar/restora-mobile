import type { Control, FieldErrors, FieldValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type FormStatus from './form_status';

/** What `Form` gives its `component`. Pass it down with `{...props}`. */
export default interface FormComponentProps extends FormStatus {
  /** `{...register('phone')}` on a field: native inputs read and write the form through `control`. */
  register: (name: string) => { name: string; control: Control<FieldValues> };
  errors: FieldErrors<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  control: Control<FieldValues>;
  /** Validates and submits; the form's main button calls it. */
  onSubmit: () => void;
}
