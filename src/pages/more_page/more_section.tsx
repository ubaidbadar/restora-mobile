import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

/** A titled group of rows in one card, like the platform's settings screens. */
export default function MoreSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text accessibilityRole="header" className="px-1 text-sm font-semibold text-muted">
        {title}
      </Text>
      <View className="overflow-hidden rounded-card border border-border bg-surface">{children}</View>
    </View>
  );
}
