import { Link, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import WhatsAppLink from '@/components/whatsapp_link';
import useAuthStore from '@/store/auth_store';
import type Customer from '@/types/customer';
import Button from '@/ui/button';
import fillTemplate from '@/utils/fill_template';
import formatAgo from '@/utils/format_ago';

/** Good customers who have not ordered for 30 days, biggest spenders first, each one tap from a WhatsApp nudge. */
export default function SlippingList({ customers, total }: { customers: Customer[]; total: number }) {
  const settings = useAuthStore((state) => state.me!.workplace!.settings);

  return (
    <View className="gap-1 rounded-card border border-border bg-surface p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text accessibilityRole="header" className="text-heading font-semibold text-ink">
          Customers slipping away
        </Text>
        {total > customers.length && (
          <Link href={{ pathname: '/customers', params: { seg: 'inactive' } }} asChild>
            <Button variant="primaryLink" size="sm">{`See all ${total}`}</Button>
          </Link>
        )}
      </View>
      {!customers.length && <Text className="py-2 text-sm text-muted">Nobody has gone quiet. Customers who do not order for 30 days will show here.</Text>}
      {customers.map((customer, index) => (
        <View key={customer._id} className={`gap-2 py-3 ${index ? 'border-t border-border' : ''}`}>
          <Pressable accessibilityRole="link" onPress={() => router.push(`/customers/${customer._id}`)} className="active:opacity-60">
            <Text numberOfLines={1} className="text-base font-medium text-ink">
              {customer.name}
            </Text>
            <Text className="text-sm text-muted">Last order {formatAgo(customer.lastOrderAt).toLowerCase()}</Text>
          </Pressable>
          <WhatsAppLink phone={customer.phone} message={fillTemplate(settings.whatsappTemplates.winback, { name: customer.name, restaurant: settings.restaurantName })}>
            Send a message
          </WhatsAppLink>
        </View>
      ))}
    </View>
  );
}
