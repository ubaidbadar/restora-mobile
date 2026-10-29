import { useState } from 'react';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import confirm from '@/utils/confirm';
import getAxiosMessage from '@/utils/get_axios_message';
import signOut from '@/utils/sign_out';
import toast from '@/utils/toast';

/** Deletes the signed-in person's account, after asking. Only from their own sign-in, never a shared terminal. */
export default function DeleteAccountButton() {
  const mode = useAuthStore((state) => state.me?.mode);
  const [deleting, setDeleting] = useState(false);
  if (mode !== 'web') return null;

  const ask = async () => {
    const ok = await confirm({
      title: 'Delete your account?',
      message: 'Your sign-in and your place at every restaurant are removed for good. An owner must hand the restaurant over or delete it first.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await api.delete('/account');
      toast.success('Your account was deleted');
      await signOut();
    } catch (err) {
      toast.error(getAxiosMessage(err));
      setDeleting(false);
    }
  };

  return (
    <Button variant="ghost" icon="trash-outline" disabled={deleting} onPress={() => void ask()}>
      {deleting ? 'Deleting…' : 'Delete account'}
    </Button>
  );
}
