import type WhatsAppMessage from './whatsapp_message';

/** A branch-scoped WhatsApp customer thread, distinguished by the restaurant's receiving number. */
export default interface WhatsAppConversation {
  phoneNumberId: string;
  phone: string;
  customerName: string | null;
  count: number;
  last: WhatsAppMessage;
  lastInboundAt?: string | null;
  unread?: boolean;
  replyWindowOpen?: boolean;
}
