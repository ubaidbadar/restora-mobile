import { Pressable, Text, View } from 'react-native';
import can from '@shared/can';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import type Invitation from '@/types/invitation';
import Badge from '@/ui/badge';
import Icon from '@/ui/icon';
import MenuSheet from '@/ui/menu_sheet';
import confirm from '@/utils/confirm';
import formatDate from '@/utils/format_date';
import formatPhone from '@/utils/format_phone';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import inviteToast from './invite_toast';

interface InvitationRowProps {
  invitation: Invitation;
  onChanged: (saved: Invitation) => void;
}

/** One invitation: who, how, until when. Tap: send a new link (the old one stops) or cancel it. */
export default function InvitationRow({ invitation, onChanged }: InvitationRowProps) {
  const canInvite = can(useAuthStore((state) => state.me?.workplace), 'staff:invite');
  const who = invitation.name || invitation.email || (invitation.phone ? formatPhone(invitation.phone) : 'Someone');
  const pending = invitation.status === 'pending';

  const resend = () =>
    api
      .post(`/invitations/${invitation._id}/resend`)
      .then((res) => {
        onChanged(res.data);
        inviteToast(who, res.data);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  const cancel = async () => {
    if (!(await confirm({ title: `Cancel ${who}'s invitation?`, message: 'The link stops working. You can invite them again later.', confirmLabel: 'Cancel invitation', destructive: true }))) return;
    await api
      .post(`/invitations/${invitation._id}/revoke`)
      .then((res) => {
        onChanged(res.data);
        toast.success('Invitation cancelled');
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  const body = (onPress?: () => void) => (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} className="min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-sunken">
      <View className="flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text numberOfLines={1} className="shrink text-base font-semibold text-ink">
            {who}
          </Text>
          {pending && invitation.expired && <Badge variant="warning">Expired</Badge>}
          {invitation.status === 'revoked' && <Badge>Cancelled</Badge>}
        </View>
        <Text numberOfLines={1} className="text-sm text-muted">
          {invitation.channel === 'email' ? invitation.email : `WhatsApp ${invitation.phone ? formatPhone(invitation.phone) : ''}`}
          {pending && !invitation.expired && ` · until ${formatDate(invitation.expiresAt)}`}
          {invitation.invitedByName && ` · by ${invitation.invitedByName}`}
        </Text>
      </View>
      {onPress && <Icon name="ellipsis-horizontal" size={20} />}
    </Pressable>
  );

  if (!pending || !canInvite) return body();
  return (
    <MenuSheet
      title={who}
      items={[
        { label: 'Send a new link', icon: 'refresh-outline', symbol: 'arrow.clockwise', onPress: () => void resend() },
        { label: 'Cancel invitation', icon: 'close-circle-outline', symbol: 'xmark.circle', destructive: true, onPress: () => void cancel() },
      ]}
      component={({ open }) => body(open)}
    />
  );
}
