import { Pressable, Text, View } from 'react-native';
import type Customer from '@/types/customer';
import Avatar from '@/ui/avatar';
import Badge from '@/ui/badge';
import IconButton from '@/ui/icon_button';
import formatAgo from '@/utils/format_ago';
import formatPhone from '@/utils/format_phone';
import formatRs from '@/utils/format_rs';
import initialsOf from '@/utils/initials_of';
import nameCase from '@/utils/name_case';

interface CustomerMatchCardProps {
  customer: Customer;
  /** Tapping the card picks someone else. */
  onChange: () => void;
  onClear: () => void;
}

/** The picked customer in place of the search box: who, their number, how regular they are, and khata they owe. */
export default function CustomerMatchCard({ customer, onChange, onClear }: CustomerMatchCardProps) {
  const visits = customer.orderCount > 0 ? ` · ${customer.orderCount} ${customer.orderCount === 1 ? 'order' : 'orders'} · last ${formatAgo(customer.lastOrderAt!).toLowerCase()}` : '';

  return (
    <Pressable accessibilityRole="button" accessibilityHint="Pick another customer" onPress={onChange} className="min-h-16 flex-row items-center gap-3 rounded-card border border-primary bg-primary-soft py-2 ps-3 pe-1 active:opacity-80">
      <Avatar initials={initialsOf(customer.name)} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-semibold text-ink">
          {nameCase(customer.name)}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted">
          {formatPhone(customer.phone)}
          {visits}
        </Text>
        {customer.khataBalance > 0 && <Badge variant="warning">{`Owes ${formatRs(customer.khataBalance)}`}</Badge>}
      </View>
      <IconButton icon="close" label={`Remove ${customer.name}`} onPress={onClear} />
    </Pressable>
  );
}
