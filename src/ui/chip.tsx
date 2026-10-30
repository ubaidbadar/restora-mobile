import { Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import type IconName from '@/types/icon_name';
import Icon from '@/ui/icon';

interface ChipProps {
  label: string;
  selected?: boolean;
  /** A number after the label, e.g. orders in a status. */
  count?: number;
  icon?: IconName;
  onPress: () => void;
}

/** One pill in a row of chips (filters, categories, add-ons): as wide as its words, filled ink when picked. */
export default function Chip({ label, selected = false, count, icon, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        if (!selected) void Haptics.selectionAsync();
        onPress();
      }}
      className={`min-h-10 flex-row items-center gap-1.5 rounded-pill border px-3.5 ${selected ? 'border-ink bg-ink' : 'border-border bg-surface active:bg-sunken'}`}
    >
      {icon && <Icon name={icon} size={16} className={selected ? 'accent-surface' : 'accent-body'} />}
      <Text className={`text-sm ${selected ? 'font-semibold text-surface' : 'font-medium text-body'}`}>{label}</Text>
      {count !== undefined && <Text className={`text-xs font-medium ${selected ? 'text-surface' : 'text-muted'}`}>{count}</Text>}
    </Pressable>
  );
}
