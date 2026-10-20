import { Pressable, type PressableProps, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type IconName from '@/types/icon_name';
import Icon from '@/ui/icon';

interface TabBarButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  icon: IconName;
  activeIcon: IconName;
  /** Given by `TabTrigger`. */
  isFocused?: boolean;
  href?: string;
  /** Registered as a tab but not in the bar (the person can't open it, or it sits in More). */
  hidden?: boolean;
}

/** One tab of the bottom bar, as on the web's: icon over label, the open one in the primary color. */
// `TabTrigger` also passes its own `style` (a row layout); it is dropped so the icon sits above the label.
export default function TabBarButton({ label, icon, activeIcon, isFocused = false, hidden = false, href: _href, style: _style, onPress, ...props }: TabBarButtonProps) {
  if (hidden) return null;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={(event) => {
        if (!isFocused) void Haptics.selectionAsync();
        onPress?.(event);
      }}
      className="flex-1 flex-col items-center justify-center gap-1"
    >
      {/* The open tab: the filled icon and a bolder label in the primary color (never color alone). */}
      <View className="h-8 items-center justify-center">
        <Icon name={isFocused ? activeIcon : icon} size={24} className={isFocused ? 'accent-primary' : 'accent-muted'} />
      </View>
      <Text numberOfLines={1} className={`text-[11px] ${isFocused ? 'font-semibold text-primary' : 'font-medium text-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
