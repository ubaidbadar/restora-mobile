import { Text, View } from 'react-native';
import useGet from '@/hooks/useGet';
import type MyInvitation from '@/types/my_invitation';
import InvitationRow from './invitation_row';

/** Invitations sent to your email. Nothing when there are none. */
export default function InvitationsList() {
  const { data: invitations = [] } = useGet<MyInvitation[]>('/my-invitations');
  if (!invitations.length) return null;

  return (
    <View className="gap-2">
      <Text accessibilityRole="header" className="text-sm font-semibold text-ink">
        Invitations
      </Text>
      {invitations.map((invitation) => (
        <InvitationRow key={invitation._id} invitation={invitation} />
      ))}
    </View>
  );
}
