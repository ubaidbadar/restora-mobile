import { Pressable, Text, View } from 'react-native';
import type Customer from '@/types/customer';
import Avatar from '@/ui/avatar';
import Badge from '@/ui/badge';
import formatAgo from '@/utils/format_ago';
import formatPhone from '@/utils/format_phone';
import formatRs from '@/utils/format_rs';
import initialsOf from '@/utils/initials_of';
import nameCase from '@/utils/name_case';

interface CustomerResultRowProps {
  customer: Customer;
  /** What was typed, lower-cased: the matching part of the name is shown bold. */
  query: string;
  onPress: () => void;
}

/** One customer in the matches: what helps tell them apart, and whether they owe anything. */
export default function CustomerResultRow({ customer, query, onPress }: CustomerResultRowProps) {
  const name = nameCase(customer.name);
  const at = query ? name.toLowerCase().indexOf(query) : -1;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Pick ${customer.name}`} onPress={onPress} className="min-h-14 flex-row items-center gap-3 border-b border-border px-4 py-2 active:bg-hover">
      <Avatar initials={initialsOf(customer.name)} size="sm" />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base text-body">
          {at < 0 ? (
            name
          ) : (
            <>
              {name.slice(0, at)}
              <Text className="font-semibold text-ink">{name.slice(at, at + query.length)}</Text>
              {name.slice(at + query.length)}
            </>
          )}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted">
          {formatPhone(customer.phone)}
          {customer.area ? ` · ${customer.area}` : ''}
        </Text>
      </View>
      <View className="items-end gap-0.5">
        {customer.khataBalance > 0 ? <Badge variant="warning">{`Owes ${formatRs(customer.khataBalance)}`}</Badge> : <Text className="text-xs text-muted">{customer.orderCount ? `${customer.orderCount} orders` : 'New'}</Text>}
        {customer.lastOrderAt && <Text className="text-xs text-muted">{formatAgo(customer.lastOrderAt)}</Text>}
      </View>
    </Pressable>
  );
}
