import { router } from 'expo-router';
import AuthForm from '@/components/auth_form';
import authClient from '@/config/auth_api';
import WEB_URL from '@/constants/web_url';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import forgotPasswordSchema from './schema';

/** Asks for a code. The same email has a link to Restora on the web, for anyone who would rather tap. */
export default function RequestForm() {
  return (
    <AuthForm
      schema={forgotPasswordSchema}
      submitLabel="Email me a code"
      busyLabel="Sending…"
      onSubmit={async ({ data, onSuccess, onError }) => {
        const { error } = await authClient.requestPasswordReset({ email: data.email, redirectTo: `${WEB_URL}/reset-password` });
        if (error) return onError(error.message ?? 'Could not send the code. Try again.');
        onSuccess('');
        router.setParams({ email: data.email });
      }}
      fields={({ register, errors }) => (
        <Input
          label="Email"
          keyboardType="email-address"
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          required
          {...register('email')}
          error={fieldError(errors, 'email')}
        />
      )}
    />
  );
}
