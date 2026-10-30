import { Text, View } from 'react-native';

interface Stat {
  label: string;
  value: string;
  hint?: string;
}

/** Headline numbers two by two, in one card. */
export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <View accessibilityLabel="Numbers" className="flex-row flex-wrap overflow-hidden rounded-card border border-border bg-surface">
      {stats.map((stat, index) => (
        <View key={stat.label} className={`w-1/2 gap-0.5 p-4 ${index % 2 ? 'border-s border-border' : ''} ${index > 1 ? 'border-t border-border' : ''}`}>
          <Text className="text-sm text-muted">{stat.label}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit className="text-metric font-semibold text-ink">
            {stat.value}
          </Text>
          {stat.hint && <Text className="text-xs text-muted">{stat.hint}</Text>}
        </View>
      ))}
    </View>
  );
}
