import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Text, View } from 'react-native';
import Can from '@/components/can';
import type Customer from '@/types/customer';
import Avatar from '@/ui/avatar';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import IconButton from '@/ui/icon_button';
import callLink from '@/utils/call_link';
import formatPhone from '@/utils/format_phone';
import initialsOf from '@/utils/initials_of';
import waLink from '@/utils/wa_link';
import nameCase from '@/utils/name_case';

/** Who the customer is, and the actions for serving them: a new order, call, WhatsApp. */
export default function ProfileHeader({ customer }: { customer: Customer }) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-4">
        <Avatar initials={initialsOf(customer.name)} size="lg" />
        <View className="flex-1 gap-1">
          <Text className="text-2xl font-bold text-ink">{nameCase(customer.name)}</Text>
          <Text className="text-base text-muted">
            {formatPhone(customer.phone)}
            {customer.area ? ` · ${customer.area}` : ''}
          </Text>
          {(customer.whatsappOptIn || customer.tags.length > 0) && (
            <View className="flex-row flex-wrap gap-1">
              {customer.whatsappOptIn && <Badge variant="success">Gets WhatsApp offers</Badge>}
              {customer.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </View>
          )}
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Can permission="orders:create">
          <Button icon="add" className="flex-1" onPress={() => router.push({ pathname: '/order/new', params: { customer: customer._id } })}>
            New order
          </Button>
        </Can>
        <IconButton icon="call-outline" variant="outline" label={`Call ${customer.name}`} onPress={() => void Linking.openURL(callLink(customer.phone))} />
        <IconButton icon="logo-whatsapp" variant="outline" label={`WhatsApp ${customer.name}`} onPress={() => void Linking.openURL(waLink(customer.phone))} />
      </View>
    </View>
  );
}
