import { useState } from 'react';
import { Text, View } from 'react-native';
import type AddonGroup from '@/types/addon_group';
import type CartItem from '@/types/cart_item';
import type MenuItem from '@/types/menu_item';
import type OverlayProps from '@/types/overlay_props';
import Button from '@/ui/button';
import Chip from '@/ui/chip';
import Input from '@/ui/input';
import SheetPanel from '@/ui/sheet_panel';
import addonRule from '@/utils/addon_rule';
import cartItemOf from '@/utils/cart_item_of';
import formatRs from '@/utils/format_rs';
import AddonChoices from './addon_choices';

interface DishPickerPanelProps extends OverlayProps {
  dish: MenuItem;
  groups: AddonGroup[];
  /** What is in a deal; '' for a dish. */
  contents: string;
  onAdd: (item: CartItem) => void;
}

/** Size, add-ons and a note for one dish, with the price as it adds up. "Add" puts one in the order. */
export default function DishPickerPanel({ dish, groups, contents, onAdd, ...overlay }: DishPickerPanelProps) {
  const [pick, setPick] = useState(() => ({
    sizeId: dish.sizes[0]?._id ?? '',
    addonIds: groups.flatMap((group) => (group.min > 0 && group.options.length > 0 ? [group.options[0]!._id] : [])),
    note: '',
  }));
  const size = dish.sizes.find((option) => option._id === pick.sizeId);
  const addons = groups.flatMap((group) => group.options).filter((option) => pick.addonIds.includes(option._id));
  const ready = Boolean(size) && groups.every((group) => group.options.filter((option) => pick.addonIds.includes(option._id)).length >= group.min);
  const item = size ? cartItemOf(dish, size, addons, pick.note) : null;

  return (
    <SheetPanel {...overlay} title={dish.name}>
      {contents !== '' && <Text className="text-sm text-muted">{contents}</Text>}
      {dish.sizes.length > 1 && (
        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">Size</Text>
          <View className="flex-row flex-wrap gap-2">
            {dish.sizes.map((option) => (
              <Chip key={option._id} label={`${option.name} · ${formatRs(option.price)}`} selected={option._id === pick.sizeId} onPress={() => setPick({ ...pick, sizeId: option._id })} />
            ))}
          </View>
        </View>
      )}
      {groups.map((group) => (
        <View key={group._id} className="gap-2">
          <View className="flex-row items-baseline justify-between gap-2">
            <Text className="text-sm font-semibold text-ink">{group.name}</Text>
            <Text className="text-xs text-muted">{addonRule(group)}</Text>
          </View>
          <AddonChoices group={group} picked={pick.addonIds} onChange={(addonIds) => setPick({ ...pick, addonIds })} />
        </View>
      ))}
      <Input label="Note for the kitchen (optional)" maxLength={120} placeholder="e.g. less spicy" value={pick.note} onChangeText={(note) => setPick({ ...pick, note })} />
      <Button
        size="lg"
        disabled={!ready || !item}
        onPress={() => {
          if (!item) return;
          onAdd(item);
          overlay.close();
        }}
      >
        {item && ready ? `Add · ${formatRs(item.price)}` : 'Pick the options above'}
      </Button>
    </SheetPanel>
  );
}
