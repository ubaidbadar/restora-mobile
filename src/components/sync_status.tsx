import { Pressable, Text } from 'react-native';
import useOutboxStore from '@/store/outbox_store';
import Icon from '@/ui/icon';
import syncOutbox from '@/utils/sync_outbox';
import belongsToCurrentWorkplace from '@/utils/belongs_to_current_workplace';

/**
 * A pill above the bottom edge: offline (orders still work; they wait on this device), or back online and sending
 * what waited. Tap it to try sending now. Nothing when online with nothing waiting.
 */
export default function SyncStatus() {
  const online = useOutboxStore((state) => state.online);
  const items = useOutboxStore((state) => state.items);
  const pending = items.filter(belongsToCurrentWorkplace);
  const waiting = pending.length;
  const issues = pending.filter((item) => item.syncIssue).length;
  if (online && !waiting) return null;

  const label = issues ? `${issues} saved ${issues === 1 ? 'change needs' : 'changes need'} review` : online ? `Sending ${waiting} saved ${waiting === 1 ? 'change' : 'changes'}…` : `Offline${waiting ? ` · ${waiting} waiting` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={issues ? label : `${label}. Tap to try sending now.`}
      onPress={issues ? undefined : () => void syncOutbox()}
      className="min-h-9 flex-row items-center gap-2 rounded-control bg-ink px-4 active:opacity-80"
    >
      <Icon name={issues ? 'warning-outline' : online ? 'sync' : 'cloud-offline-outline'} size={16} className={online && !issues ? 'accent-inverse-primary' : 'accent-warning-500'} />
      <Text className="text-sm font-semibold text-canvas">{label}</Text>
    </Pressable>
  );
}
