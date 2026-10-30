import type { ReactNode } from 'react';
import { useState } from 'react';
import { View } from 'react-native';
import ALL_CATEGORIES from '@/constants/all_categories';
import type FormComponentProps from '@/types/form_component_props';
import type Menu from '@/types/menu';
import type MenuItem from '@/types/menu_item';
import Tabs from '@/ui/tabs';
import SearchField from '@/ui/search_field';
import MenuGrid from './menu_grid';

interface MenuPickerBodyProps extends FormComponentProps {
  menu: Menu;
  /** Every dish, hidden ones too, to name what is in a deal. */
  allItems: MenuItem[];
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
        <Tabs
          scroll
          className="py-3"
          options={[{ value: ALL_CATEGORIES, label: 'All' }, ...menu.categories.map((category) => ({ value: category._id, label: category.name }))]}
          value={filter.category}
          onChange={(category) => setFilter({ ...filter, category })}
        />
      }
    />
  );
}
