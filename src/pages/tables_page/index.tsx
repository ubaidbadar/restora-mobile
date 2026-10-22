import { Link } from 'expo-router';
import { View } from 'react-native';
import PageHeader from '@/components/page_header';
import TabScreen from '@/components/tab_screen';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import useGet from '@/hooks/useGet';
import type FloorTable from '@/types/floor_table';
import IconButton from '@/ui/icon_button';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import TablesView from './tables_view';

/** The branch's tables: each table and what it needs now, guest calls on top. Scan a table's QR to take its order. */
export default function TablesPage() {
  // Guests' calls and table orders arrive live (`components/live_updates`); pulling down loads the floor again.
  const { data: all = [], loading, refreshing, update, get } = useGet<FloorTable[]>('/tables/floor');

  const answer = (requestId: string) =>
    api
      .post(`/guest-requests/${requestId}/resolve`)
      .then(() => {
        update((current) => current?.map((table) => ({ ...table, requests: table.requests.filter((request) => request._id !== requestId) })));
        toast.success('Call answered');
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  const header = (
    <PageHeader title="Tables">
      <Link href="/tables/scan" asChild>
        <IconButton icon="qr-code-outline" variant="outline" label="Scan a table's QR code" />
      </Link>
    </PageHeader>
  );

  return (
    <TabScreen>
      {loading ? (
        <View className="flex-1 gap-3 px-4">
          {header}
          <SkeletonList rows={4} />
        </View>
      ) : (
        <TablesView header={header} all={all} refreshing={Boolean(refreshing)} onRefresh={() => get()} onAnswer={answer} />
      )}
    </TabScreen>
  );
}
