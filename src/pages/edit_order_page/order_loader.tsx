import { View } from 'react-native';
import LoadFailed from '@/components/load_failed';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import getCache from '@/store/get_cache';
import useOutboxStore from '@/store/outbox_store';
import type Order from '@/types/order';
import withOutbox from '@/utils/with_outbox';
import MenuLoader from './menu_loader';

/**
 * The order to edit: the board's copy with this device's waiting changes on top (what to edit offline), or the latest
 * from the server. An order taken offline is not on the server yet, so it is not asked for.
 */
export default function OrderLoader({ id, takenOffline }: { id: string; takenOffline: boolean }) {
  const fetched = useGet<Order>(`/orders/${id}`, { active: takenOffline });
  const board = withOutbox(fetched.data ? [fetched.data] : ((getCache.get(getCache.keyOf('/orders')) as Order[] | undefined) ?? []));
  const savedId = useOutboxStore.getState().savedIds[id];
  const order = board.find((item) => item._id === id || item._id === savedId);

  if (order) return <MenuLoader order={order} />;
  return <View className="flex-1 bg-canvas p-4">{fetched.loading ? <SkeletonList rows={5} /> : <LoadFailed what="the order" onRetry={() => fetched.get()} />}</View>;
}
