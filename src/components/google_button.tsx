import type Me from '@shared/me';
import { useState } from 'react';
import authClient from '@/config/auth_api';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import toast from '@/utils/toast';

/** The server's refusals, in words. */
const GOOGLE_ERRORS: Record<string, string> = {
  'account not linked': 'This email already has a Restora account that is not confirmed yet. Sign in with your password and confirm your email first, then Google works too.',
  'unable to create user': 'Google has not confirmed this email, so we could not make an account with it. Create an account with your email instead.',
};

/** Google's own sign-in sheet; its ID token signs them in to Restora, and the answer carries `/me`. */
export default function GoogleButton() {
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    // Loaded on tap: the native module is missing in Expo Go, where importing it would crash.
    const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = await import('@react-native-google-signin/google-signin');
    setBusy(true);
    try {
      GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID });
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      // Cancelled: nothing to say.
      if (!isSuccessResponse(response) || !response.data.idToken) return;
      // Only the token is needed. Forgetting the Google account on the phone lets them pick another one next time.
      await GoogleSignin.signOut();
      const { data, error } = await authClient.signIn.social({ provider: 'google', idToken: { token: response.data.idToken } });
      if (error) return toast.error(GOOGLE_ERRORS[error.message ?? ''] ?? error.message ?? 'Could not sign in with Google. Try again.');
      useAuthStore.getState().setMe((data as unknown as { me: Me }).me);
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS) return;
      toast.error(
        isErrorWithCode(err) && err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
          ? 'Google Play services is missing or out of date on this phone.'
          : 'Could not sign in with Google. Try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="lg" icon="logo-google" disabled={busy} onPress={signIn}>
      {busy ? 'Signing in…' : 'Continue with Google'}
    </Button>
  );
}
