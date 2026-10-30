import { type ReactNode, useEffect } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import useSafeSpace from '@/hooks/useSafeSpace';
import type OverlayProps from '@/types/overlay_props';
import type ShowTools from '@/types/show_tools';
import IconButton from './icon_button';

interface SheetPanelProps extends OverlayProps {
  title?: string;
  /** A second step inside the sheet (e.g. a new customer's form): a back arrow before the title returns to the first. */
  onBack?: () => void;
  /** Opens at almost full height (long forms, search lists); otherwise the sheet is as tall as its content. */
  full?: boolean;
  /** The content brings its own list (a FlatList): it is not wrapped in a scroll view. Use with `full`. */
  noScroll?: boolean;
  /** Stays at the bottom while the content scrolls (e.g. the total and Place order); it keeps clear of the home bar itself (`useSafeSpace().bottom`). */
  footer?: ReactNode;
  children: ReactNode | ((tools: ShowTools) => ReactNode);
}

const OPEN = { duration: 260, easing: Easing.out(Easing.cubic) };
const CLOSE = { duration: 200, easing: Easing.in(Easing.cubic) };

/**
 * The app's one bottom sheet. It slides up over a dimmed screen; drag its handle or title down, tap the dimmed screen,
 * press the close button or Android's back to close it. The keyboard pushes it up. On tablets it is a centered card.
 */
export default function SheetPanel({ title, onBack, full, noScroll, footer, children, ...tools }: SheetPanelProps) {
  const window = useWindowDimensions();
  // Below the status bar with room to see the screen behind, inside the notch in landscape, and its last row above the
  // home indicator or gesture bar, clear of the rounded corners.
  const space = useSafeSpace();
  const maxHeight = window.height - space.top - 24;
  const width = Math.min(window.width - space.sides * 2, 560);
  // 0: off screen, 1: open. `drag`: how far the sheet is pulled down by its handle.
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  // The panel is mounted fresh for each opening (withOverlay), so `drag` starts at 0 every time.
  useEffect(() => {
    progress.value = tools.state === 'active' ? withTiming(1, OPEN) : withTiming(0, CLOSE);
  }, [tools.state, progress]);

  const pan = usePanGesture({
    activeOffsetY: 8,
    onUpdate: (event) => {
      drag.value = Math.max(0, event.translationY);
    },
    onDeactivate: (event) => {
      if (event.translationY > 120 || event.velocityY > 900) scheduleOnRN(tools.close);
      else drag.value = withSpring(0, { damping: 20 });
    },
  });

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * window.height + drag.value }] }));
  const content = typeof children === 'function' ? children(tools) : children;

  return (
    <Modal visible={tools.state !== ''} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={tools.close}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Animated.View style={scrimStyle} className="absolute inset-0 bg-scrim">
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={tools.close} className="flex-1" />
          </Animated.View>
          <View pointerEvents="box-none" className="flex-1 items-center justify-end">
            <Animated.View
              accessibilityViewIsModal
              style={[sheetStyle, { width, maxHeight, height: full ? maxHeight : undefined, flexShrink: 1, paddingBottom: footer ? 0 : space.bottom }]}
              className="rounded-t-panel bg-surface"
            >
              <GestureDetector gesture={pan}>
                <View className="px-5 pt-2.5 pb-3">
                  <View className="mb-2 h-1 w-10 self-center rounded-pill bg-border-strong" />
                  <View className="min-h-11 flex-row items-center gap-1">
                    {onBack && <IconButton icon="chevron-back" label="Back" className="-ms-2" onPress={onBack} />}
                    <Text accessibilityRole="header" numberOfLines={1} className="flex-1 text-xl font-bold text-ink">
                      {title}
                    </Text>
                    <IconButton icon="close" label="Close" className="-me-2" onPress={tools.close} />
                  </View>
                </View>
              </GestureDetector>
              {noScroll ? (
                <View className="flex-1">{content}</View>
              ) : (
                <ScrollView keyboardShouldPersistTaps="handled" style={full ? { flex: 1 } : { flexGrow: 0 }} contentContainerClassName="gap-4 px-5 pb-4">
                  {content}
                </ScrollView>
              )}
              {footer}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
