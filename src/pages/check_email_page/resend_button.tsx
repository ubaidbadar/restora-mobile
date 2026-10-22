import { useState } from 'react';
import authClient from '@/config/auth_api';
import WEB_URL from '@/constants/web_url';
import Button from '@/ui/button';
import toast from '@/utils/toast';

/** Sends the email (a new code, and the link) again. */
export default function ResendButton({ email }: { email: string }) {
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
    <Button variant="outline" size="lg" disabled={sending} onPress={resend}>
      {sending ? 'Sending code…' : 'Send a new code'}
    </Button>
  );
}
