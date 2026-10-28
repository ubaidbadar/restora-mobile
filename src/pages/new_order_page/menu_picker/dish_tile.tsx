import { Pressable, Text, View } from 'react-native';
import Icon from '@/ui/icon';
import priceRange from '@/utils/price_range';
import defaultLine from './default_line';
import DishPicker from './dish_picker';
import type DishProps from './dish_props';

/**
 * Tablets: tap a plain dish to add one; a dish with sizes or add-ons opens its choices first. Once in the order the tile
 * is outlined with its count; quantities change in the order panel beside it.
 */
export default function DishTile({ dish, groups, contents, lines, onAdd }: DishProps) {
  const plain = dish.sizes.length === 1 && groups.length === 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <DishPicker
      dish={dish}
      groups={groups}
      contents={contents}
      onAdd={onAdd}
      component={({ open }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={plain ? `Add ${dish.name}` : `Choose ${dish.name}`}
          accessibilityHint={contents || undefined}
          onPress={plain ? () => onAdd(defaultLine(dish, groups)) : open}
          className={`h-28 flex-1 justify-between rounded-card border-2 p-3 active:bg-sunken ${qty ? 'border-primary bg-primary-soft' : 'border-border bg-surface'}`}
        >
          <Text numberOfLines={2} className="text-base font-medium text-ink">
            {dish.name}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text numberOfLines={1} className="flex-1 text-sm font-semibold text-ink">
              {priceRange(dish.sizes)}
            </Text>
            {!plain && <Icon name="options-outline" size={16} className="accent-accent-text" />}
            {qty > 0 && <Text className="min-w-6 rounded-pill bg-primary px-1.5 text-center text-xs font-bold leading-6 text-on-primary">{qty}</Text>}
          </View>
        </Pressable>
      )}
    />
  );
}
