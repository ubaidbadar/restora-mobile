import { Text, View } from 'react-native';
import can from '@shared/can';
import { z } from 'zod';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import type WhatsAppConversation from '@/types/whatsapp_conversation';
import type WhatsAppMessage from '@/types/whatsapp_message';
import Button from '@/ui/button';
import Form from '@/ui/form';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';

const replySchema = z.object({ text: z.string().trim().min(1, 'Write a message').max(4096) });

/** Only messages within the open 24-hour service window can be sent without a Meta template. */
export default function ReplyForm({ thread, onSent }: { thread: WhatsAppConversation; onSent: (message: WhatsAppMessage) => void }) {
  const mayReply = useAuthStore((state) => can(state.me?.workplace, 'orders:update'));
  const windowOpen = thread.replyWindowOpen !== false;
  const enabled = mayReply && windowOpen;

  return (
    <Form
      key={thread.phoneNumberId + thread.phone}
      schema={replySchema}
      defaultValues={{ text: '' }}
      className="gap-3 border-t border-border bg-surface p-4"
      onSubmit={({ data, onReset, onSuccess, onError }) =>
        api.post<{ message?: WhatsAppMessage; logged?: boolean }>(
          `/whatsapp/conversations/${encodeURIComponent(thread.phone)}/reply`,
          { phoneNumberId: thread.phoneNumberId, text: data.text },
        ).then(({ data: response, status }) => {
          if (status === 201 && response.message) onSent(response.message);
          onReset();
          onSuccess(status === 202 || response.logged === false
            ? 'WhatsApp accepted the reply but Restora could not save it. Do not resend blindly.'
            : 'Reply sent.');
        }).catch(onError)
      }
      component={({ register, errors, loading, message, error, onSubmit }) => (
        <>
          <Input
            label="Message"
            multiline
            maxLength={4096}
            editable={enabled && !loading}
            placeholder={!mayReply ? 'Your role cannot reply' : !windowOpen ? 'Ask the customer to message again' : 'Write a message…'}
            {...register('text')}
            error={fieldError(errors, 'text') ?? error}
          />
          <Button icon="send-outline" size="lg" disabled={!enabled || loading} onPress={onSubmit}>
            {loading ? 'Sending…' : 'Send reply'}
          </Button>
          {!mayReply && <Text className="text-sm text-muted">Your role needs permission to update orders to send replies.</Text>}
          {!windowOpen && <Text className="text-sm text-warning-800">The 24-hour service window is closed. Ask the customer to message again before replying.</Text>}
          {windowOpen && <Text className="text-xs text-muted">Replies are available for 24 hours after the customer's latest message.</Text>}
          {!!message && <Text className="text-sm text-muted">{message}</Text>}
        </>
      )}
    />
  );
}
