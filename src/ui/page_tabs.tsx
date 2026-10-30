import { Pressable, ScrollView, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface PageTabsProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * The parts of one screen (Menu: Dishes, Deals…; a customer: Orders, Khata, Notes), as the web's `ui/page_tabs`: words
 * on a hairline, the open one underlined in ink. Scrolls sideways when they don't fit.
 */
export default function PageTabs({ label, options, value, onChange, className = '' }: PageTabsProps) {
  return (
    <ScrollView
      horizontal
      accessibilityRole="tablist"
      accessibilityLabel={label}
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      className={`border-b border-border ${className}`}
      contentContainerClassName="gap-6"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              void Haptics.selectionAsync();
              onChange(option.value);
            }}
            className={`-mb-px min-h-11 justify-center border-b-2 ${selected ? 'border-ink' : 'border-transparent active:opacity-60'}`}
          >
            <Text className={`text-base ${selected ? 'font-semibold text-ink' : 'font-medium text-muted'}`}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
