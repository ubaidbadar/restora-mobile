import can from '@shared/can';
import { RefreshControl, ScrollView, View } from 'react-native';
import useGet from '@/hooks/useGet';
import useAuthStore from '@/store/auth_store';
import type DashboardAnswer from '@/types/dashboard_answer';
import Tabs from '@/ui/tabs';
import Skeleton from '@/ui/skeleton';
import dayKey from '@/utils/day_key';
import formatDay from '@/utils/format_day';
import PageHeader from '@/components/page_header';
import TabScreen from '@/components/tab_screen';
import TodayNumbers from './today_numbers';

const SCOPES = [
  { value: 'branch', label: 'This branch' },
  { value: 'all', label: 'All branches' },
];

/** Today's numbers for the working branch or, for people allowed to, all branches; and customers who need a nudge. */
export default function TodayPage() {
  const { data, loading, refreshing, options, get } = useGet<DashboardAnswer>('/dashboard', { params: { scope: 'branch' } });
  const workplace = useAuthStore.getState().me?.workplace;
  const scope: string = options.params.scope;

  return (
    <TabScreen>
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-4 px-4 pb-32"
        refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}
      >
        <PageHeader
          title="Today"
          subtitle={`${formatDay(`${dayKey()}T12:00:00+05:00`)} · ${scope === 'all' ? 'All branches' : (workplace?.branch?.name ?? 'No branch open')}`}
        />
      {can(workplace, 'reports:view_all_branches') && <Tabs options={SCOPES} value={scope} onChange={(value) => get({ params: { scope: value } }, { reuse: true })} />}
      {data && !loading ? (
        <TodayNumbers data={data} scope={scope} />
      ) : (
        <View accessibilityLabel="Loading today's numbers" className="gap-4">
          <Skeleton className="h-44 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </View>
      )}
      </ScrollView>
    </TabScreen>
  );
}
