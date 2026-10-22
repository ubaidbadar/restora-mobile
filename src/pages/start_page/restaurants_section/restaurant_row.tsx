import type Me from '@shared/me';
import { Text, View } from 'react-native';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import Avatar from '@/ui/avatar';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import formatDate from '@/utils/format_date';
import getAxiosMessage from '@/utils/get_axios_message';
import initialsOf from '@/utils/initials_of';
import toast from '@/utils/toast';

interface RestaurantRowProps {
  restaurant: Me['restaurants'][number];
}

/** One of your restaurants: open it, see why you can't, or (owner) keep it from being deleted. */
export default function RestaurantRow({ restaurant }: RestaurantRowProps) {
  const open = () =>
    api
      .post('/me/workplace', { restaurantId: restaurant._id })
      .then((res) => useAuthStore.getState().setMe(res.data))
      .catch((err) => toast.error(getAxiosMessage(err)));

  const keep = () =>
    api
      .post(`/restaurants/${restaurant._id}/keep`)
      .then(() => {
        // It can be opened again.
        useAuthStore.setState(({ me }) => ({
          me: me && { ...me, restaurants: me.restaurants.map((r) => (r._id === restaurant._id ? { ...r, status: undefined, deleteAfter: undefined } : r)) },
        }));
        toast.success(`${restaurant.name} will not be deleted`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <View className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-3.5">
      <Avatar initials={initialsOf(restaurant.name)} image={restaurant.logo} />
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-base font-semibold text-ink">
          {restaurant.name}
        </Text>
        {restaurant.isOwner && <Text className="text-sm text-muted">Owner</Text>}
        {restaurant.status === 'deleting' && restaurant.deleteAfter && <Text className="text-sm text-danger-700">Will be deleted on {formatDate(restaurant.deleteAfter)}</Text>}
      </View>
      {restaurant.status === 'suspended' ? (
        <Badge variant="warning">Suspended</Badge>
      ) : restaurant.status === 'deleting' ? (
        <Button variant="outline" onPress={keep}>
          Keep it
        </Button>
      ) : (
        <Button onPress={open}>Open</Button>
      )}
    </View>
  );
}
