import { Text, View } from 'react-native';

interface BreakdownCardProps {
  title: string;
  rows: { key: string; label: string; count: string; amount: string }[];
  /** A line under the title. */
  summary?: string;
  /** Shown instead of the rows when there are none. */
  empty?: string;
}

/** A titled card of rows: name, how many orders, how much. */
export default function BreakdownCard({ title, rows, summary, empty }: BreakdownCardProps) {
  return (
    <View className="gap-2 rounded-card border border-border bg-surface p-4">
      <Text accessibilityRole="header" className="text-heading font-semibold text-ink">
        {title}
      </Text>
      {summary && <Text className="text-sm text-body">{summary}</Text>}
      {rows.length === 0 && empty && <Text className="text-sm text-muted">{empty}</Text>}
      {rows.map((row, index) => (
        <View key={row.key} className={`flex-row items-center gap-3 py-2.5 ${index ? 'border-t border-border' : ''}`}>
          <Text numberOfLines={1} className="flex-1 text-sm font-medium text-ink">
            {row.label}
          </Text>
          <Text className="text-sm text-muted">{row.count}</Text>
          <View className="w-28 items-end">
            <Text className="text-sm font-semibold text-ink">{row.amount}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
