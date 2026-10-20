import { Text, View } from 'react-native';
import type Order from '@/types/order';
import Icon from '@/ui/icon';
import formatRs from '@/utils/format_rs';

/** Where a delivery goes, who takes it, and the cash the rider collects at the door. */
export default function DeliveryInfo({ order }: { order: Order }) {
  const cod = order.paymentStatus === 'unpaid' ? order.total : 0;

  return (
    <View className="gap-1 rounded-control bg-sunken px-3 py-2">
      <View className="flex-row items-start gap-1.5">
        <Icon name="location-outline" size={16} />
        <Text className="flex-1 text-sm text-body">{[order.area, order.address].filter(Boolean).join(', ') || 'No address yet'}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Icon name="bicycle-outline" size={16} />
        <Text className="text-sm text-body">{order.rider || 'No rider yet'}</Text>
      </View>
      <Text className="text-sm font-semibold text-ink">{cod > 0 ? `Collect ${formatRs(cod)} cash` : 'Nothing to collect'}</Text>
    </View>
  );
}
