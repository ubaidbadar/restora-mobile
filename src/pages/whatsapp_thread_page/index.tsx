import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import EmptyState from '@/components/empty_state';
import SkeletonList from '@/components/skeleton_list';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import type WhatsAppConversation from '@/types/whatsapp_conversation';
import ConversationThread from '@/pages/whatsapp_page/conversation_thread';

function ThreadScreen() {
  const { phone = '', phoneNumberId = '' } = useLocalSearchParams<{ phone?: string; phoneNumberId?: string }>();
  const { data: conversations, loading } = useGet<WhatsAppConversation[]>('/whatsapp/conversations');
  const thread = conversations?.find((item) => item.phone === phone && item.phoneNumberId === phoneNumberId);

  return (
    <View className="flex-1 bg-canvas">
      <Stack.Screen options={{ title: thread?.customerName || phone || 'WhatsApp' }} />
      {thread ? <ConversationThread thread={thread} /> : loading ? <SkeletonList rows={5} /> : (
        <EmptyState icon="chatbubbles-outline" title="Conversation not found" text="This chat is not available in the selected restaurant branch." />
      )}
    </View>
  );
}

/** Phone-sized WhatsApp thread pushed above the inbox. */
export default function WhatsAppThreadPage() {
  return <RequirePermission permission="orders:view"><ThreadScreen /></RequirePermission>;
}
