import { Link, router } from 'expo-router';
import { Text } from 'react-native';
import AuthCard from '@/components/auth_card';
import AuthForm from '@/components/auth_form';
import GoogleSignIn from '@/components/google_sign_in';
import authClient from '@/config/auth_api';
import WEB_URL from '@/constants/web_url';
import Button from '@/ui/button';
import Input from '@/ui/input';
import PasswordInput from '@/ui/password_input';
import fieldError from '@/utils/field_error';
import signUpSchema from './schema';

/** Create an account: name, email, password. We email a code to confirm the address; entering it signs them in. */
export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Free for your whole team. Takes a minute."
      footer={
        <>
          <Text className="text-base text-muted">Already have an account?</Text>
          <Link href="/sign_in" dismissTo asChild>
            <Button variant="primaryLink">Sign in</Button>
          </Link>
        </>
      }
    >
      <GoogleSignIn />
      <AuthForm
        schema={signUpSchema}
        submitLabel="Create account"
        busyLabel="Creating your account…"
        onSubmit={async ({ data, onSuccess, onError }) => {
          const { error } = await authClient.signUp.email({ name: data.name, email: data.email, password: data.password, callbackURL: WEB_URL });
          if (error) return onError(error.message ?? 'Could not create the account. Try again.');
          onSuccess('');
          router.replace({ pathname: '/check_email', params: { email: data.email } });
        }}
        fields={({ register, errors }) => (
          <>
            <Input label="Your name" autoComplete="name" textContentType="name" autoCapitalize="words" returnKeyType="next" required {...register('name')} error={fieldError(errors, 'name')} />
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
            <PasswordInput
              label="Password"
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
    </AuthCard>
  );
}
