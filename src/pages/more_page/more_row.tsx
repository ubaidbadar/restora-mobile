import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import type IconName from '@/types/icon_name';
import Icon from '@/ui/icon';

interface MoreRowProps {
  icon: IconName;
  label: string;
  /** The current value, on the end side (e.g. the branch's name). */
  value?: string;
  onPress?: () => void;
  /** Something on the end side instead of the value and chevron. */
  trailing?: ReactNode;
  first?: boolean;
}

/** One row in a More card: icon, label, value, chevron when it opens something. */
export default function MoreRow({ icon, label, value, onPress, trailing, first = false }: MoreRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={value ? `${label}: ${value}` : label}
      disabled={!onPress}
      onPress={onPress}
      className={`min-h-14 flex-row items-center gap-3 px-4 active:bg-hover ${first ? '' : 'border-t border-border'}`}
    >
      <Icon name={icon} size={22} className="accent-body" />
      <Text className="text-base text-ink">{label}</Text>
      <View className="flex-1 flex-row items-center justify-end gap-1">
        {trailing ?? (
          <>
            {value && (
              <Text numberOfLines={1} className="shrink text-base text-muted">
                {value}
              </Text>
            )}
            {onPress && <Icon name="chevron-forward" size={18} />}
          </>
        )}
      </View>
    </Pressable>
  );
}
