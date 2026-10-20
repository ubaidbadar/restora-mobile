import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import ALL_CATEGORIES from '@/constants/all_categories';
import type FormComponentProps from '@/types/form_component_props';
import type Menu from '@/types/menu';
import Chip from '@/ui/chip';
import SearchField from '@/ui/search_field';
import MenuGrid from './menu_grid';

interface MenuPickerBodyProps extends FormComponentProps {
  menu: Menu;
  header: ReactNode;
  wide: boolean;
}

/** Search and category are not order fields: they stay here, so filtering re-renders the menu only. */
export default function MenuPickerBody({ menu, header, ...props }: MenuPickerBodyProps) {
  const [filter, setFilter] = useState({ search: '', category: ALL_CATEGORIES });

  return (
    <MenuGrid
      menu={menu}
      {...filter}
      {...props}
      header={
        <View className="gap-3">
          {header}
          <SearchField accessibilityLabel="Search the menu" placeholder="Search the menu" value={filter.search} onChangeText={(search) => setFilter({ ...filter, search })} />
        </View>
      }
      categories={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }} contentContainerClassName="gap-2 px-4 py-3">
          {[{ _id: ALL_CATEGORIES, name: 'All' }, ...menu.categories].map((category) => (
            <Chip key={category._id} label={category.name} selected={filter.category === category._id} onPress={() => setFilter({ ...filter, category: category._id })} />
          ))}
        </ScrollView>
      }
    />
  );
}
