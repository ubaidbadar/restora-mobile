import { type ReactNode, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import EmptyState from '@/components/empty_state';
import ALL_CATEGORIES from '@/constants/all_categories';
import type MenuItem from '@/types/menu_item';
import SearchField from '@/ui/search_field';
import filterMenu from '@/utils/filter_menu';
import upsertById from '@/utils/upsert_by_id';
import DealRow from './deal_row';
import type MenuTabProps from './menu_tab_props';

/** Deals: dishes sold together at one price ("Karahi + 2 naan + drink"), narrowed by a search. */
export default function DealsTab({ menu, onUpdate, header, refreshing, onRefresh }: MenuTabProps & { header: ReactNode; refreshing: boolean; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const shown = filterMenu({ ...menu, items: menu.items.filter((item) => (item.includes?.length ?? 0) > 0) }, search, ALL_CATEGORIES);
  const save = (deal: MenuItem) => onUpdate({ items: upsertById(menu.items, deal) });

  return (
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-2 px-4 pb-32"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      data={shown}
      keyExtractor={(deal) => deal._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => <DealRow deal={item} menu={menu} onSaved={save} onDeleted={() => onUpdate({ items: menu.items.filter((entry) => entry._id !== item._id) })} />}
      ListHeaderComponent={
        <View className="gap-2 pb-1">
          {header}
          <Text className="text-sm text-muted">Dishes sold together at one price. Lunch deals can be sold at set days and hours only.</Text>
          <SearchField accessibilityLabel="Search deals" placeholder="Search deals" value={search} onChangeText={setSearch} />
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="pricetags-outline"
          title={search ? 'No deals found' : 'No deals yet'}
          text={search ? 'Try a different search.' : menu.items.length ? 'Add one with +, like "Deal 1: karahi, 2 naan and a drink".' : 'A deal is made of dishes. Add dishes first.'}
        />
      }
    />
  );
}
