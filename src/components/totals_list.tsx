import { Text, View } from 'react-native';
import type Totals from '@/types/totals';
import formatRs from '@/utils/format_rs';

interface TotalsListProps {
  totals: Totals;
  /** Null while it isn't known how the customer pays: tax is added then. */
  taxRate: number | null;
  deliveryFee: number;
}

/** Subtotal, discount, tax and delivery, label on the start side and amount on the end. */
export default function TotalsList({ totals, taxRate, deliveryFee }: TotalsListProps) {
  const rows = [
    ['Subtotal', formatRs(totals.subtotal)],
    ...(totals.discount ? [['Discount', `− ${formatRs(totals.discount)}`]] : []),
    ...(totals.serviceCharge > 0 ? [['Service charge', formatRs(totals.serviceCharge)]] : []),
    taxRate === null ? ['Tax', 'Added when paid'] : [`Tax (${taxRate}%)`, formatRs(totals.tax)],
    ...(deliveryFee ? [['Delivery', formatRs(deliveryFee)]] : []),
  ];

  return (
    <View className="gap-1.5">
      {rows.map(([label, value]) => (
        <View key={label} className="flex-row justify-between gap-3">
          <Text className="text-sm text-muted">{label}</Text>
          <Text className="text-sm text-body">{value}</Text>
        </View>
      ))}
    </View>
  );
}
