import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import toast from '@/utils/toast';
import waLink from '@/utils/wa_link';

/** After inviting or resending: the email is on its way (the link can be copied); a phone invitation is sent from your own WhatsApp. */
export default function inviteToast(who: string, { channel, phone, inviteUrl }: { channel?: string; phone?: string; inviteUrl: string }) {
  if (channel === 'phone' && phone) {
    toast.success(`Invitation ready for ${who}. Send it from your WhatsApp.`, { label: 'Open WhatsApp', onClick: () => void Linking.openURL(waLink(phone, `Join us on Restora: ${inviteUrl}`)) });
    return;
  }
  toast.success(`Invitation emailed to ${who}`, { label: 'Copy link', onClick: () => void Clipboard.setStringAsync(inviteUrl).then(() => toast.info('Link copied')) });
}
