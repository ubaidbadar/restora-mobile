import { Text, View } from 'react-native';
import Can from '@/components/can';
import api from '@/config/api';
import type Customer from '@/types/customer';
import type KhataEntry from '@/types/khata_entry';
import IconButton from '@/ui/icon_button';
import confirm from '@/utils/confirm';
import formatDate from '@/utils/format_date';
import formatRs from '@/utils/format_rs';
import formatTime from '@/utils/format_time';
import getAxiosMessage from '@/utils/get_axios_message';
import khataLabel from '@/utils/khata_label';
import toast from '@/utils/toast';

interface KhataRowProps {
  entry: KhataEntry;
  customer: Customer;
  first: boolean;
  /** The payment taken back, and the customer with the balance it changed. */
  onReversed: (entry: KhataEntry, customer: Customer) => void;
}

/** One khata line: what, when and who; + owed, − paid; the balance after it. A payment can be taken back. */
export default function KhataRow({ entry, customer, first, onReversed }: KhataRowProps) {
  const reverse = async () => {
    const ok = await confirm({
      title: 'Take back this payment?',
      message: `${formatRs(Math.abs(entry.amount))} goes back on the khata. Use this when a payment was entered by mistake.`,
      confirmLabel: 'Take it back',
      destructive: true,
    });
    if (!ok) return;
    api
      .post<KhataEntry & { customer: Customer }>(`/customers/${customer._id}/khata/${entry._id}/reverse`)
      .then((res) => {
        const { customer: saved, ...reversed } = res.data;
        onReversed(reversed, saved);
        toast.success('Payment taken back');
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <View className={`min-h-16 flex-row items-center gap-3 py-3 ${first ? '' : 'border-t border-border'}`}>
      <View className="flex-1">
        <Text className={`text-sm font-medium ${entry.reversedAt ? 'text-muted line-through' : 'text-ink'}`}>{khataLabel(entry)}</Text>
        <Text className="text-sm text-muted">
          {formatDate(entry.createdAt)}, {formatTime(entry.createdAt)}
          {entry.by?.name ? ` · ${entry.by.name}` : ''}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`text-sm font-semibold ${entry.amount > 0 ? 'text-warning-800' : 'text-success-700'}`}>
          {entry.amount > 0 ? '+' : '−'}
          {formatRs(Math.abs(entry.amount))}
        </Text>
        <Text className="text-xs text-muted">Balance {formatRs(entry.balanceAfter)}</Text>
      </View>
      {entry.type === 'payment' && !entry.reversedAt && (
        <Can permission="customers:khata">
          <IconButton icon="arrow-undo-outline" size="sm" label="Take back this payment" onPress={() => void reverse()} />
        </Can>
      )}
    </View>
  );
}
