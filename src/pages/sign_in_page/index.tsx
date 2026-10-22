import type Me from '@shared/me';
import { Link, router } from 'expo-router';
import { Text } from 'react-native';
import AuthCard from '@/components/auth_card';
import AuthForm from '@/components/auth_form';
import authClient from '@/config/auth_api';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import Input from '@/ui/input';
import PasswordInput from '@/ui/password_input';
import fieldError from '@/utils/field_error';
import signInSchema from './schema';

/** Sign in with email and password. The answer carries `/me`, so the app opens without a second request. */
export default function SignInPage() {
  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back to Restora."
      footer={
        <>
          <Text className="text-base text-muted">New to Restora?</Text>
          <Link href="/sign_up" asChild>
            <Button variant="primaryLink">Create an account</Button>
          </Link>
        </>
      }
    >
      <AuthForm
        schema={signInSchema}
        submitLabel="Sign in"
        busyLabel="Signing in…"
        onSubmit={async ({ data, onSuccess, onError }) => {
          const { data: answer, error } = await authClient.signIn.email({ email: data.email, password: data.password });
          // Not confirmed yet: the server just emailed a fresh code.
          if (error?.code === 'EMAIL_NOT_VERIFIED') {
            onSuccess('');
            return router.push({ pathname: '/check_email', params: { email: data.email } });
          }
          if (error) return onError(error.message ?? 'Could not sign in. Try again.');
          onSuccess('');
          useAuthStore.getState().setMe((answer as unknown as { me: Me }).me);
        }}
        fields={({ register, errors }) => (
          <>
            <Input
              label="Email"
              keyboardType="email-address"
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              required
              {...register('email')}
              error={fieldError(errors, 'email')}
            />
            <PasswordInput label="Password" autoComplete="current-password" textContentType="password" returnKeyType="go" required {...register('password')} error={fieldError(errors, 'password')} />
            <Link href="/forgot_password" asChild>
              <Button variant="primaryLink" size="sm" className="self-end">
                Forgot password?
              </Button>
            </Link>
          </>
        )}
      />
    </AuthCard>
  );
}
