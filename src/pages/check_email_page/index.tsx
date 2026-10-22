import type Me from '@shared/me';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import AuthCard from '@/components/auth_card';
import AuthForm from '@/components/auth_form';
import authClient from '@/config/auth_api';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import ResendButton from './resend_button';
import checkEmailSchema from './schema';

/** After creating an account (or signing in before confirming): type the emailed code. It confirms the email and signs in. */
export default function CheckEmailPage() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();

  return (
    <AuthCard
      edges={['bottom']}
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${email}. Enter it to confirm your email.`}
      footer={
        <Link href="/sign_in" dismissTo asChild>
          <Button variant="primaryLink">Used the link instead? Sign in</Button>
        </Link>
      }
    >
      <AuthForm
        schema={checkEmailSchema}
        submitLabel="Confirm email"
        busyLabel="Checking…"
        onSubmit={async ({ data, onSuccess, onError }) => {
          const { data: answer, error } = await authClient.emailOtp.verifyEmail({ email, otp: data.code });
          if (error) return onError(error.message ?? 'Could not check the code. Try again.');
          onSuccess('');
          // Signed in: the answer carries /me, and the app opens.
          useAuthStore.getState().setMe((answer as unknown as { me: Me }).me);
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
              returnKeyType="go"
              required
              {...register('code')}
              error={fieldError(errors, 'code')}
            />
            <Text className="text-base text-body">The code works for 10 minutes. Not there? Look in spam, or send a new one.</Text>
            <ResendButton email={email} />
          </>
        )}
      />
    </AuthCard>
  );
}
