import { Pressable, Text, View } from 'react-native';
import QtyStepper from '@/components/qty_stepper';
import Icon from '@/ui/icon';
import IconButton from '@/ui/icon_button';
import priceRange from '@/utils/price_range';
import defaultLine from './default_line';
import DishPicker from './dish_picker';
import type DishProps from './dish_props';

/**
 * A dish as one row on phones. A plain dish: tapping the row (or +) adds one. A dish with sizes or add-ons: tapping
 * opens its choices first. Once in the order, + becomes a stepper (or the count, when it is in with different choices).
 */
export default function DishRow({ dish, groups, contents, lines, onAdd, onQty, first, last }: DishProps & { first: boolean; last: boolean }) {
  const plain = dish.sizes.length === 1 && groups.length === 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <DishPicker
      dish={dish}
      groups={groups}
      contents={contents}
      onAdd={onAdd}
      component={({ open }) => {
        const add = plain ? () => onAdd(defaultLine(dish, groups)) : open;
        return (
          <View
            className={`min-h-16 flex-row items-center gap-2 border-x border-t border-border py-2 ps-4 pe-2 ${qty ? 'bg-primary-soft' : 'bg-surface'} ${first ? 'rounded-t-card' : ''} ${last ? 'rounded-b-card border-b' : ''}`}
          >
            <Pressable accessibilityRole="button" accessibilityLabel={plain ? `Add ${dish.name}` : `Choose ${dish.name}`} onPress={add} className="flex-1 py-1 active:opacity-60">
              <Text numberOfLines={2} className="text-base font-medium text-ink">
                {dish.name}
              </Text>
              {contents !== '' && (
                <Text numberOfLines={2} className="text-sm text-muted">
                  {contents}
                </Text>
              )}
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-semibold text-body">{priceRange(dish.sizes)}</Text>
                {!plain && (
                  <>
                    <Text className="text-sm text-subtle">·</Text>
                    <Text className="text-sm text-accent-text">{dish.sizes.length > 1 ? 'Sizes' : 'Add-ons'}</Text>
                    <Icon name="chevron-forward" size={12} className="accent-accent-text" />
                  </>
                )}
              </View>
            </Pressable>
            {qty > 0 && lines.length === 1 && plain ? (
              <QtyStepper itemId={lines[0]!.key} name={dish.name} qty={qty} onChange={onQty} />
            ) : (
              <View className="flex-row items-center gap-1.5">
                {qty > 0 && <Text className="min-w-6 rounded-pill bg-primary px-1.5 text-center text-xs font-bold leading-6 text-on-primary">{qty}</Text>}
                <IconButton icon="add" variant={qty ? 'primary' : 'outline'} size="sm" label={plain ? `Add ${dish.name}` : `Choose ${dish.name}`} onPress={add} />
              </View>
            )}
          </View>
        );
      }}
    />
  );
}
