import { Text } from 'react-native';

/** A field's error under it; nothing without one. */
export default function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <Text accessibilityRole="alert" className="text-sm font-medium text-danger-700">
      {children}
    </Text>
  );
}
