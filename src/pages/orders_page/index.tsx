import { View } from 'react-native';
import PageHeader from '@/components/page_header';
import TabScreen from '@/components/tab_screen';
import RequirePermission from '@/hoc/require_permission';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import type Order from '@/types/order';
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

/** Today's orders of the working branch: new, preparing, ready, on the way, done. */
function OrdersBoardScreen() {
  const { data: orders = [], loading, refreshing, update, get } = useGet<Order[]>('/orders');

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
