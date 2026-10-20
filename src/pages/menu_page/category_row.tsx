import { Pressable, Text, View } from 'react-native';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import type MenuCategory from '@/types/menu_category';
import Icon from '@/ui/icon';
import Input from '@/ui/input';
import MenuSheet from '@/ui/menu_sheet';
import confirm from '@/utils/confirm';
import fieldError from '@/utils/field_error';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import categorySchema from './category_schema';

interface CategoryRowProps {
  category: MenuCategory;
  /** How many dishes are in it. */
  dishes: number;
  first: boolean;
  last: boolean;
  /** People who can't edit the menu just see the row. */
  editable: boolean;
  onMove: (step: -1 | 1) => void;
  onSaved: (category: MenuCategory) => void;
  onDeleted: () => void;
}

/** One category and how many dishes it has. Tap: rename, move up or down, delete (only once it is empty). */
export default function CategoryRow({ category, dishes, first, last, editable, onMove, onSaved, onDeleted }: CategoryRowProps) {
  const remove = async () => {
    if (dishes) {
      toast.error(`${category.name} still has ${dishes} ${dishes === 1 ? 'dish' : 'dishes'}. Move them to another category or delete them first.`);
      return;
    }
    if (!(await confirm({ title: `Delete ${category.name}?`, message: 'It has no dishes, so nothing else changes.', confirmLabel: 'Delete category', destructive: true }))) return;
    await api
      .delete(`/menu/categories/${category._id}`)
      .then(() => {
        toast.success(`${category.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  const body = (onPress?: () => void) => (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} className="min-h-14 flex-row items-center gap-3 px-4 py-2.5 active:bg-sunken">
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{category.name}</Text>
        <Text className="text-sm text-muted">
          {dishes} {dishes === 1 ? 'dish' : 'dishes'}
        </Text>
      </View>
      {onPress && <Icon name="ellipsis-horizontal" size={20} />}
    </Pressable>
  );

  if (!editable) return body();

  return (
    <FormSheet
      title="Rename category"
      schema={categorySchema}
      defaultValues={{ name: category.name }}
      onSave={(values) => api.patch<MenuCategory>(`/menu/categories/${category._id}`, { name: values.name }).then((res) => onSaved(res.data))}
      fields={({ register, errors }) => <Input label="Name" required placeholder="e.g. Karahi" {...register('name')} error={fieldError(errors, 'name')} />}
      component={({ open: rename }) => (
        <MenuSheet
          title={category.name}
          items={[
            { label: 'Rename', icon: 'create-outline', symbol: 'square.and.pencil', onPress: rename },
            { label: 'Move up', icon: 'arrow-up', symbol: 'arrow.up', onPress: () => onMove(-1), hidden: first },
            { label: 'Move down', icon: 'arrow-down', symbol: 'arrow.down', onPress: () => onMove(1), hidden: last },
            { label: 'Delete category', icon: 'trash-outline', symbol: 'trash', destructive: true, onPress: () => void remove() },
          ]}
          component={({ open }) => body(open)}
        />
      )}
    />
  );
}
