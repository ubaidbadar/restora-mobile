import type OrderAlertState from '@/types/order_alert_state';
import offlineDb from '@/utils/offline_db';
import createStore from './create_store';

/**
 * New orders this phone was told about and nobody has looked at yet (`fresh`, highlighted on the board), and whether
 * it chimes for them. The sound setting is kept on this phone; the highlights only while the app runs.
 */
const useOrderAlertStore = createStore<OrderAlertState>((set, get) => ({
  fresh: [],
  muted: false,
  add: (id) => {
    if (!get().fresh.includes(id)) set({ fresh: [...get().fresh, id] });
  },
  seen: (id) => {
    if (get().fresh.includes(id)) set({ fresh: get().fresh.filter((item) => item !== id) });
  },
  setMuted: (muted) => {
    void offlineDb.set('sound-off', muted);
    set({ muted });
  },
}));

void offlineDb.get<boolean>('sound-off').then((muted) => muted && useOrderAlertStore.setState({ muted }));

export default useOrderAlertStore;
