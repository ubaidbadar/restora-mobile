import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The room every overlay and screen edge keeps, the same on every phone: `top` clears the notch or status bar; `bottom`
 * clears the home indicator or gesture bar with a little air, so the screen's rounded corners never clip a button (at
 * least 16 on phones that report no inset); `sides` clears the notch in landscape (0 in portrait). Add your own padding.
 */
export default function useSafeSpace() {
  const insets = useSafeAreaInsets();
  return { top: insets.top, bottom: Math.max(insets.bottom + 8, 16), sides: Math.max(insets.left, insets.right) };
}
