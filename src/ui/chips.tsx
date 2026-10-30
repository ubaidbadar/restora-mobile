import { ScrollView, View } from 'react-native';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import type IconName from '@/types/icon_name';
import Chip from '@/ui/chip';

interface ChipsProps {
  /** With `control`, the form field (`{...register('reason')}`). */
  name?: string;
  control?: Control<FieldValues>;
  options: { value: string; label: string; count?: number; icon?: IconName }[];
  value?: string;
  onChange?: (value: string) => void;
  /** Wrap onto more lines (choices in a form) instead of one line that scrolls sideways (a list's filter). */
  wrap?: boolean;
  /** For the scroll view, e.g. `-mx-4` to run to the screen's edges. */
  className?: string;
}

/**
 * Filters and picks from four or more options (the web's `ui/chips`): each option its own pill, the picked one filled
 * ink. A filter row scrolls sideways; choices in a form wrap. Two or three short options that flip a view are `ui/tabs`.
 */
function ChipsView({ options, value, onChange, wrap = false, className = '' }: ChipsProps) {
  const chips = options.map((option) => (
    <Chip key={option.value} label={option.label} count={option.count} icon={option.icon} selected={option.value === value} onPress={() => option.value !== value && onChange?.(option.value)} />
  ));
  if (wrap) {
    return (
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {chips}
      </View>
    );
  }
  return (
    <ScrollView horizontal accessibilityRole="radiogroup" showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }} className={className} contentContainerClassName="gap-2 px-4">
      {chips}
    </ScrollView>
  );
}

function RegisteredChips({ name, control, onChange, ...props }: ChipsProps & { name: string; control: Control<FieldValues> }) {
  const { field } = useController({ name, control });
  return (
    <ChipsView
      {...props}
      value={field.value}
      onChange={(value) => {
        field.onChange(value);
        onChange?.(value);
      }}
    />
  );
}

/** Registered (`{...register('reason')}`) or controlled (`value` + `onChange`). */
export default function Chips({ name, control, ...props }: ChipsProps) {
  if (name && control) return <RegisteredChips name={name} control={control} {...props} />;
  return <ChipsView {...props} />;
}
