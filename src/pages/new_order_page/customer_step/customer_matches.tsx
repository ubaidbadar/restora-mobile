import { useEffect } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import useGet from '@/hooks/useGet';
import useOutboxStore from '@/store/outbox_store';
import type Customer from '@/types/customer';
import Icon from '@/ui/icon';
import Skeleton from '@/ui/skeleton';
import formatPhone from '@/utils/format_phone';
import normalizePhone from '@/utils/normalize_phone';
import CustomerResultRow from './customer_result_row';
import national from './national';

const MAX_MATCHES = 30;

interface CustomerMatchesProps {
  term: string;
  onPick: (customer: Customer) => void;
  /** "New customer", with what was typed: a name, or a number. */
  onNew: (typed: { name: string; phone: string }) => void;
}

/**
 * Nothing typed: the most recent customers. Typing: the saved list answers at once and offline. It holds the 1,000 most
 * recent customers, so while online the server is also asked (`q`), a moment after typing stops, for anyone older.
 * "New customer" is always first, unless a full number someone already has was typed.
 */
export default function CustomerMatches({ term, onPick, onNew }: CustomerMatchesProps) {
  const query = term.toLowerCase();
  const byName = /\p{L}/u.test(query);
  const digits = national(query);
  const { data: list, loading } = useGet<Customer[]>('/customers');
  const { data: older, loading: searchingServer, get: askFor } = useGet<Customer[]>('/customers', { active: true });
  const online = useOutboxStore((state) => state.online);

  const isMatch = (customer: Customer) => !term || (byName ? customer.name.toLowerCase().includes(query) : national(customer.phone).includes(digits) || national(customer.altPhone ?? '').includes(digits));
  const local = (list ?? []).filter(isMatch);
  const fromServer = term ? (older ?? []).filter((customer) => isMatch(customer) && !local.some((saved) => saved._id === customer._id)) : [];
  const matches = [...local, ...fromServer].slice(0, MAX_MATCHES);
  const askServer = term.length >= 2 && online && local.length < MAX_MATCHES;

  useEffect(() => {
    if (!askServer) return;
    const timer = setTimeout(() => askFor({ params: { q: term } }), 350);
    return () => clearTimeout(timer);
  }, [askServer, term, askFor]);

  const fullNumber = byName ? null : normalizePhone(term);
  const taken = Boolean(fullNumber) && matches.some((match) => match.phone === fullNumber || national(match.altPhone ?? '') === national(fullNumber!));
  const typed = fullNumber ? formatPhone(fullNumber) : term;
  const searching = !matches.length && ((loading && !list) || (askServer && searchingServer));

  return (
    <FlatList
      data={matches}
      keyExtractor={(customer) => customer._id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      className="flex-1"
      contentContainerClassName="pb-10"
      ListHeaderComponent={
        <>
          {!taken && (
            <Pressable accessibilityRole="button" onPress={() => onNew(byName ? { name: term, phone: '' } : { name: '', phone: typed })} className="min-h-14 flex-row items-center gap-3 border-b border-border px-4 active:bg-hover">
              <View className="size-9 items-center justify-center rounded-pill bg-primary-soft">
                <Icon name="person-add-outline" size={18} className="accent-accent-text" />
              </View>
              <Text numberOfLines={1} className="flex-1 text-base font-medium text-accent-text">
                {term ? `New customer “${typed}”` : 'New customer'}
              </Text>
            </Pressable>
          )}
          {!term && matches.length > 0 && <Text className="px-4 pt-4 pb-1 text-sm font-semibold text-muted">Recent</Text>}
        </>
      }
      ListEmptyComponent={
        searching ? (
          <View className="gap-2 p-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </View>
        ) : term ? (
          <Text className="px-4 py-6 text-center text-base text-muted">{`No customer matches “${term}”.`}</Text>
        ) : undefined
      }
      renderItem={({ item }) => <CustomerResultRow customer={item} query={byName ? query : ''} onPress={() => onPick(item)} />}
    />
  );
}
