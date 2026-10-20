import type { ReactNode } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import EmptyState from '@/components/empty_state';
import type CartItem from '@/types/cart_item';
import type FormComponentProps from '@/types/form_component_props';
import type Menu from '@/types/menu';
import type MenuItem from '@/types/menu_item';
import filterMenu from '@/utils/filter_menu';
import setQty from '@/utils/set_qty';
import DishRow from './dish_row';
import DishTile from './dish_tile';

interface MenuGridProps extends FormComponentProps {
  menu: Menu;
  search: string;
  category: string;
  /** Above the list, staying in view: the customer, then the category chips. */
  header: ReactNode;
  categories: ReactNode;
  wide: boolean;
}

/** The same dish, size, add-ons and note adds to its line; anything different is a new line. */
const addItem = (items: CartItem[], item: CartItem): CartItem[] =>
  items.some((line) => line.key === item.key) ? items.map((line) => (line.key === item.key ? { ...line, qty: line.qty + item.qty } : line)) : [...items, item];

/** The dishes: rows on phones, tiles on tablets. Reads `items` only to show each dish's quantity; taps write `items`. */
export default function MenuGrid({ menu, search, category, header, categories, wide, control, setValue }: MenuGridProps) {
  const items: CartItem[] = useWatch({ control, name: 'items' }) ?? [];
  const width = useWindowDimensions().width;
  const shown = filterMenu(menu, search, category);
  const save = (next: CartItem[]) => setValue('items', next, { shouldDirty: true, shouldValidate: next.length > 0 });
  // Tiles about 150 wide in the menu pane (the order panel takes 384 beside it).
  const columns = wide ? Math.max(2, Math.floor((width - 384) / 150)) : 1;

  const props = (dish: MenuItem) => ({
    dish,
    groups: dish.addonGroupIds.flatMap((id) => menu.addonGroups.filter((group) => group._id === id)),
    lines: items.filter((line) => line.itemId === dish._id),
    onAdd: (item: CartItem) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      save(addItem(items, item));
    },
    onQty: (key: string, qty: number) => save(setQty(items, key, qty)),
  });

  return (
    <View className="flex-1 bg-canvas">
      <View className="border-b border-border bg-canvas">
        <View className="px-4 pt-3">{header}</View>
        {categories}
      </View>
    <FlatList
      key={columns}
      data={shown}
      numColumns={columns}
      keyExtractor={(dish) => dish._id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      className="flex-1"
      contentContainerClassName={wide ? 'gap-2.5 px-4 pt-3 pb-4' : 'px-4 pt-3 pb-32'}
      columnWrapperClassName={columns > 1 ? 'gap-2.5' : undefined}
      ListEmptyComponent={<EmptyState icon="search" title="Nothing to show" text="Try another search or category." />}
      renderItem={({ item, index }) => (wide ? <DishTile {...props(item)} /> : <DishRow {...props(item)} first={index === 0} last={index === shown.length - 1} />)}
    />
    </View>
  );
}
