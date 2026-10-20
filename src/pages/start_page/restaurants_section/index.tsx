import { Link } from 'expo-router';
import { View } from 'react-native';
import AuthCard from '@/components/auth_card';
import SignedInAs from '@/components/signed_in_as';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import type Membership from '@/types/membership';
import Button from '@/ui/button';
import InvitationsList from './invitations_list';
import RestaurantRow from './restaurant_row';

/** Your restaurants and open invitations: pick where to work, accept an invitation, or create a restaurant. */
export default function RestaurantsSection() {
  const { data: memberships = [], loading, update } = useGet<Membership[]>('/restaurants');
  const empty = !loading && !memberships.length;

  return (
    <AuthCard
      title={empty ? 'Welcome to Restora' : 'Your restaurants'}
      subtitle={empty ? 'Create your restaurant, or join the one that invited you.' : 'Pick where to work. You can switch any time from More.'}
      footer={<SignedInAs />}
    >
      <View className="flex-1 gap-5">
        <InvitationsList />
        {loading ? (
          <SkeletonList rows={2} />
        ) : (
          memberships.map((membership) => (
            <RestaurantRow key={membership._id} membership={membership} onSaved={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))} />
          ))
        )}
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
