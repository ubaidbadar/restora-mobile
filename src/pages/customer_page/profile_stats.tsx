import { Text, View } from 'react-native';
import type Customer from '@/types/customer';
import formatAgo from '@/utils/format_ago';
import formatRs from '@/utils/format_rs';

/** Visits, total spent, average order and last visit, two by two. */
export default function ProfileStats({ customer }: { customer: Customer }) {
  const average = customer.orderCount ? customer.totalSpent / customer.orderCount : 0;
  const stats = [
    ['Visits', String(customer.orderCount)],
    ['Total spent', formatRs(customer.totalSpent)],
    ['Average order', formatRs(average)],
    ['Last visit', formatAgo(customer.lastOrderAt)],
  ];

  return (
    <View accessibilityLabel="Customer numbers" className="flex-row flex-wrap overflow-hidden rounded-card border border-border bg-surface">
      {stats.map(([label, value], index) => (
        <View key={label} className={`w-1/2 gap-0.5 p-4 ${index % 2 ? 'border-s border-border' : ''} ${index > 1 ? 'border-t border-border' : ''}`}>
          <Text className="text-sm text-muted">{label}</Text>
          <Text numberOfLines={1} className="text-metric font-semibold text-ink">
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}
