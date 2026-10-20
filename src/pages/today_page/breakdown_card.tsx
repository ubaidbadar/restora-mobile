import { Text, View } from 'react-native';

interface BreakdownCardProps {
  title: string;
  rows: { key: string; label: string; count: string; amount: string }[];
}

/** A titled card of rows: name, how many orders, how much. */
export default function BreakdownCard({ title, rows }: BreakdownCardProps) {
  return (
    <View className="gap-2 rounded-card border border-border bg-surface p-4">
      <Text accessibilityRole="header" className="text-heading font-semibold text-ink">
        {title}
      </Text>
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
