import type { FieldValues } from 'react-hook-form';

/** What a `Form`'s `onSubmit` receives. Loading stays on until one of onSuccess, onError, onReset or setError is called. */
export default interface SubmitProps {
  data: FieldValues;
  onSuccess: (message: string) => void;
  onError: (error: unknown) => void;
  onReset: () => void;
  setError: (name: string, error: string) => void;
  onProgress: (message: string) => void;
  setValue: (name: string, value: unknown) => void;
}
