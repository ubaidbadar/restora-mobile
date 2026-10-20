import { View } from 'react-native';
import Skeleton from '@/ui/skeleton';

/** Rows in the shape of a list that is still loading. */
export default function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <View accessibilityLabel="Loading" className="gap-px overflow-hidden rounded-card border border-border bg-border">
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} className="flex-row items-center gap-3 bg-surface px-4 py-3.5">
          <Skeleton className="size-10 rounded-pill" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </View>
        </View>
      ))}
    </View>
  );
}
