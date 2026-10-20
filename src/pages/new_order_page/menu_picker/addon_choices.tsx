import { View } from 'react-native';
import type AddonGroup from '@/types/addon_group';
import Chip from '@/ui/chip';
import formatRs from '@/utils/format_rs';

interface AddonChoicesProps {
  group: AddonGroup;
  /** Every picked option id of the dish (all groups). */
  picked: string[];
  onChange: (picked: string[]) => void;
}

/** One add-on group's options as chips. A pick-one group swaps its choice; others toggle up to the group's maximum. */
export default function AddonChoices({ group, picked, onChange }: AddonChoicesProps) {
  const own = group.options.map((option) => option._id);
  const chosen = picked.filter((id) => own.includes(id));

  const toggle = (id: string) => {
    if (chosen.includes(id)) return onChange(picked.filter((entry) => entry !== id));
    if (group.max === 1) return onChange([...picked.filter((entry) => !own.includes(entry)), id]);
    if (chosen.length < group.max) onChange([...picked, id]);
  };

  return (
    <View accessibilityLabel={group.name} className="flex-row flex-wrap gap-2">
      {group.options.map((option) => (
        <Chip key={option._id} label={option.price > 0 ? `${option.name} +${formatRs(option.price)}` : option.name} selected={chosen.includes(option._id)} onPress={() => toggle(option._id)} />
      ))}
    </View>
  );
}
