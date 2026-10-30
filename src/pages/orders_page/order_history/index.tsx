import type { ReactNode } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import EmptyState from '@/components/empty_state';
import LoadFailed from '@/components/load_failed';
import SkeletonList from '@/components/skeleton_list';
import StatGrid from '@/components/stat_grid';
import ORDER_TYPE_OPTIONS from '@/constants/order_type_options';
import STATUS_LABELS from '@/constants/status_labels';
import useGet from '@/hooks/useGet';
import type OrderHistory from '@/types/order_history';
import type OrderStatus from '@/types/order_status';
import SearchField from '@/ui/search_field';
import Tabs from '@/ui/tabs';
import formatRs from '@/utils/format_rs';
import HistoryOrderSheet from './history_order_sheet';
import LoadMore from './load_more';

const STATUSES: OrderStatus[] = ['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];

interface OrderHistoryScreenProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  /** The page title and the days. */
  header: ReactNode;
}

/**
 * Days other than today: no board (their orders are nearly all done), but the numbers and a list loaded 50 at a time,
 * however many days are picked. Search, status and type are the route's params; the status and type tabs keep every
 * count (the server's summary), so picking one never hides the others.
 */
export default function OrderHistoryScreen({ from, to, header }: OrderHistoryScreenProps) {
  const { q = '', status = 'all', type = 'all' } = useLocalSearchParams<{ q?: string; status?: string; type?: string }>();
  const params = { from, to, q: q || undefined, status: status === 'all' ? undefined : status, type: type === 'all' ? undefined : type };
  const { data, loading, refreshing, get, update } = useGet<OrderHistory>('/orders/history', { params });

  const search = (
    <SearchField
      accessibilityLabel="Search orders"
      placeholder="Token, name, phone or table"
      defaultValue={q}
      onSubmitEditing={(event) => router.setParams({ q: event.nativeEvent.text.trim() || undefined })}
    />
  );
  if (loading || !data?.summary) {
    return (
      <View className="flex-1 gap-3 bg-canvas px-4">
        {header}
        {search}
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
          {search}
          <StatGrid
            stats={[
              { label: 'Orders', value: String(summary.count) },
              { label: 'Sales', value: formatRs(summary.sales), hint: 'Cancelled orders left out' },
              { label: 'Average order', value: formatRs(counted ? summary.sales / counted : 0) },
              { label: 'Cancelled', value: String(cancelled) },
            ]}
          />
          <Tabs
            scroll
            className="-mx-4"
            options={[{ value: 'all', label: 'All', count: summary.count }, ...STATUSES.map((value) => ({ value: value as string, label: STATUS_LABELS[value], count: byStatus(value) }))]}
            value={status}
            onChange={(value) => router.setParams({ status: value === 'all' ? undefined : value })}
          />
          <Tabs
            scroll
            className="-mx-4"
            options={ORDER_TYPE_OPTIONS.map((option) => ({ ...option, count: option.value === 'all' ? summary.count : (summary.byType[option.value] ?? 0) }))}
            value={type}
            onChange={(value) => router.setParams({ type: value === 'all' ? undefined : value })}
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
