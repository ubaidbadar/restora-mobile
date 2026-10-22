import { Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import Icon from '@/ui/icon';
import Sheet from '@/ui/sheet';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import MoreRow from './more_row';

/**
 * The restaurant and branch this sign-in works at, each switchable from a sheet. The answer is the new `/me`; the tabs
 * remount and every screen loads its data again once.
 */
export default function WorkplaceSection() {
  const me = useAuthStore((state) => state.me);
  const workplace = me?.workplace;
  if (!me || !workplace) return null;
  // Suspended ones and those being deleted cannot be opened.
  const openable = me.restaurants.filter((r) => !r.status);

  const switchTo = (url: '/me/workplace' | '/me/branch', body: object, done: string, close: () => void) => {
    close();
    api
      .post(url, body)
      .then((res) => {
        useAuthStore.getState().setMe(res.data);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(done);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  const choices = (items: { _id: string; name: string }[], current: string | undefined, pick: (item: { _id: string; name: string }) => void) =>
    items.map((item) => (
      <Pressable
        key={item._id}
        accessibilityRole="radio"
        accessibilityState={{ checked: item._id === current }}
        onPress={() => item._id !== current && pick(item)}
        className="min-h-13 flex-row items-center justify-between gap-3 rounded-control px-3 active:bg-hover"
      >
        <Text className={`flex-1 text-base ${item._id === current ? 'font-semibold text-accent-text' : 'text-ink'}`}>{item.name}</Text>
        {item._id === current && <Icon name="checkmark" className="accent-accent-text" />}
      </Pressable>
    ));

  return (
    <>
      <Sheet title="Restaurant" component={({ open }) => <MoreRow first icon="storefront-outline" label="Restaurant" value={workplace.restaurant.name} onPress={openable.length > 1 ? open : undefined} />}>
        {({ close }) => choices(openable, workplace.restaurant._id, (item) => switchTo('/me/workplace', { restaurantId: item._id }, `Now working at ${item.name}`, close))}
      </Sheet>
      <Sheet title="Branch" component={({ open }) => <MoreRow icon="business-outline" label="Branch" value={workplace.branch?.name ?? 'None open'} onPress={workplace.branches.length > 1 ? open : undefined} />}>
        {({ close }) => choices(workplace.branches, workplace.branch?._id, (item) => switchTo('/me/branch', { branchId: item._id }, `Now at ${item.name}`, close))}
      </Sheet>
    </>
  );
}
