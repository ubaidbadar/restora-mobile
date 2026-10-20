import { Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ChipProps {
  label: string;
  selected?: boolean;
  /** A number after the label, e.g. orders in a status. */
  count?: number;
  onPress: () => void;
}

/** One choice in a row of chips (categories, filters): the web's pill, a control-radius box, filled when picked. */
export default function Chip({ label, selected = false, count, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        if (!selected) void Haptics.selectionAsync();
        onPress();
      }}
      className={`min-h-10 flex-row items-center gap-2 rounded-control border px-3.5 ${selected ? 'border-primary bg-primary active:bg-primary-hover' : 'border-border-strong bg-surface active:bg-sunken'}`}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-on-primary' : 'text-body'}`}>{label}</Text>
      {count !== undefined && <Text className={`min-w-5 rounded-small px-1 text-center text-xs font-semibold ${selected ? 'bg-primary-hover text-on-primary' : 'bg-sunken text-muted'}`}>{count}</Text>}
    </Pressable>
  );
}
