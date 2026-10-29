import type { ReactNode } from 'react';
import { View } from 'react-native';
import useSafeSpace from '@/hooks/useSafeSpace';

/** A tab's main screen: the canvas, kept clear of the status bar (and the notch in landscape) so content never scrolls under the clock. */
export default function TabScreen({ children }: { children: ReactNode }) {
  const space = useSafeSpace();
  return (
    <View style={{ paddingTop: space.top, paddingHorizontal: space.sides }} className="flex-1 bg-canvas">
      {children}
    </View>
  );
}
