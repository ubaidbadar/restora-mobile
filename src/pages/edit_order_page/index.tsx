import { useLocalSearchParams } from 'expo-router';
import useOutboxStore from '@/store/outbox_store';
import OrderLoader from './order_loader';

/** The New order screen, filled with a placed order to change it. */
export default function EditOrderPage() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  // Read so the screen follows the outbox (an offline order syncing, a queued change).
  const takenOffline = useOutboxStore((state) => state.items.some((item) => item.id === id && item.url === '/orders'));
  return <OrderLoader id={id} takenOffline={takenOffline} />;
}
