import AppTabs from '@/hoc/app_tabs';
import useAuthStore from '@/store/auth_store';

// Everyone starts on Orders; Today (owners and managers) is one tap away.
export const unstable_settings = { initialRouteName: '(orders)' };

/** The app's tabs. Switching restaurant or branch remounts them, so every tab loads its data again once. */
export default function AppLayout() {
  const workplace = useAuthStore((state) => state.me?.workplace);
  return <AppTabs key={`${workplace?.restaurant._id}:${workplace?.branch?._id}`} workplace={workplace!} />;
}
