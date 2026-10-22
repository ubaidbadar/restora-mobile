import { router } from 'expo-router';
import AuthForm from '@/components/auth_form';
import authClient from '@/config/auth_api';
import Input from '@/ui/input';
import PasswordInput from '@/ui/password_input';
import fieldError from '@/utils/field_error';
import toast from '@/utils/toast';
import codeSchema from './code_schema';

/** The emailed code and the new password; then they sign in with it. */
export default function CodeForm({ email }: { email: string }) {
  return (
    <AuthForm
      schema={codeSchema}
      submitLabel="Save new password"
      busyLabel="Saving…"
      onSubmit={async ({ data, onSuccess, onError }) => {
        const { error } = await authClient.emailOtp.resetPassword({ email, otp: data.code, password: data.password });
        if (error) return onError(error.message ?? 'Could not change the password. Try again.');
        onSuccess('');
        toast.success('Password changed. Sign in with the new one.');
        router.dismissTo('/sign_in');
      }}
      fields={({ register, errors }) => (
        <>
          <Input
            label="Code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={7}
            placeholder="123456"
            returnKeyType="next"
            required
            {...register('code')}
            error={fieldError(errors, 'code')}
          />
          <PasswordInput
            label="New password"
            hint="At least 8 characters."
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            required
            {...register('password')}
            error={fieldError(errors, 'password')}
          />
        </>
      )}
    />
  );
}
