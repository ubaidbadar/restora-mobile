import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import EmptyState from '@/components/empty_state';
import useOutboxStore from '@/store/outbox_store';
import Button from '@/ui/button';
import orderMatches from '@/utils/order_matches';
import withOutbox from '@/utils/with_outbox';
import BoardColumns from './board_columns';
import type BoardProps from './board_props';
import TodayList from './today_list';

/**
 * Today's orders as the server last sent them, with what still waits in this device's outbox laid on top
 * (utils/with_outbox), so a refresh never hides work done offline. Then narrowed by the search and type in the route
 * and shown on the board or as a list. Everything is on the phone already, so it all stays live.
 */
export default function BoardWithOutbox({ orders, header, ...props }: BoardProps) {
  const { q = '', type = 'all', view } = useLocalSearchParams<{ q?: string; type?: string; view?: string }>();
  const items = useOutboxStore((state) => state.items);
  // `items` is read so the board updates as the outbox changes; withOutbox reads the outbox itself.
  const all = items.length ? withOutbox(orders) : orders;
  const shown = all.filter((order) => (type === 'all' || order.type === type) && orderMatches(order, q));

  if (!all.length) {
    return (
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="px-4">
        {header}
        <EmptyState icon="receipt-outline" title="No orders today yet" text="Orders you place show here, from new to served and paid.">
          <Link href="/order/new" asChild>
            <Button icon="add">New order</Button>
          </Link>
        </EmptyState>
      </ScrollView>
    );
  }
  return view === 'list' ? <TodayList orders={shown} header={header} {...props} /> : <BoardColumns orders={shown} header={header} {...props} />;
}
