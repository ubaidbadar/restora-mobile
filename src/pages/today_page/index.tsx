import can from '@shared/can';
import { RefreshControl, ScrollView, View } from 'react-native';
import useGet from '@/hooks/useGet';
import useAuthStore from '@/store/auth_store';
import type DashboardAnswer from '@/types/dashboard_answer';
import Segmented from '@/ui/segmented';
import Skeleton from '@/ui/skeleton';
import dayKey from '@/utils/day_key';
import formatDayRange from '@/utils/format_day_range';
import DateRangeBar from '@/components/date_range_bar';
import PageHeader from '@/components/page_header';
import TabScreen from '@/components/tab_screen';
import TodayNumbers from './today_numbers';

const SCOPES = [
  { value: 'branch', label: 'This branch' },
  { value: 'all', label: 'All branches' },
];

/** The picked days' numbers (today at first) for the working branch or, for people allowed to, all branches; and customers who need a nudge. */
export default function TodayPage() {
  const { data, loading, refreshing, options, get } = useGet<DashboardAnswer>('/dashboard', { params: { scope: 'branch', from: dayKey(), to: dayKey() } });
  const workplace = useAuthStore.getState().me?.workplace;
  const { scope, from, to }: { scope: string; from: string; to: string } = options.params;
  const isToday = from === to && to === dayKey();

  return (
    <TabScreen>
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-4 px-4 pb-32"
        refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}
      >
        <PageHeader
          title={isToday ? 'Today' : 'Dashboard'}
          subtitle={`${formatDayRange(from, to)} · ${scope === 'all' ? 'All branches' : (workplace?.branch?.name ?? 'No branch open')}`}
        />
      <DateRangeBar from={from} to={to} onChange={(from, to) => get({ params: { from, to } }, { reuse: true })} />
      {can(workplace, 'reports:view_all_branches') && <Segmented options={SCOPES} value={scope} onChange={(value) => get({ params: { scope: value } }, { reuse: true })} />}
      {data && !loading ? (
        <TodayNumbers data={data} scope={scope} isToday={isToday} />
      ) : (
        <View accessibilityLabel="Loading the numbers" className="gap-4">
          <Skeleton className="h-44 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </View>
      )}
      </ScrollView>
    </TabScreen>
  );
}
