import useAuthStore from '@/store/auth_store';
import RestaurantsSection from './restaurants_section';
import WelcomeSection from './welcome_section';

/**
 * Signed in, not in the app yet. Without a restaurant: your restaurants and invitations. The owner of a new
 * restaurant: the first-run setup (tax, then the menu). Which one shows comes from `/me`.
 */
export default function StartPage() {
  const inRestaurant = useAuthStore((state) => Boolean(state.me?.workplace));
  return inRestaurant ? <WelcomeSection /> : <RestaurantsSection />;
}
