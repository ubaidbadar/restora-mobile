import authClient from '@/config/auth_api';
import useAuthStore from '@/store/auth_store';

/** Signs out of this device. Nobody is signed in afterwards: that is known without asking. */
export default function signOut() {
  return authClient
    .signOut()
    .catch(() => undefined)
    .then(() => useAuthStore.getState().setMe(null));
}
