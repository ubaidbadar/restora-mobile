import { View } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';
import type Workplace from '@shared/workplace';
import can from '@shared/can';
import LiveUpdates from '@/components/live_updates';
import NewOrderTabButton from '@/components/new_order_tab_button';
import PushAlerts from '@/components/push_alerts';
import TabBarButton from '@/components/tab_bar_button';
import TAB_BAR_HEIGHT from '@/constants/tab_bar_height';
import TAB_LINKS from '@/constants/tab_links';
import type TabLink from '@/types/tab_link';
import splitTabLinks from '@/utils/split_tab_links';

/**
 * The app's own tab bar, in Restora's design (the web's bottom bar): the first three tabs this person may open, New order
 * in the middle, More last. Every tab stays registered, so a link to one that is not in the bar (from More, or Today's
 * lists) still opens it.
 */
export default function AppTabs({ workplace }: { workplace: Workplace }) {
  const bottom = useSafeAreaInsets().bottom;
  const { inBar } = splitTabLinks(workplace);
  const canvas = useCSSVariable('--color-canvas') as string;
  const takesOrders = can(workplace, 'orders:create');
  const trigger = (link: TabLink) => (
    <TabTrigger key={link.name} name={link.name} href={link.href} asChild>
      <TabBarButton label={link.label} icon={link.icon} activeIcon={link.activeIcon} hidden={!inBar.includes(link)} />
    </TabTrigger>
  );

  return (
    <Tabs style={{ flex: 1, backgroundColor: canvas }} options={{ backBehavior: 'initialRoute' }}>
      {/* The bar lies over the screens; their lists leave room for it at the end (pb-32). */}
      <TabSlot />
      {can(workplace, 'orders:view') && <LiveUpdates key={workplace.branch?._id} />}
      {/* Expo Go cannot get push alerts (and lacks parts of expo-notifications), so only real builds listen. */}
      {!isRunningInExpoGo() && (can(workplace, 'orders:view') || can(workplace, 'tables:view')) && <PushAlerts key={workplace.branch?._id} />}
      {/* Edge to edge and down to the screen's bottom; the safe-area padding keeps the tabs above the home indicator and
          clear of the rounded corners. */}
      <TabList asChild>
        <View style={{ height: TAB_BAR_HEIGHT + bottom, paddingBottom: bottom }} className="absolute inset-x-0 bottom-0 flex-row items-stretch border-t border-border bg-surface px-2">
          {inBar.slice(0, 2).map(trigger)}
          {takesOrders && <NewOrderTabButton />}
          {inBar.slice(2).map(trigger)}
          <TabTrigger name="more" href="/more" asChild>
            <TabBarButton label="More" icon="menu-outline" activeIcon="menu" />
          </TabTrigger>
          {TAB_LINKS.filter((link) => !inBar.includes(link)).map(trigger)}
        </View>
      </TabList>
    </Tabs>
  );
}
