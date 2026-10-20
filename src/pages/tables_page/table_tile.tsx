import { Pressable, Text, View } from 'react-native';
import type FloorTable from '@/types/floor_table';
import Badge from '@/ui/badge';
import Icon from '@/ui/icon';
import TableSheet from './table_sheet';
import tableStatus from './table_status';

interface TableTileProps {
  table: FloorTable;
  width: number;
  onAnswer: (requestId: string) => void;
}

const BORDERS = { error: 'border-danger-500', warning: 'border-warning-500', primary: 'border-primary', info: 'border-info-200', neutral: 'border-border' };
const BADGES = { error: 'danger', warning: 'warning', primary: 'primary', info: 'info', neutral: 'neutral' } as const;

/**
 * One table: its name, seats and what it needs now, in words and color. Free tables stay quiet; busy ones show the bill
 * so far and how long they have been eating. Tap for its orders, calls and a new order.
 */
export default function TableTile({ table, width, onAnswer }: TableTileProps) {
  const status = tableStatus(table);
  return (
    <TableSheet
      table={table}
      onAnswer={onAnswer}
      component={({ open }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Table ${table.name}, ${status.label}${status.detail ? `, ${status.detail}` : ''}`}
          onPress={open}
          style={{ width }}
          className={`min-h-22 justify-between gap-1.5 rounded-card p-2.5 active:opacity-70 ${status.tone === 'neutral' ? 'border border-border bg-surface' : `border-2 bg-surface ${BORDERS[status.tone]}`}`}
        >
          <View className="flex-row items-baseline justify-between gap-1">
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} className="flex-1 text-lg font-bold text-ink">
              {table.name}
            </Text>
            {table.seats ? (
              <View className="flex-row items-center gap-0.5">
                <Icon name="person-outline" size={11} />
                <Text className="text-xs text-muted">{table.seats}</Text>
              </View>
            ) : null}
          </View>
          {status.tone === 'neutral' ? (
            <Text className="text-xs font-medium text-success-700">Free</Text>
          ) : (
            <View className="items-start gap-1">
              <Badge variant={BADGES[status.tone]}>{status.label}</Badge>
              {status.detail && (
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} className="text-xs font-medium text-body">
                  {status.detail}
                </Text>
              )}
            </View>
          )}
        </Pressable>
      )}
    />
  );
}
