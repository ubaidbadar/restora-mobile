import { Link, useLocalSearchParams } from 'expo-router';
import AuthCard from '@/components/auth_card';
import Button from '@/ui/button';
import CodeForm from './code_form';
import RequestForm from './request_form';

/** Forgot password: ask for a code by email, then enter it with a new password. */
export default function ForgotPasswordPage() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <AuthCard
      title={email ? 'Choose a new password' : 'Reset your password'}
      subtitle={
        email
          ? `If ${email} has an account, we sent it a 6-digit code. It works for 10 minutes.`
          : "Enter your email. We'll send you a code to choose a new password."
      }
      footer={
        <Link href="/sign_in" dismissTo asChild>
          <Button variant="primaryLink">Back to sign in</Button>
        </Link>
      }
    >
      {email ? <CodeForm email={email} /> : <RequestForm />}
    </AuthCard>
  );
}
