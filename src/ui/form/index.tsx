import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { View } from 'react-native';
import { useForm, type FieldValues, type Resolver } from 'react-hook-form';
import type FormProps from '@/types/form_props';
import type FormStatus from '@/types/form_status';
import getAxiosMessage from '@/utils/get_axios_message';

/** Every form. `component` gets `register`, `errors`, `control`, `onSubmit` and the save status. */
export default function Form({ component, onSubmit, defaultValues, schema, ...props }: FormProps) {
  const { handleSubmit, formState, reset, setError, setValue, watch, control } = useForm<FieldValues>({
    defaultValues,
    resolver: schema ? (zodResolver(schema) as Resolver<FieldValues>) : undefined,
  });
  const [status, setStatus] = useState<FormStatus>({});

  const submit = async (data: FieldValues) => {
    if (status.loading || !onSubmit) return;
    setStatus({ loading: true });
    try {
      await onSubmit({
        data,
        onProgress: (message) => setStatus({ loading: true, message }),
        setValue: (name, value) => setValue(name, value),
        onSuccess: (message) => setStatus({ message }),
        onError: (error) => setStatus({ error: getAxiosMessage(error) }),
        onReset: () => {
          reset();
          setStatus({});
        },
        setError: (name, message) => {
          setStatus({});
          setError(name, { message });
        },
      });
    } catch (err) {
      setStatus({ error: getAxiosMessage(err) });
    }
  };

  return (
    <View {...props}>
      {component({
        register: (name) => ({ name, control }),
        errors: formState.errors,
        ...status,
        setValue,
        watch,
        control,
        onSubmit: () => void handleSubmit(submit)(),
      })}
    </View>
  );
}
