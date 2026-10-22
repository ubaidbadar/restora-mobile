import { Link } from 'expo-router';
import { View } from 'react-native';
import AuthCard from '@/components/auth_card';
import SignedInAs from '@/components/signed_in_as';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import InvitationsList from './invitations_list';
import RestaurantRow from './restaurant_row';

/** Your restaurants (from /me) and open invitations: pick where to work, accept an invitation, or create a restaurant. */
export default function RestaurantsSection() {
  const restaurants = useAuthStore((state) => state.me?.restaurants) ?? [];
  const empty = !restaurants.length;

  return (
    <AuthCard
      title={empty ? 'Welcome to Restora' : 'Your restaurants'}
      subtitle={empty ? 'Create your restaurant, or join the one that invited you.' : 'Pick where to work. You can switch any time from More.'}
      footer={<SignedInAs />}
    >
      <View className="flex-1 gap-5">
        <InvitationsList />
        {restaurants.map((restaurant) => (
          <RestaurantRow key={restaurant._id} restaurant={restaurant} />
        ))}
        <View className="mt-auto" />
        <Link href="/create_restaurant" asChild>
          <Button variant={empty ? 'primary' : 'outline'} size="lg" icon="add">
            Create a restaurant
          </Button>
        </Link>
      </View>
    </AuthCard>
  );
}
