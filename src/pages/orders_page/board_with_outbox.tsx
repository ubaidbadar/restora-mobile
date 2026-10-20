import { Link } from 'expo-router';
import { ScrollView } from 'react-native';
import EmptyState from '@/components/empty_state';
import useOutboxStore from '@/store/outbox_store';
import Button from '@/ui/button';
import withOutbox from '@/utils/with_outbox';
import BoardColumns from './board_columns';
import type BoardProps from './board_props';

/**
 * The board as the server last sent it, with what still waits in this device's outbox laid on top (utils/with_outbox).
 * So a refresh from the server never hides work done offline; it drops out of the outbox once it is sent.
 */
export default function BoardWithOutbox({ orders, header, ...props }: BoardProps) {
  const items = useOutboxStore((state) => state.items);
  // `items` is read so the board updates as the outbox changes; withOutbox reads the outbox itself.
  const shown = items.length ? withOutbox(orders) : orders;

  if (!shown.length) {
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
  return <BoardColumns orders={shown} header={header} {...props} />;
}
