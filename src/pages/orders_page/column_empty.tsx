import { Text } from 'react-native';

/** A status with no orders in it. */
export default function ColumnEmpty() {
  return <Text className="rounded-card border border-dashed border-border-strong px-3 py-8 text-center text-sm text-muted">No orders here</Text>;
}
