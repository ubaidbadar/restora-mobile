import { View } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';
import type Workplace from '@shared/workplace';
import can from '@shared/can';
import LiveUpdates from '@/components/live_updates';
import NewOrderTabButton from '@/components/new_order_tab_button';
import PushAlerts from '@/components/push_alerts';
import TabBarButton from '@/components/tab_bar_button';
import useSafeSpace from '@/hooks/useSafeSpace';
import TAB_BAR_HEIGHT from '@/constants/tab_bar_height';
import TAB_LINKS from '@/constants/tab_links';
import type TabLink from '@/types/tab_link';
import splitTabLinks from '@/utils/split_tab_links';

/** The bar's top edge, 112pt wide, dipping round New order's button (34pt around its centre, 2pt below the edge) with small rounded shoulders. */
const EDGE = 'M0 0H16.2A6 6 0 0 1 22.17 5.4A34 34 0 0 0 89.83 5.4A6 6 0 0 1 95.8 0H112';

/**
 * The app's own tab bar, in Restora's design (the web's bottom bar): the first three tabs this person may open, New order
 * in the middle, More last. Every tab stays registered, so a link to one that is not in the bar (from More, or Today's
 * lists) still opens it.
 */
export default function AppTabs({ workplace }: { workplace: Workplace }) {
  const bottom = useSafeAreaInsets().bottom;
  const sides = useSafeSpace().sides;
  const { inBar } = splitTabLinks(workplace);
  const canvas = useCSSVariable('--color-canvas') as string;
  const surface = useCSSVariable('--color-surface') as string;
  const border = useCSSVariable('--color-border') as string;
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
          clear of the rounded corners; in landscape it keeps clear of the notch too. */}
      <TabList asChild>
        <View style={{ height: TAB_BAR_HEIGHT + bottom, paddingBottom: bottom, paddingHorizontal: sides + 8 }} className="absolute inset-x-0 bottom-0 flex-row items-stretch">
          {/* The bar's background, cut out in the middle round New order's button; the screen shows through the cut. */}
          {takesOrders ? (
            <View pointerEvents="none" className="absolute inset-0 flex-row">
              <View className="flex-1 border-t border-border bg-surface" />
              <View className="-mx-px w-[112px]">
                <Svg width={112} height={TAB_BAR_HEIGHT} viewBox={`0 -0.5 112 ${TAB_BAR_HEIGHT}`}>
                  <Path d={`${EDGE}V${TAB_BAR_HEIGHT}H0Z`} fill={surface} />
                  <Path d={EDGE} fill="none" stroke={border} strokeWidth={1} />
                </Svg>
                <View className="flex-1 bg-surface" />
              </View>
              <View className="flex-1 border-t border-border bg-surface" />
            </View>
          ) : (
            <View pointerEvents="none" className="absolute inset-0 border-t border-border bg-surface" />
          )}
          {/* With New order, five slots (as on the web) so it stays in the middle over the cut-out when someone has fewer tabs. */}
          {[0, 1].map((slot) => (inBar[slot] ? trigger(inBar[slot]) : takesOrders && <View key={slot} className="flex-1" />))}
          {takesOrders && <NewOrderTabButton />}
          {inBar[2] ? trigger(inBar[2]) : takesOrders && <View className="flex-1" />}
          <TabTrigger name="more" href="/more" asChild>
            <TabBarButton label="More" icon="menu-outline" activeIcon="menu" />
          </TabTrigger>
          {TAB_LINKS.filter((link) => !inBar.includes(link)).map(trigger)}
        </View>
      </TabList>
    </Tabs>
  );
}
