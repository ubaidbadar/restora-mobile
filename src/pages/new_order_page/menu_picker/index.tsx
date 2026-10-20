import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import EmptyState from '@/components/empty_state';
import LoadFailed from '@/components/load_failed';
import SkeletonList from '@/components/skeleton_list';
import useGet from '@/hooks/useGet';
import type FormComponentProps from '@/types/form_component_props';
import type Menu from '@/types/menu';
import MenuPickerBody from './menu_picker_body';

interface MenuPickerProps extends FormComponentProps {
  /** Above the menu: the customer. */
  header: ReactNode;
  /** Tiles in a grid (tablets) instead of rows. */
  wide?: boolean;
}

/** The menu; hidden dishes and dishes sold out in this branch are left out so they cannot be ordered. */
export default function MenuPicker({ header, wide = false, ...props }: MenuPickerProps) {
  const { data, loading, get } = useGet<Menu>('/menu');

  if (!data) {
    return (
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 p-4">
        {header}
        {loading ? <SkeletonList rows={6} /> : <LoadFailed what="the menu" onRetry={() => get()} />}
      </ScrollView>
    );
  }
  const items = data.items.filter((item) => !item.hidden && !item.soldOut);
  if (!items.length) {
    return (
      <View className="flex-1 p-4">
        {header}
        <EmptyState icon="restaurant-outline" title="Nothing to order yet" text="Add dishes on the Menu page on the web, or mark sold-out dishes back in stock." />
      </View>
    );
  }
  const menu = { ...data, items, categories: data.categories.filter((category) => items.some((item) => item.categoryId === category._id)) };
  return <MenuPickerBody menu={menu} header={header} wide={wide} {...props} />;
}
