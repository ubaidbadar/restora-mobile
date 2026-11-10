import { useEffect } from 'react';
import { AppState, FlatList, RefreshControl, Text, View } from 'react-native';
import api from '@/config/api';
import useGet from '@/hooks/useGet';
import getCache from '@/store/get_cache';
import type WhatsAppConversation from '@/types/whatsapp_conversation';
import type WhatsAppMessage from '@/types/whatsapp_message';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import formatDate from '@/utils/format_date';
import formatTime from '@/utils/format_time';
import ReplyForm from './reply_form';

function MessageRow({ message, day }: { message: WhatsAppMessage; day?: string }) {
  const outbound = message.direction === 'outbound';
  return (
    <View className="gap-2">
      {day && <Text className="text-center text-xs text-muted">{day}</Text>}
      <View className={`max-w-[88%] gap-1.5 rounded-card border p-3 ${outbound ? 'self-end border-primary bg-primary-soft' : 'self-start border-border bg-surface'}`}>
        <Text className="text-base text-ink">
          {message.text || (message.messageType === 'image' ? 'Photo message' : message.messageType === 'document' ? 'Document message' : 'WhatsApp message')}
        </Text>
        <View className="flex-row items-center justify-end gap-2">
          <Text className="text-xs text-muted">{formatTime(message.receivedAt)}</Text>
          {outbound && <Badge variant={message.deliveryStatus === 'failed' ? 'danger' : 'neutral'}>{message.deliveryStatus || 'sent'}</Badge>}
        </View>
      </View>
    </View>
  );
}

/** One customer thread. Only the open conversation is polled; read and sent updates enter the shared cache. */
export default function ConversationThread({ thread }: { thread: WhatsAppConversation }) {
  const { data, loading, refreshing, error, get, update } = useGet<{ messages: WhatsAppMessage[] }>(
    `/whatsapp/conversations/${encodeURIComponent(thread.phone)}`,
    { params: { phoneNumberId: thread.phoneNumberId } },
  );
  const messages = data?.messages ?? [];
  const latestInbound = [...messages].reverse().find((message) => message.direction === 'inbound')?.metaMessageId;

  useEffect(() => {
    const poll = setInterval(() => {
      if (AppState.currentState === 'active') void get();
    }, 12_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void get();
    });
    return () => {
      clearInterval(poll);
      subscription.remove();
    };
  }, [get]);

  useEffect(() => {
    if (!latestInbound) return;
    api.post(`/whatsapp/conversations/${encodeURIComponent(thread.phone)}/read`, {
      phoneNumberId: thread.phoneNumberId, messageId: latestInbound,
    }).then(() => {
      getCache.update<WhatsAppConversation[]>(getCache.keyOf('/whatsapp/conversations'), (rows) =>
        rows?.map((row) => row.phoneNumberId === thread.phoneNumberId && row.phone === thread.phone ? { ...row, unread: false } : row));
    }).catch(() => {});
  }, [thread.phone, thread.phoneNumberId, latestInbound]);

  return (
    <View className="flex-1 bg-canvas">
      <View className="gap-1 border-b border-border bg-surface px-4 py-3">
        <Text numberOfLines={1} className="text-heading font-semibold text-ink">{thread.customerName || thread.phone}</Text>
        <Text className="text-xs text-muted">{thread.phone} · {thread.count} messages</Text>
      </View>
      {error && !data ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-sm text-danger-700">Could not load this conversation.</Text>
          <Button variant="outline" onPress={() => get()}>Try again</Button>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-3 p-4"
          data={messages}
          keyExtractor={(message) => message._id || message.metaMessageId}
          renderItem={({ item, index }) => {
            const prior = messages[index - 1];
            const date = formatDate(item.receivedAt);
            return <MessageRow message={item} day={!prior || formatDate(prior.receivedAt) !== date ? date : undefined} />;
          }}
          refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}
          ListEmptyComponent={<Text className="py-6 text-center text-sm text-muted">{loading ? 'Loading messages…' : 'No messages in this conversation yet.'}</Text>}
        />
      )}
      <ReplyForm
        thread={thread}
        onSent={(message) => {
          update((previous) => ({ messages: [...(previous?.messages ?? []), message] }));
          getCache.update<WhatsAppConversation[]>(getCache.keyOf('/whatsapp/conversations'), (rows) =>
            rows?.map((row) => row.phoneNumberId === thread.phoneNumberId && row.phone === thread.phone
              ? { ...row, last: message, count: row.count + 1 } : row));
        }}
      />
    </View>
  );
}
