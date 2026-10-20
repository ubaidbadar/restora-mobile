import { Text, View } from 'react-native';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import type MyInvitation from '@/types/my_invitation';
import Button from '@/ui/button';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';

/** An invitation to join a restaurant: one tap, and they work there (the answer is the new `/me`). */
export default function InvitationRow({ invitation }: { invitation: MyInvitation }) {
  const join = () =>
    api
      .post(`/my-invitations/${invitation._id}/accept`)
      .then((res) => {
        useAuthStore.getState().setMe(res.data.me);
        toast.success(`Welcome to ${invitation.restaurantName}`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <View className="flex-row items-center gap-3 rounded-card bg-primary-soft p-3.5">
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-semibold text-ink">
          {invitation.restaurantName}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted">
          {invitation.roleNames.join(', ')}
          {invitation.invitedByName ? ` · invited by ${invitation.invitedByName}` : ''}
        </Text>
      </View>
      <Button onPress={join}>Join</Button>
    </View>
  );
}
