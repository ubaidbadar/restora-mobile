import { Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import IconButton from '@/ui/icon_button';

interface QtyStepperProps {
  itemId: string;
  name: string;
  qty: number;
  onChange: (itemId: string, qty: number) => void;
}

/** − count +. Minus at one removes the line. */
export default function QtyStepper({ itemId, name, qty, onChange }: QtyStepperProps) {
  const change = (next: number) => {
    void Haptics.selectionAsync();
    onChange(itemId, next);
  };

  return (
    <View className="flex-row items-center gap-1">
      <IconButton icon="remove" variant="outline" size="sm" label={qty === 1 ? `Remove ${name}` : `One less ${name}`} onPress={() => change(qty - 1)} />
      <Text accessibilityLabel={`${qty} ${name}`} className="min-w-8 text-center text-base font-semibold text-ink">
        {qty}
      </Text>
      <IconButton icon="add" variant="outline" size="sm" label={`One more ${name}`} onPress={() => change(qty + 1)} />
    </View>
  );
}
