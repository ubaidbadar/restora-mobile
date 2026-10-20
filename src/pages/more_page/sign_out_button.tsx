import Button from '@/ui/button';
import confirm from '@/utils/confirm';
import signOut from '@/utils/sign_out';

/** Signs out of this phone, after asking. */
export default function SignOutButton() {
  const ask = async () => {
    const ok = await confirm({ title: 'Sign out?', message: 'Orders still waiting to be sent stay on this phone and go out after the next sign-in.', confirmLabel: 'Sign out', destructive: true });
    if (ok) void signOut();
  };

  return (
    <Button variant="danger" size="lg" icon="log-out-outline" onPress={() => void ask()}>
      Sign out
    </Button>
  );
}
