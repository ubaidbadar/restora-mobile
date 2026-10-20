import { Text, View } from 'react-native';
import type FloorTable from '@/types/floor_table';
import Button from '@/ui/button';
import Icon from '@/ui/icon';
import minutesSince from '@/utils/minutes_since';

interface CallsStripProps {
  tables: FloorTable[];
  onAnswer: (requestId: string) => void;
}

/** Guest calls waiting for an answer, oldest first, each with a Done button. Nothing when there are none. */
export default function CallsStrip({ tables, onAnswer }: CallsStripProps) {
  const calls = tables.flatMap((table) => table.requests.map((request) => ({ ...request, tableName: table.name }))).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!calls.length) return null;

  return (
    <View accessibilityLabel="Guest calls" className="gap-2 rounded-card bg-warning-50 p-3">
      <Text className="text-sm font-semibold text-warning-800">
        {calls.length} {calls.length === 1 ? 'table needs' : 'calls need'} you
      </Text>
      {calls.map((call) => (
        <View key={call._id} className="min-h-13 flex-row items-center gap-3 rounded-control bg-surface py-1.5 ps-3 pe-1.5">
          <Icon name={call.type === 'bill' ? 'receipt-outline' : 'notifications-outline'} className={call.type === 'bill' ? 'accent-danger-700' : 'accent-warning-700'} />
          <Text className="flex-1 text-sm text-body">
            <Text className="font-semibold text-ink">Table {call.tableName}</Text> {call.type === 'bill' ? 'asked for the bill' : 'called a waiter'}
            <Text className="text-muted"> · {minutesSince(call.createdAt)} min ago</Text>
          </Text>
          <Button size="sm" onPress={() => onAnswer(call._id)}>
            Done
          </Button>
        </View>
      ))}
    </View>
  );
}
