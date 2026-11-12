/** An inbound customer message or an outbound Restora reply saved by the WhatsApp webhook/inbox. */
export default interface WhatsAppMessage {
  _id: string;
  metaMessageId: string;
  phoneNumberId: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  text?: string;
  messageType: string;
  receivedAt: string;
  deliveryStatus?: string;
}
