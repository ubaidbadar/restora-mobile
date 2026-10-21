import { useEffect } from 'react';
import { View } from 'react-native';
import PageHeader from '@/components/page_header';
import TabScreen from '@/components/tab_screen';
import RequirePermission from '@/hoc/require_permission';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import getCache from '@/store/get_cache';
import type Order from '@/types/order';
import dayKey from '@/utils/day_key';
import listenOrders from '@/utils/listen_orders';
import upsertById from '@/utils/upsert_by_id';
import BoardWithOutbox from './board_with_outbox';

/** The first tab (`/`) for everyone; people whose role can't see orders are told so. */
export default function OrdersPage() {
  return (
    <TabScreen>
      <RequirePermission permission="orders:view">
        <OrdersBoardScreen />
      </RequirePermission>
    </TabScreen>
  );
}

/** Today's orders of the working branch: new, preparing, ready, on the way, done. Kept live from the server's stream. */
function OrdersBoardScreen() {
  const { data: orders = [], loading, refreshing, update, get } = useGet<Order[]>('/orders');

  // Orders placed or changed on another device show up as they happen. Only today's belong on the board; after a break
  // in the stream the board loads again for what came in between.
  useEffect(
    () =>
      listenOrders(
        (order) => order.dayKey === dayKey() && getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => (list ? upsertById(list, order) : list)),
        () => get()
      ),
    [get]
  );

  // New order is the + in the middle of the tab bar.
  const header = <PageHeader title="Orders" />;
  return loading ? (
    <View className="flex-1 gap-3 px-4">
      {header}
      <SkeletonList rows={4} />
    </View>
  ) : (
    <BoardWithOutbox header={header} orders={orders} refreshing={Boolean(refreshing)} onRefresh={() => get()} onOrderUpdated={(order) => update((current) => (current ? upsertById(current, order) : [order]))} />
  );
}
