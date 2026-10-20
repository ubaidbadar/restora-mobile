import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import EmptyState from '@/components/empty_state';
import type IconName from '@/types/icon_name';

interface ListTabProps {
  header: ReactNode;
  /** One line under the tabs about what this list is for. */
  intro: string;
  empty: { icon: IconName; title: string; text: string };
  refreshing: boolean;
  onRefresh: () => void;
  /** The rows; none shows the empty state. */
  children: ReactNode[];
}

/** Categories and Add-ons: a short list in one card, under the menu's header and tabs. */
export default function ListTab({ header, intro, empty, refreshing, onRefresh, children }: ListTabProps) {
  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-3 px-4 pb-32" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {header}
      <Text className="text-sm text-muted">{intro}</Text>
      {children.length ? (
        <View className="overflow-hidden rounded-card border border-border bg-surface">
          {children.map((row, index) => (
            <View key={index} className={index ? 'border-t border-border' : ''}>
              {row}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState {...empty} />
      )}
    </ScrollView>
  );
}
