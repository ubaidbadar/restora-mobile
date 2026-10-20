import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import type IconName from '@/types/icon_name';
import Icon from './icon';

interface SwipeAction {
  label: string;
  icon: IconName;
  /** The fill behind the action, e.g. `bg-success-600`. */
  className: string;
  onPress: () => void;
}

interface SwipeRowProps {
  /** Shown by swiping toward the end (right in English): the row's main next step. */
  start?: SwipeAction;
  /** Shown by swiping toward the start. */
  end?: SwipeAction;
  children: ReactNode;
}

const renderAction = (action: SwipeAction) =>
  function Action(_progress: unknown, _translation: unknown, swipeable: { close: () => void }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action.label}
        onPress={() => {
          swipeable.close();
          action.onPress();
        }}
        className={`w-28 items-center justify-center gap-1 px-2 ${action.className}`}
      >
        <Icon name={action.icon} size={24} className="accent-on-primary" />
        <Text numberOfLines={2} className="text-center text-xs font-semibold text-on-primary">
          {action.label}
        </Text>
      </Pressable>
    );
  };

/**
 * A row with swipe actions, like Mail: swipe to uncover the action, tap it. Uncovering gives a tick of haptic.
 * Every swipe action must also be in the row's menu, for people who don't swipe (and screen readers).
 */
export default function SwipeRow({ start, end, children }: SwipeRowProps) {
  return (
    <Swipeable
      friction={1.5}
      overshootFriction={8}
      leftThreshold={48}
      rightThreshold={48}
      containerStyle={{ overflow: 'hidden', borderRadius: 12 }}
      renderLeftActions={start && renderAction(start)}
      renderRightActions={end && renderAction(end)}
      onSwipeableWillOpen={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {children}
    </Swipeable>
  );
}
