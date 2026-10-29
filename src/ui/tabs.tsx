import { Pressable, ScrollView, Text, View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import * as Haptics from 'expo-haptics';

interface TabsProps {
  /** With `control`, the form field (`{...register('type')}`). */
  name?: string;
  control?: Control<FieldValues>;
  options: { value: string; label: string; count?: number }[];
  value?: string;
  onChange?: (value: string) => void;
  /** Many or long options: one line that scrolls sideways, the options as wide as their labels. */
  scroll?: boolean;
  /** Many or long options in a form: they wrap onto more lines. */
  wrap?: boolean;
  /** For the scroll view when `scroll` is set, e.g. `-mx-4` to run to the screen's edges. */
  className?: string;
}

/**
 * The app's one tab strip (the web's `ui/tabs`): page tabs, filters and picked-one choices in forms. A light primary
 * track with the picked option filled in primary. Without `scroll` or `wrap` the options share the width equally.
 */
function TabsView({ options, value, onChange, scroll = false, wrap = false, className = '' }: TabsProps) {
  const even = !scroll && !wrap;
  const track = (
    <View accessibilityRole="radiogroup" className={`flex-row gap-1 rounded-control bg-primary-soft p-1 ${wrap ? 'flex-wrap' : ''} ${scroll || wrap ? 'self-start' : ''}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => {
              if (selected) return;
              void Haptics.selectionAsync();
              onChange?.(option.value);
            }}
            className={`min-h-10 flex-row items-center justify-center gap-2 rounded-small px-3 ${even ? 'flex-1' : ''} ${selected ? 'bg-primary' : 'active:opacity-60'}`}
          >
            <Text numberOfLines={1} adjustsFontSizeToFit={even} minimumFontScale={0.85} className={`text-sm ${selected ? 'font-semibold text-on-primary' : 'font-medium text-body'}`}>
              {option.label}
            </Text>
            {option.count !== undefined && (
              <Text className={`min-w-5 rounded-small px-1 text-center text-xs font-semibold ${selected ? 'bg-primary-hover text-on-primary' : 'bg-surface text-muted'}`}>{option.count}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
  if (!scroll) return track;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }} className={className} contentContainerClassName="px-4">
      {track}
    </ScrollView>
  );
}

function RegisteredTabs({ name, control, onChange, ...props }: TabsProps & { name: string; control: Control<FieldValues> }) {
  const { field } = useController({ name, control });
  return (
    <TabsView
      {...props}
      value={field.value}
      onChange={(value) => {
        field.onChange(value);
        onChange?.(value);
      }}
    />
  );
}

/** Registered (`{...register('type')}`) or controlled (`value` + `onChange`). */
export default function Tabs({ name, control, ...props }: TabsProps) {
  if (name && control) return <RegisteredTabs name={name} control={control} {...props} />;
  return <TabsView {...props} />;
}
