import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type Customer from '@/types/customer';
import Avatar from '@/ui/avatar';
import Badge from '@/ui/badge';
import Icon from '@/ui/icon';
import MenuSheet from '@/ui/menu_sheet';
import SwipeRow from '@/ui/swipe_row';
import callLink from '@/utils/call_link';
import formatAgo from '@/utils/format_ago';
import formatPhone from '@/utils/format_phone';
import formatRs from '@/utils/format_rs';
import initialsOf from '@/utils/initials_of';
import waLink from '@/utils/wa_link';
import nameCase from '@/utils/name_case';

/** One customer. Tap: their profile. Swipe toward the end: call. Swipe toward the start: WhatsApp. Long-press: all. */
export default function CustomerRow({ customer }: { customer: Customer }) {
  const call = () => void Linking.openURL(callLink(customer.phone));
  const whatsapp = () => void Linking.openURL(waLink(customer.phone));
  const open = () => router.push(`/customers/${customer._id}`);

  return (
    <MenuSheet
      title={nameCase(customer.name)}
      items={[
        { label: 'Open profile', icon: 'person-outline', symbol: 'person', onPress: open },
        { label: 'New order', icon: 'add-circle-outline', symbol: 'plus.circle', onPress: () => router.push({ pathname: '/order/new', params: { customer: customer._id } }) },
        { label: `Call ${formatPhone(customer.phone)}`, icon: 'call-outline', symbol: 'phone', onPress: call },
        { label: 'WhatsApp', icon: 'logo-whatsapp', symbol: 'message', onPress: whatsapp },
      ]}
      component={({ open: openMenu }) => (
        <SwipeRow start={{ label: 'Call', icon: 'call', className: 'bg-success-600', onPress: call }} end={{ label: 'WhatsApp', icon: 'logo-whatsapp', className: 'bg-whatsapp', onPress: whatsapp }}>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Opens the profile. Long press for more."
            onPress={open}
            onLongPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              openMenu();
            }}
            className="min-h-18 flex-row items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 active:bg-sunken"
          >
            <Avatar initials={initialsOf(customer.name)} />
            <View className="flex-1">
              <Text numberOfLines={1} className="text-base font-semibold text-ink">
                {nameCase(customer.name)}
              </Text>
              <Text numberOfLines={1} className="text-sm text-muted">
                {formatPhone(customer.phone)}
                {customer.area ? ` · ${customer.area}` : ''}
              </Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-xs text-muted">{customer.lastOrderAt ? formatAgo(customer.lastOrderAt) : "No orders yet"}</Text>
              {customer.khataBalance > 0 && <Badge variant="warning">{`Owes ${formatRs(customer.khataBalance)}`}</Badge>}
            </View>
            <Icon name="chevron-forward" size={18} />
          </Pressable>
        </SwipeRow>
      )}
    />
  );
}
