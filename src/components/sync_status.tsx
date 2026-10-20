import { Pressable, Text } from 'react-native';
import useOutboxStore from '@/store/outbox_store';
import Icon from '@/ui/icon';
import syncOutbox from '@/utils/sync_outbox';

/**
 * A pill above the bottom edge: offline (orders still work; they wait on this device), or back online and sending
 * what waited. Tap it to try sending now. Nothing when online with nothing waiting.
 */
export default function SyncStatus() {
  const online = useOutboxStore((state) => state.online);
  const waiting = useOutboxStore((state) => state.items.length);
  if (online && !waiting) return null;

  const label = online ? `Sending ${waiting} saved ${waiting === 1 ? 'change' : 'changes'}…` : `Offline${waiting ? ` · ${waiting} waiting` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. Tap to try sending now.`}
      onPress={() => void syncOutbox()}
      className="min-h-9 flex-row items-center gap-2 rounded-control bg-ink px-4 active:opacity-80"
    >
      <Icon name={online ? 'sync' : 'cloud-offline-outline'} size={16} className={online ? 'accent-inverse-primary' : 'accent-warning-500'} />
      <Text className="text-sm font-semibold text-canvas">{label}</Text>
    </Pressable>
  );
}
