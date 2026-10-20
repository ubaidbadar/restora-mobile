import { Pressable, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import useToastStore from '@/store/toast_store';
import type ToastMessage from '@/types/toast_message';
import type ToastType from '@/types/toast_type';
import Icon from '@/ui/icon';
import type IconName from '@/types/icon_name';

const LOOK: Record<ToastType, { icon: IconName; color: string }> = {
  success: { icon: 'checkmark-circle', color: 'accent-success-500' },
  error: { icon: 'alert-circle', color: 'accent-danger-500' },
  warning: { icon: 'warning', color: 'accent-warning-500' },
  info: { icon: 'information-circle', color: 'accent-inverse-primary' },
};

/** One snackbar: swipe it sideways to dismiss, or tap its action. */
export default function SnackbarCard({ toast }: { toast: ToastMessage }) {
  const offset = useSharedValue(0);
  const dismiss = () => useToastStore.getState().dismiss(toast.id);

  const pan = usePanGesture({
    activeOffsetX: [-10, 10],
    onUpdate: (event) => {
      offset.value = event.translationX;
    },
    onDeactivate: (event) => {
      if (Math.abs(event.translationX) < 80) {
        offset.value = withSpring(0);
        return;
      }
      offset.value = withTiming(Math.sign(event.translationX) * 600);
      scheduleOnRN(dismiss);
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    opacity: 1 - Math.min(Math.abs(offset.value) / 400, 0.7),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        entering={FadeInDown.springify().damping(18)}
        exiting={FadeOutDown.duration(180)}
        style={style}
        accessibilityLiveRegion="polite"
        className="min-h-13 flex-row items-center gap-3 rounded-control bg-ink py-2 ps-4 pe-2"
      >
        <Icon name={LOOK[toast.type].icon} size={22} className={LOOK[toast.type].color} />
        <Text className="flex-1 py-1.5 text-sm font-medium text-canvas">{toast.message}</Text>
        {toast.action && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              toast.action?.onClick();
              dismiss();
            }}
            className="min-h-10 justify-center rounded-small px-3 active:opacity-60"
          >
            <Text className="text-sm font-bold text-inverse-primary">{toast.action.label}</Text>
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
