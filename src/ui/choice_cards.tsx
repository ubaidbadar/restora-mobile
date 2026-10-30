import { Pressable, Text, View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import type IconName from '@/types/icon_name';
import Icon from '@/ui/icon';

interface ChoiceCardsProps {
  /** The form field (`{...register('type')}`). */
  name: string;
  control: Control<FieldValues>;
  label: string;
  options: { value: string; label: string; icon: IconName; /** A few words on what the choice means. */ hint?: string }[];
}

/**
 * A choice that changes what happens next (order type, how the order is paid), as the web's `ui/choice_cards`: two or
 * three tiles side by side, each with an icon and, when it helps, a hint. The picked tile is edged in ink with a dot.
 */
export default function ChoiceCards({ name, control, label, options }: ChoiceCardsProps) {
  const { field } = useController({ name, control });

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} className="flex-row gap-2">
        {options.map((option) => {
          const selected = option.value === field.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.hint ? `${option.label}, ${option.hint}` : option.label}
              onPress={() => {
                if (selected) return;
                void Haptics.selectionAsync();
                field.onChange(option.value);
              }}
              className={`min-h-16 flex-1 items-center justify-center gap-1 rounded-control px-1.5 py-2.5 ${selected ? 'border-2 border-ink bg-sunken' : 'border border-border bg-surface active:bg-sunken'}`}
            >
              {selected && <View className="absolute end-1.5 top-1.5 size-2 rounded-pill bg-ink" />}
              <Icon name={option.icon} size={20} className={selected ? 'accent-ink' : 'accent-muted'} />
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} className="text-sm font-semibold text-ink">
                {option.label}
              </Text>
              {option.hint && (
                <Text numberOfLines={2} className="text-center text-xs text-muted">
                  {option.hint}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
