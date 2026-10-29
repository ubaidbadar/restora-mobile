import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import type Role from '@/types/role';
import Input from '@/ui/input';
import Tabs from '@/ui/tabs';
import fieldError from '@/utils/field_error';
import AccessFields from './access_fields';

const CHANNELS = [
  { value: 'email', label: 'By email' },
  { value: 'phone', label: 'By WhatsApp' },
];

/** Who to invite (their email, or the number to send the WhatsApp link to) and what they will be able to do. */
export default function InviteFields({ roles, ...form }: FormComponentProps & { roles: Role[] }) {
  const channel = useWatch({ control: form.control, name: 'channel' });
  return (
    <>
      <Tabs options={CHANNELS} {...form.register('channel')} />
      {channel === 'phone' ? (
        <Input key="phone" label="Mobile number" keyboardType="phone-pad" autoComplete="tel" placeholder="0300 1234567" required {...form.register('phone')} error={fieldError(form.errors, 'phone')} />
      ) : (
        <Input key="email" label="Email" keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} required {...form.register('email')} error={fieldError(form.errors, 'email')} />
      )}
      <Input label="Their name (optional)" autoCapitalize="words" {...form.register('name')} />
      <AccessFields {...form} roles={roles} />
    </>
  );
}
