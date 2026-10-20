import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** A tab's main screen: the canvas, kept clear of the status bar so content never scrolls under the clock. */
export default function TabScreen({ children }: { children: ReactNode }) {
  const top = useSafeAreaInsets().top;
  return (
    <View style={{ paddingTop: top }} className="flex-1 bg-canvas">
      {children}
    </View>
  );
}
