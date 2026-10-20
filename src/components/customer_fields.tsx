import { useState } from 'react';
import type FormComponentProps from '@/types/form_component_props';
import Button from '@/ui/button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';

interface CustomerFieldsProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  /** Adding someone on the spot: just the number and name, the rest behind "Add more details". Editing shows all. */
  quick?: boolean;
}

/** Adding or editing a customer (constants/customer_schema): the number first, as it is what staff ask for. */
export default function CustomerFields({ register, errors, quick = false }: CustomerFieldsProps) {
  const [more, setMore] = useState(!quick);

  return (
    <>
      <Input label="Mobile number" keyboardType="phone-pad" autoComplete="tel" placeholder="0300 1234567" required {...register('phone')} error={fieldError(errors, 'phone')} />
      <Input label="Name" autoCapitalize="words" required {...register('name')} error={fieldError(errors, 'name')} />
      {more ? (
        <>
          <Input label="Other number (optional)" keyboardType="phone-pad" placeholder="Mobile or landline" {...register('altPhone')} error={fieldError(errors, 'altPhone')} />
          <Input label="Area" autoCapitalize="words" placeholder="e.g. Gulberg, DHA Phase 5" {...register('area')} />
          <Input label="Addresses (one per line)" multiline {...register('addresses')} />
          <Input label="Tags (separate with commas)" autoCapitalize="none" placeholder="regular, corporate" {...register('tags')} />
          <Input label="Notes" multiline placeholder="Likes extra spicy, no onions…" {...register('notes')} />
        </>
      ) : (
        <Button variant="ghost" icon="add" className="self-start" onPress={() => setMore(true)}>
          Add more details (area, address, notes)
        </Button>
      )}
    </>
  );
}
