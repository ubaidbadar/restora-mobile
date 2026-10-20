import * as Linking from 'expo-linking';
import Button from '@/ui/button';
import toast from '@/utils/toast';
import waLink from '@/utils/wa_link';

interface WhatsAppLinkProps {
  phone: string;
  /** Typed in the chat, ready to send. */
  message?: string;
  children: string;
  onOpen?: () => void;
}

/** Opens WhatsApp with the message already typed. */
export default function WhatsAppLink({ phone, message, children, onOpen }: WhatsAppLinkProps) {
  return (
    <Button
      variant="whatsapp"
      size="lg"
      icon="logo-whatsapp"
      onPress={() => {
        onOpen?.();
        Linking.openURL(waLink(phone, message)).catch(() => toast.error('WhatsApp is not installed on this phone'));
      }}
    >
      {children}
    </Button>
  );
}
