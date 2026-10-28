import api from '@/config/api';
import authClient from '@/config/auth_api';
import useAuthStore from '@/store/auth_store';
import offlineDb from './offline_db';

/**
 * Signs out of this device. Nobody is signed in afterwards: that is known without asking. First the phone is taken off
 * the guests' alerts, so the next person on it does not get the last one's.
 */
export default async function signOut() {
  const token = await offlineDb.get<string>('push_token');
  if (token) await api.post('/push-devices/remove', { token }).then(() => offlineDb.set('push_token', null), () => undefined);
  return authClient
    .signOut()
    .catch(() => undefined)
    .then(() => useAuthStore.getState().setMe(null));
}
