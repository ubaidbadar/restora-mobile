import { Pressable, Text, View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import * as Haptics from 'expo-haptics';

interface SegmentedProps {
  name?: string;
  control?: Control<FieldValues>;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

/** The web's segmented control: equal parts in a bordered, sunken track, the picked one raised on the surface. */
function SegmentedView({ options, value, onChange }: SegmentedProps) {
  return (
    <View accessibilityRole="radiogroup" className="flex-row gap-1 rounded-control border border-border bg-sunken p-1">
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
            className={`min-h-10 flex-1 items-center justify-center rounded-small px-2 ${selected ? 'border border-border bg-surface' : 'active:opacity-60'}`}
          >
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} className={`text-sm ${selected ? 'font-semibold text-ink' : 'font-medium text-body'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RegisteredSegmented({ name, control, onChange, ...props }: SegmentedProps & { name: string; control: Control<FieldValues> }) {
  const { field } = useController({ name, control });
  return (
    <SegmentedView
      {...props}
      value={field.value}
      onChange={(value) => {
        field.onChange(value);
        onChange?.(value);
      }}
    />
  );
}

/** For two to four short choices. Registered (`{...register('type')}`) or controlled (`value` + `onChange`). */
export default function Segmented({ name, control, ...props }: SegmentedProps) {
  if (name && control) return <RegisteredSegmented name={name} control={control} {...props} />;
  return <SegmentedView {...props} />;
}
