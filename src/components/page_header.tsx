import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { router, useSegments } from 'expo-router';
import useAuthStore from '@/store/auth_store';
import IconButton from '@/ui/icon_button';
import splitTabLinks from '@/utils/split_tab_links';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Actions at the end of the row (add, scan), centered on the title. */
  children?: ReactNode;
}

/**
 * The title of a tab's main screen, as the web's PageHeader. It is the first thing in the screen's scroll view, so it
 * scrolls away with the content (the tab bar already says where you are). Inside the screen's padding. A page that
 * is not in the tab bar (opened from More) starts with a back arrow.
 */
export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const tab = useSegments().at(1);
  // A page opened from More (it is not in the tab bar) gets a back arrow to More.
  const fromMore = splitTabLinks(useAuthStore((state) => state.me?.workplace)).inMore.some((link) => link.name === tab);

  return (
    <View className="flex-row items-center justify-between gap-3 pt-2 pb-1">
      {fromMore && <IconButton icon="chevron-back" label="Back to More" className="-me-2 -ms-2" onPress={() => router.navigate('/more')} />}
      <View className="flex-1">
        <Text accessibilityRole="header" numberOfLines={1} className="text-display font-bold text-ink">
          {title}
        </Text>
        {subtitle && (
          <Text numberOfLines={1} className="mt-0.5 text-sm text-muted">
            {subtitle}
          </Text>
        )}
      </View>
      {children && <View className="flex-row items-center gap-2">{children}</View>}
    </View>
  );
}
