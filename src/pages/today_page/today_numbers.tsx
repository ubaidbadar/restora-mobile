import { useWindowDimensions, View } from 'react-native';
import WIDE_WIDTH from '@/constants/wide_width';
import type DashboardAnswer from '@/types/dashboard_answer';
import formatRs from '@/utils/format_rs';
import BreakdownCard from './breakdown_card';
import PaymentSplit from './payment_split';
import SlippingList from './slipping_list';
import StatGrid from '@/components/stat_grid';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';

/** The numbers: four headline figures, then the breakdowns (two side by side on tablets), then who is slipping away. */
export default function TodayNumbers({ data, scope, isToday }: { data: DashboardAnswer; scope: string; isToday: boolean }) {
  const wide = useWindowDimensions().width >= WIDE_WIDTH;
  const { stats } = data;
  const orders = (count: number) => (count === 1 ? '1 order' : `${count} orders`);

  return (
    <View className="gap-4">
      <StatGrid
        stats={[
          { label: isToday ? 'Sales today' : 'Sales', value: formatRs(stats.sales), hint: orders(stats.orderCount) },
          { label: 'Average order', value: formatRs(stats.orderCount ? stats.sales / stats.orderCount : 0) },
          { label: 'New customers', value: String(stats.newCustomers), hint: isToday ? 'Added today' : 'Added in these days' },
          { label: 'Khata outstanding', value: formatRs(stats.khataTotal), hint: stats.khataCustomers === 1 ? '1 customer owes' : `${stats.khataCustomers} customers owe` },
        ]}
      />
      {scope === 'all' && <BreakdownCard title="Sales by branch" rows={data.perBranch.map((row) => ({ key: row.branch._id, label: row.branch.name, count: row.cancelledCount ? `${orders(row.orderCount)} · ${row.cancelledCount} cancelled` : orders(row.orderCount), amount: formatRs(row.sales) }))} />}
      <View className={wide ? 'flex-row gap-4' : 'gap-4'}>
        <View className={wide ? 'flex-1' : ''}>
          <BreakdownCard title="Orders by type" rows={stats.byType.map((row) => ({ key: row.type, label: row.type === 'cancelled' ? 'Cancelled' : ORDER_TYPE_LABELS[row.type], count: orders(row.count), amount: formatRs(row.sales) }))} />
        </View>
        <View className={wide ? 'flex-1' : ''}>
          <PaymentSplit cash={stats.cash} digital={stats.digital} notCollected={stats.notCollected} />
        </View>
      </View>
      <SlippingList customers={data.slipping} total={data.slippingTotal} />
    </View>
  );
}
