import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PageHeader from '@/components/page_header';
import TabScreen from '@/components/tab_screen';
import RequirePermission from '@/hoc/require_permission';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import type Order from '@/types/order';
import dayKey from '@/utils/day_key';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import type OrderType from '@/types/order_type';
import formatDayRange from '@/utils/format_day_range';
import upsertById from '@/utils/upsert_by_id';
import BoardWithOutbox from './board_with_outbox';
import OrderHistoryScreen from './order_history';
import OrdersToolbar from './orders_toolbar';

/** The first tab (`/`) for everyone; people whose role can't see orders are told so. */
export default function OrdersPage() {
  const today = dayKey();
  const { from = today, to = today } = useLocalSearchParams<{ from?: string; to?: string }>();
  return (
    <TabScreen>
      <RequirePermission permission="orders:view">
        <OrdersBoardScreen key={`${from}_${to}`} from={from} to={to} />
      </RequirePermission>
    </TabScreen>
  );
}

/**
 * The working branch's orders of the picked days (the route's `from` and `to`, today at first). Today's on the live
 * board (or as a list), kept live by `components/live_updates` with the outbox on top; other days as their numbers and
 * a list loaded a page at a time (`order_history`).
 */
function OrdersBoardScreen({ from, to }: { from: string; to: string }) {
  const today = dayKey();
  const isToday = from === to && to === today;
  const { q = '', status = 'all', type = 'all' } = useLocalSearchParams<{ q?: string; status?: string; type?: string }>();
  // The subtitle names what the filter picked: other days, a type.
  const subtitle = [isToday ? '' : formatDayRange(from, to), type === 'all' ? '' : ORDER_TYPE_LABELS[type as OrderType]].filter(Boolean).join(' · ');

  // New order is the + in the middle of the tab bar. The days, type and view are in the Filter sheet.
  const header = (
    <View className="gap-3 pb-2">
      <PageHeader title="Orders" subtitle={subtitle || undefined} />
      <OrdersToolbar live={isToday} />
    </View>
  );

  if (!isToday) return <OrderHistoryScreen key={`${q}_${status}_${type}`} from={from} to={to} header={header} />;
  return <TodayBoard header={header} />;
}

/** Today's orders, loaded once and kept live by the stream. */
function TodayBoard({ header }: { header: ReactNode }) {
  const { data: orders = [], loading, refreshing, update, get } = useGet<Order[]>('/orders');
  const props = { header, orders, refreshing: Boolean(refreshing), onRefresh: () => get(), onOrderUpdated: (order: Order) => update((current) => (current ? upsertById(current, order) : [order])) };

  if (loading) {
    return (
      <View className="flex-1 gap-3 px-4">
        {header}
        <SkeletonList rows={4} />
      </View>
    );
  }
  return <BoardWithOutbox {...props} />;
}
