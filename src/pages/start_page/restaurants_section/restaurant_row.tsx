import { Text, View } from 'react-native';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import type Membership from '@/types/membership';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import formatDate from '@/utils/format_date';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';

interface RestaurantRowProps {
  membership: Membership;
  onSaved: (membership: Membership) => void;
}

/** One of your restaurants: open it, see why you can't, or (owner) keep it from being deleted. */
export default function RestaurantRow({ membership, onSaved }: RestaurantRowProps) {
  const { restaurant } = membership;
  const deleting = restaurant.status === 'deleting';

  const open = () =>
    api
      .post('/me/workplace', { restaurantId: restaurant._id })
      .then((res) => useAuthStore.getState().setMe(res.data))
      .catch((err) => toast.error(getAxiosMessage(err)));

  const keep = () =>
    api
      .post(`/restaurants/${restaurant._id}/keep`)
      .then((res) => {
        onSaved({ ...membership, restaurant: { ...restaurant, ...res.data.restaurant, deleteAfter: undefined } });
        toast.success(`${restaurant.name} will not be deleted`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <View className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-3.5">
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-base font-semibold text-ink">
          {restaurant.name}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted">
          {membership.roleNames.join(', ')}
        </Text>
        {deleting && restaurant.deleteAfter && <Text className="text-sm text-danger-700">Will be deleted on {formatDate(restaurant.deleteAfter)}</Text>}
      </View>
      {membership.status === 'suspended' ? (
        <Badge variant="warning">Suspended</Badge>
      ) : deleting ? (
        membership.isPrimaryOwner && (
          <Button variant="outline" onPress={keep}>
            Keep it
          </Button>
        )
      ) : (
        <Button onPress={open}>Open</Button>
      )}
    </View>
  );
}
