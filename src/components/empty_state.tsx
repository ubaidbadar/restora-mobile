import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type IconName from '@/types/icon_name';
import Icon from '@/ui/icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  text?: string;
  /** A button that fixes it, e.g. "New order". */
  children?: ReactNode;
}

/** What a list says when it has nothing to show, and what to do about it. */
export default function EmptyState({ icon, title, text, children }: EmptyStateProps) {
  return (
    <View className="items-center gap-2 px-8 py-14">
      <View className="mb-1 size-14 items-center justify-center rounded-pill bg-sunken">
        <Icon name={icon} size={28} />
      </View>
      <Text accessibilityRole="header" className="text-center text-heading font-semibold text-ink">
        {title}
      </Text>
      {text && <Text className="max-w-sm text-center text-sm text-muted">{text}</Text>}
      {children && <View className="mt-3">{children}</View>}
    </View>
  );
}
