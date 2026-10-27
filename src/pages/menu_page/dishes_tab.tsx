import { type ReactNode, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import EmptyState from '@/components/empty_state';
import ALL_CATEGORIES from '@/constants/all_categories';
import type MenuItem from '@/types/menu_item';
import Chip from '@/ui/chip';
import SearchField from '@/ui/search_field';
import filterMenu from '@/utils/filter_menu';
import upsertById from '@/utils/upsert_by_id';
import DishRow from './dish_row';
import type MenuTabProps from './menu_tab_props';

/** Every dish, narrowed by a search and a category. */
export default function DishesTab({ menu, onUpdate, header, refreshing, onRefresh }: MenuTabProps & { header: ReactNode; refreshing: boolean; onRefresh: () => void }) {
  const [filter, setFilter] = useState({ search: '', category: ALL_CATEGORIES });
  // Deals have their own tab.
  const shown = filterMenu({ ...menu, items: menu.items.filter((item) => !item.includes?.length) }, filter.search, filter.category);
  const save = (dish: MenuItem) => onUpdate({ items: upsertById(menu.items, dish) });

  return (
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-2 px-4 pb-32"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      data={shown}
      keyExtractor={(dish) => dish._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => <DishRow dish={item} menu={menu} onSaved={save} onDeleted={() => onUpdate({ items: menu.items.filter((entry) => entry._id !== item._id) })} />}
      ListHeaderComponent={
        <View className="gap-2 pb-1">
          {header}
          <SearchField accessibilityLabel="Search dishes" placeholder="Search dishes" value={filter.search} onChangeText={(search) => setFilter({ ...filter, search })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }} className="-mx-4" contentContainerClassName="gap-2 px-4 py-1">
            {[{ _id: ALL_CATEGORIES, name: 'All' }, ...menu.categories].map((category) => (
              <Chip key={category._id} label={category.name} selected={filter.category === category._id} onPress={() => setFilter({ ...filter, category: category._id })} />
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="restaurant-outline"
          title={menu.categories.length ? 'No dishes here' : 'Start with a category'}
          text={!menu.categories.length ? 'Dishes sit in categories, like Karahi, BBQ or Drinks. Add one in Categories first.' : menu.items.length ? 'Try a different search or category.' : 'Add your first dish with + to start taking orders.'}
        />
      }
    />
  );
}
