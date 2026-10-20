import { Text, View } from 'react-native';
import formatRs from '@/utils/format_rs';

interface PaymentSplitProps {
  cash: number;
  digital: number;
  notCollected: number;
}

/** How the money came in: a bar for the cash share, then the three amounts. */
export default function PaymentSplit({ cash, digital, notCollected }: PaymentSplitProps) {
  const received = cash + digital;
  const cashShare = received ? Math.round((cash / received) * 100) : 0;
  const rows = [
    [`Cash (${cashShare}%)`, formatRs(cash)],
    [`Card, JazzCash, Easypaisa, bank (${received ? 100 - cashShare : 0}%)`, formatRs(digital)],
    ['Not collected yet (unpaid or khata)', formatRs(notCollected)],
  ];

  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4">
      <Text accessibilityRole="header" className="text-heading font-semibold text-ink">
        Cash vs digital
      </Text>
      <View accessibilityLabel={`Cash is ${cashShare}% of money received`} className="h-2.5 overflow-hidden rounded-pill bg-sunken">
        <View style={{ width: `${cashShare}%` }} className="h-full rounded-pill bg-primary" />
      </View>
      {rows.map(([label, value]) => (
        <View key={label} className="flex-row justify-between gap-4">
          <Text className="flex-1 text-sm text-body">{label}</Text>
          <Text className="text-sm font-semibold text-ink">{value}</Text>
        </View>
      ))}
    </View>
  );
}
