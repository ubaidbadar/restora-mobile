import { useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import AuthCard from '@/components/auth_card';
import authClient from '@/config/auth_api';
import WEB_URL from '@/constants/web_url';
import Button from '@/ui/button';
import toast from '@/utils/toast';

/** After creating an account (or signing in before confirming): open the emailed link, then sign in here. */
export default function CheckEmailPage() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [sending, setSending] = useState(false);

  const resend = () => {
    if (sending) return;
    setSending(true);
    authClient
      .sendVerificationEmail({ email, callbackURL: WEB_URL })
      .then(({ error }) =>
        error ? toast.error(error.message ?? 'Could not send the email. Try again in a minute.') : toast.success('Sent. Check your inbox.')
      )
      .finally(() => setSending(false));
  };

  return (
    <AuthCard
      edges={['bottom']}
      title="Check your email"
      subtitle={email ? `We sent a link to ${email}. Open it to confirm your email.` : 'Open the link we emailed you to confirm your email.'}
    >
      <View className="gap-5">
        <Text className="text-base text-body">The link works for one hour. Not there? Look in spam, or send it again.</Text>
        <View className="gap-3 pt-2">
          <Link href="/sign_in" dismissTo asChild>
            <Button size="lg">{"I've confirmed it, sign in"}</Button>
          </Link>
          {email !== '' && (
            <Button variant="outline" size="lg" disabled={sending} onPress={resend}>
              {sending ? 'Sending link…' : 'Send the link again'}
            </Button>
          )}
        </View>
      </View>
    </AuthCard>
  );
}
