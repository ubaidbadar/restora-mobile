import { Link } from 'expo-router';
import { Text } from 'react-native';
import AuthCard from '@/components/auth_card';
import AuthForm from '@/components/auth_form';
import authClient from '@/config/auth_api';
import WEB_URL from '@/constants/web_url';
import Button from '@/ui/button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import forgotPasswordSchema from './schema';

/** Asks for a reset link. The link opens Restora on the web to choose the new password; then they sign in here. */
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email. We'll send you a link to choose a new password."
      footer={
        <Link href="/sign_in" dismissTo asChild>
          <Button variant="primaryLink">Back to sign in</Button>
        </Link>
      }
    >
      <AuthForm
        schema={forgotPasswordSchema}
        submitLabel="Email me a link"
        busyLabel="Sending…"
        onSubmit={async ({ data, onSuccess, onError }) => {
          const { error } = await authClient.requestPasswordReset({ email: data.email, redirectTo: `${WEB_URL}/reset-password` });
          if (error) return onError(error.message ?? 'Could not send the link. Try again.');
          onSuccess('');
        }}
        fields={({ register, errors, message }) =>
          // The answer is the same whether or not the email has an account.
          message === '' ? (
            <Text accessibilityRole="alert" className="rounded-control bg-success-50 px-3 py-3 text-base text-success-700">
              If this email has an account, a link is on its way. It works for one hour.
            </Text>
          ) : (
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
          )
        }
      />
    </AuthCard>
  );
}
