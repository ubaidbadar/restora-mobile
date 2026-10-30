import type { ReactNode } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import EmptyState from '@/components/empty_state';
import LoadFailed from '@/components/load_failed';
import SkeletonList from '@/components/skeleton_list';
import STATUS_LABELS from '@/constants/status_labels';
import useGet from '@/hooks/useGet';
import type OrderHistory from '@/types/order_history';
import type OrderStatus from '@/types/order_status';
import Chips from '@/ui/chips';
import formatRs from '@/utils/format_rs';
import HistoryOrderSheet from './history_order_sheet';
import LoadMore from './load_more';

const STATUSES: OrderStatus[] = ['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];

interface OrderHistoryScreenProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  /** The page title, the search and the Filter button. */
  header: ReactNode;
}

/**
 * Days other than today: no board (their orders are nearly all done), but the numbers and a list loaded 50 at a time,
 * however many days are picked. Search, status and type are the route's params; the status tabs keep every count (the
 * server's summary), so picking one never hides the others. The search and type are set in the header.
 */
export default function OrderHistoryScreen({ from, to, header }: OrderHistoryScreenProps) {
  const { q = '', status = 'all', type = 'all' } = useLocalSearchParams<{ q?: string; status?: string; type?: string }>();
  const params = { from, to, q: q || undefined, status: status === 'all' ? undefined : status, type: type === 'all' ? undefined : type };
  const { data, loading, refreshing, get, update } = useGet<OrderHistory>('/orders/history', { params });

  if (loading || !data?.summary) {
    return (
      <View className="flex-1 gap-3 bg-canvas px-4">
        {header}
        {loading ? <SkeletonList rows={6} /> : <LoadFailed what="the orders" onRetry={() => get()} />}
      </View>
    );
  }

  const { summary } = data;
  const byStatus = (value: OrderStatus) => (summary.byStatus[value] ?? 0) + (value === 'new' ? (summary.byStatus.pending ?? 0) : 0);
  const cancelled = summary.byStatus.cancelled ?? 0;
  const counted = summary.count - cancelled - (summary.byStatus.pending ?? 0);

  return (
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-2 px-4 pb-32"
      data={data.orders}
      keyExtractor={(order) => order._id}
      renderItem={({ item }) => <HistoryOrderSheet order={item} showDay={from !== to} />}
      refreshControl={<RefreshControl refreshing={Boolean(refreshing)} onRefresh={() => get()} />}
      ListHeaderComponent={
        <View className="gap-3 pb-1">
          {header}
          {/* One short card: the sales first, the rest on a line under it. */}
          <View accessibilityLabel="Numbers" className="gap-1 rounded-card border border-border bg-surface px-4 py-3">
            <Text className="text-sm text-muted">Sales (cancelled left out)</Text>
            <Text className="text-metric font-bold text-ink">{formatRs(summary.sales)}</Text>
            <View className="mt-1 flex-row flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2">
              <Text className="text-sm text-muted"><Text className="font-semibold text-ink">{summary.count}</Text> orders</Text>
              <Text className="text-sm text-muted">Average <Text className="font-semibold text-ink">{formatRs(counted ? summary.sales / counted : 0)}</Text></Text>
              <Text className="text-sm text-muted"><Text className="font-semibold text-ink">{cancelled}</Text> cancelled</Text>
            </View>
          </View>
          <Chips
            className="-mx-4"
            options={[{ value: 'all', label: 'All', count: summary.count }, ...STATUSES.map((value) => ({ value: value as string, label: STATUS_LABELS[value], count: byStatus(value) }))]}
            value={status}
            onChange={(value) => router.setParams({ status: value === 'all' ? undefined : value })}
          />
        </View>
      }
      ListEmptyComponent={<EmptyState icon="receipt-outline" title="No orders found" text={summary.count ? 'Try another status, type or search.' : 'Pick other days to see their orders.'} />}
      ListFooterComponent={
        data.next ? (
          <LoadMore
            params={params}
            next={data.next}
            onLoaded={(page) => update((current) => current && { ...current, orders: [...current.orders, ...page.orders], next: page.next })}
          />
        ) : undefined
      }
    />
  );
}
