import { View } from 'react-native';

/** A grey block in the shape of something still loading. Size it with classes: `h-4 w-24`. */
export default function Skeleton({ className = '' }: { className?: string }) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className={`rounded-small bg-sunken ${className}`} />;
}
