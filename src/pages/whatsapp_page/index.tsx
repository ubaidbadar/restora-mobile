import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, useWindowDimensions, View } from 'react-native';
import EmptyState from '@/components/empty_state';
import LoadFailed from '@/components/load_failed';
import PageHeader from '@/components/page_header';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import RequirePermission from '@/hoc/require_permission';
import type WhatsAppConversation from '@/types/whatsapp_conversation';
import Chips from '@/ui/chips';
import IconButton from '@/ui/icon_button';
import SearchField from '@/ui/search_field';
import WIDE_WIDTH from '@/constants/wide_width';
import formatDate from '@/utils/format_date';
import formatTime from '@/utils/format_time';
import ConversationThread from './conversation_thread';

const FILTERS = [{ value: 'all', label: 'All chats' }, { value: 'unread', label: 'Unread' }];

function ConversationRow({ thread, selected, onPress }: { thread: WhatsAppConversation; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${thread.customerName || thread.phone}${thread.unread ? ', unread' : ''}`}
      onPress={onPress}
      className={`min-h-20 flex-row items-start gap-3 border-b border-border p-3 active:bg-hover ${selected ? 'bg-primary-soft' : 'bg-surface'}`}
    >
      <View className="size-11 items-center justify-center rounded-pill bg-primary-soft">
        <Text className="font-bold text-accent-text">{(thread.customerName || thread.phone).charAt(0).toUpperCase()}</Text>
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text numberOfLines={1} className={`flex-1 text-base ${thread.unread ? 'font-bold text-ink' : 'font-medium text-ink'}`}>{thread.customerName || thread.phone}</Text>
          <Text className="text-xs text-muted">{thread.last?.receivedAt ? formatDate(thread.last.receivedAt) === formatDate(new Date().toISOString()) ? formatTime(thread.last.receivedAt) : formatDate(thread.last.receivedAt) : ''}</Text>
        </View>
        {!!thread.customerName && <Text className="text-xs text-muted">{thread.phone}</Text>}
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="flex-1 text-sm text-muted">
            {thread.last?.direction === 'outbound' ? 'You: ' : ''}{thread.last?.text || 'WhatsApp message'}
          </Text>
          {!!thread.unread && <View accessibilityLabel="Unread" className="size-2 rounded-pill bg-primary" />}
        </View>
      </View>
    </Pressable>
  );
}

function InboxScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_WIDTH;
  const { q = '', filter = 'all', chat } = useLocalSearchParams<{ q?: string; filter?: string; chat?: string }>();
  const { data: conversations, loading, refreshing, error, get } = useGet<WhatsAppConversation[]>('/whatsapp/conversations');
  const threads = conversations ?? [];
  const unreadCount = threads.filter((thread) => thread.unread).length;
  const search = q.trim().toLowerCase();
  const visible = threads.filter((thread) => (filter !== 'unread' || thread.unread)
    && (thread.phone.includes(search) || (thread.customerName || '').toLowerCase().includes(search)));
  const active = threads.find((thread) => `${thread.phoneNumberId}:${thread.phone}` === chat);

  const header = (
    <View className="gap-3 p-4">
      <PageHeader title="WhatsApp inbox" subtitle={`${threads.length} conversations · ${unreadCount} unread`}>
        <IconButton icon="settings-outline" label="WhatsApp connections" onPress={() => router.push('/more/whatsapp-settings')} />
      </PageHeader>
      <SearchField accessibilityLabel="Search WhatsApp conversations" placeholder="Name or phone" autoCapitalize="none" value={q} onChangeText={(value) => router.setParams({ q: value || undefined })} />
      <Chips className="-mx-4" options={FILTERS} value={filter} onChange={(value) => router.setParams({ filter: value === 'all' ? undefined : value })} />
    </View>
  );

  return (
    <View className={`flex-1 bg-canvas ${wide ? 'flex-row' : ''}`}>
      <View className={wide ? 'w-80 border-e border-border' : 'flex-1'}>
        {error && !conversations ? <LoadFailed what="WhatsApp conversations" onRetry={() => get()} /> : (
          <FlatList
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            data={visible}
            keyExtractor={(thread) => `${thread.phoneNumberId}:${thread.phone}`}
            renderItem={({ item }) => (
              <ConversationRow
                thread={item}
                selected={active?.phoneNumberId === item.phoneNumberId && active?.phone === item.phone}
                onPress={() => {
                  if (wide) router.setParams({ chat: `${item.phoneNumberId}:${item.phone}` });
                  else router.push({ pathname: '/more/whatsapp-thread', params: { phone: item.phone, phoneNumberId: item.phoneNumberId } });
                }}
              />
            )}
            refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}
            ListHeaderComponent={header}
            ListEmptyComponent={loading ? <SkeletonList rows={5} /> : (
              <EmptyState icon="chatbubbles-outline" title={search ? 'No matching conversations' : filter === 'unread' ? 'All conversations are read' : 'No WhatsApp messages yet'} text="Connect your restaurant's number under WhatsApp settings to receive messages." />
            )}
          />
        )}
      </View>
      {wide && (
        <View className="flex-1">
          {active ? <ConversationThread key={`${active.phoneNumberId}:${active.phone}`} thread={active} /> : (
            <View className="flex-1 items-center justify-center gap-2 p-6">
              <Text className="text-heading font-semibold text-ink">Your conversations, in one place</Text>
              <Text className="text-center text-sm text-muted">Choose a customer to read messages and reply during the open service window.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/** Branch-scoped inbox: phone navigation to a thread; tablet two-pane conversations. */
export default function WhatsAppPage() {
  return <RequirePermission permission="orders:view"><InboxScreen /></RequirePermission>;
}
