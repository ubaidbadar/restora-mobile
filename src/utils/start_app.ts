import type Me from '@shared/me';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import can from '@shared/can';
import { Uniwind } from 'uniwind';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import getCache from '@/store/get_cache';
import useOutboxStore from '@/store/outbox_store';
import type OutboxState from '@/types/outbox_state';
import type ThemeChoice from '@/types/theme_choice';
import offlineDb from './offline_db';
import syncOutbox from './sync_outbox';

/**
 * Runs once, before the first screen (src/app/_layout). First what this device saved last time (the answers screens
 * showed, the outbox, the appearance), then who is signed in. Without internet the last `/me` saved here keeps the
 * person signed in, so orders can still be taken.
 */
export default function startApp() {
  Promise.all([
    getCache.load(),
    offlineDb.get<Pick<OutboxState, 'items' | 'savedIds'>>('outbox').then((saved) => saved && useOutboxStore.setState(saved)),
    offlineDb.get<ThemeChoice>('theme').then((theme) => theme && Uniwind.setTheme(theme)),
  ])
    .then(() => api.get<Me>('/me'))
    .then((res) => useAuthStore.getState().setMe(res.data))
    .catch(async (err) => {
      // A 401 was already handled by the api interceptor (signed out).
      if (useAuthStore.getState().me !== undefined) return;
      const saved = err.response ? undefined : await offlineDb.get<Me>('me');
      useAuthStore.getState().setMe(saved ?? null);
    })
    .finally(() => void syncOutbox());

  // Who is signed in is kept on the device for the next offline start; signing out forgets it and every saved answer.
  useAuthStore.subscribe(() => {
    const { me } = useAuthStore.getState();
    if (me) void offlineDb.set('me', me);
    if (me === null) {
      void offlineDb.set('me', null);
      getCache.clear();
    }
  });

  // An alert that comes while the app is open is not shown: the live stream already put up a toast and buzzed. Without
  // orders:view there is no live stream, so it shows.
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      const workplace = useAuthStore.getState().me?.workplace;
      const show = !workplace || !can(workplace, 'orders:view');
      return { shouldShowBanner: show, shouldShowList: true, shouldPlaySound: show, shouldSetBadge: false };
    },
  });

  // Back online: send what waited. While anything waits, try every 30 seconds too.
  NetInfo.addEventListener((state) => {
    const online = state.isConnected !== false && state.isInternetReachable !== false;
    const wasOnline = useOutboxStore.getState().online;
    useOutboxStore.getState().setOnline(online);
    if (online && !wasOnline) void syncOutbox();
  });
  setInterval(() => useOutboxStore.getState().items.length && void syncOutbox(), 30_000);
}
