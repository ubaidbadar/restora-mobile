import { View } from 'react-native';
import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TAB_BAR_HEIGHT from '@/constants/tab_bar_height';
import useToastStore from '@/store/toast_store';
import SnackbarCard from './snackbar_card';
import SyncStatus from './sync_status';

/**
 * The bottom of every screen, above the tab bar: the sync pill (offline, or changes waiting) and the snackbar
 * (`utils/toast`). Mounted once, in the root layout.
 */
export default function Snackbar() {
  const toast = useToastStore((state) => state.toast);
  const inTabs = useSegments()[0] === '(app)';
  // In the tabs it clears the floating bar and New order, which stands 32pt above it.
  const bottom = useSafeAreaInsets().bottom + (inTabs ? TAB_BAR_HEIGHT + 32 : 0) + 12;

  return (
    <View pointerEvents="box-none" style={{ bottom }} className="absolute inset-x-0 items-center gap-2 px-4">
      <SyncStatus />
      {toast && (
        <View className="w-full max-w-xl">
          <SnackbarCard key={toast.id} toast={toast} />
        </View>
      )}
    </View>
  );
}
