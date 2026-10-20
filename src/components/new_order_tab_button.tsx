import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Icon from '@/ui/icon';

/**
 * New order, in the middle of the tab bar, for people who take orders: a round button raised half out of the bar, in a
 * ring of the bar's own color, with its label under it like the other tabs.
 */
export default function NewOrderTabButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="New order"
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/order/new');
      }}
      className="flex-1 items-center justify-end pb-2.5 active:opacity-80"
    >
      <View className="absolute -top-8 size-16 items-center justify-center rounded-pill border-4 border-surface bg-primary">
        <Icon name="add" size={30} className="accent-on-primary" />
      </View>
      <Text numberOfLines={1} className="text-[11px] font-semibold text-primary">
        New order
      </Text>
    </Pressable>
  );
}
