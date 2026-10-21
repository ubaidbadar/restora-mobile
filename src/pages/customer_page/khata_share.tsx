import { View } from 'react-native';
import WhatsAppLink from '@/components/whatsapp_link';
import useAuthStore from '@/store/auth_store';
import type Customer from '@/types/customer';
import type KhataEntry from '@/types/khata_entry';
import Button from '@/ui/button';
import formatDate from '@/utils/format_date';
import formatRs from '@/utils/format_rs';
import khataLabel from '@/utils/khata_label';
import printKhata from '@/utils/print_khata';

interface KhataShareProps {
  customer: Customer;
  entries: KhataEntry[];
}

/** The last ten khata lines and the balance, ready to send on WhatsApp; or the whole statement as a PDF to share. */
export default function KhataShare({ customer, entries }: KhataShareProps) {
  const restaurantName = useAuthStore((state) => state.me?.workplace?.restaurant.name ?? '');
  const lines = entries
    .slice(0, 10)
    .reverse()
    .map((entry) => `${formatDate(entry.createdAt)}  ${khataLabel(entry)}  ${entry.amount > 0 ? '+' : '-'}${formatRs(Math.abs(entry.amount))}`);
  const message = [`${restaurantName}: khata of ${customer.name}`, '', ...lines, '', `Balance: ${formatRs(customer.khataBalance)}`].join('\n');

  return (
    <View className="gap-2">
      <WhatsAppLink phone={customer.phone} message={message}>
        Send statement on WhatsApp
      </WhatsAppLink>
      <Button variant="outline" icon="document-outline" onPress={() => void printKhata(customer, entries)}>
        Share as PDF
      </Button>
    </View>
  );
}
