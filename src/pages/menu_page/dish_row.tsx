import { Pressable, Switch, Text, View } from 'react-native';
import can from '@shared/can';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import type Menu from '@/types/menu';
import type MenuItem from '@/types/menu_item';
import Badge from '@/ui/badge';
import MenuSheet from '@/ui/menu_sheet';
import confirm from '@/utils/confirm';
import getAxiosMessage from '@/utils/get_axios_message';
import priceRange from '@/utils/price_range';
import toast from '@/utils/toast';
import DishFields from './dish_fields';
import dishFormValues from './dish_form_values';
import dishSchema from './dish_schema';

interface DishRowProps {
  dish: MenuItem;
  menu: Menu;
  onSaved: (dish: MenuItem) => void;
  onDeleted: () => void;
}

/**
 * One dish: name, category, price, sizes and add-ons. The switch says whether it is in stock at this branch (it moves
 * once the server has saved it). Tap the dish to edit or delete it.
 */
export default function DishRow({ dish, menu, onSaved, onDeleted }: DishRowProps) {
  const workplace = useAuthStore((state) => state.me?.workplace);
  const branch = workplace?.branch?.name ?? 'this branch';
  const category = menu.categories.find((entry) => entry._id === dish.categoryId)?.name;
  const groups = menu.addonGroups.filter((group) => dish.addonGroupIds.includes(group._id)).map((group) => group.name);
  const details = [category, dish.sizes.length > 1 ? dish.sizes.map((size) => size.name).join(' / ') : '', groups.length ? `+ ${groups.join(', ')}` : ''].filter(Boolean).join(' · ');

  const setInStock = (inStock: boolean) =>
    api
      .patch<MenuItem>(`/menu/items/${dish._id}/stock`, { soldOut: !inStock })
      .then((res) => {
        onSaved(res.data);
        toast.success(inStock ? `${dish.name} is back in ${branch}` : `${dish.name} marked sold out in ${branch}`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${dish.name}?`,
      message: 'It leaves the menu of every branch for good. Past orders keep its name and price. To take it off for a while, hide it or mark it sold out instead.',
      confirmLabel: 'Delete dish',
      destructive: true,
    });
    if (!ok) return;
    await api
      .delete(`/menu/items/${dish._id}`)
      .then(() => {
        toast.success(`${dish.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  const body = (onPress?: () => void) => (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityHint={onPress ? 'Edit or delete' : undefined} className={`min-h-18 flex-row items-center gap-3 rounded-card border border-border px-4 py-3 active:opacity-70 ${dish.hidden || dish.soldOut ? 'bg-sunken' : 'bg-surface'}`}>
      <View className="flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text numberOfLines={1} className="shrink text-base font-semibold text-ink">
            {dish.name}
          </Text>
          {dish.hidden && <Badge>Hidden</Badge>}
          {dish.soldOut && !dish.hidden && <Badge variant="danger">Sold out here</Badge>}
        </View>
        <Text className="text-sm font-semibold text-body">{priceRange(dish.sizes)}</Text>
        {details !== '' && (
          <Text numberOfLines={2} className="text-sm text-muted">
            {details}
          </Text>
        )}
      </View>
      {!dish.hidden && can(workplace, 'menu:stock') && (
        <View className="items-center gap-1">
          <Switch accessibilityLabel={`${dish.name} in stock at ${branch}`} value={!dish.soldOut} onValueChange={(value) => void setInStock(value)} trackColorOnClassName="accent-primary" trackColorOffClassName="accent-border-strong" />
          <Text className="text-xs text-muted">{dish.soldOut ? 'Sold out' : 'In stock'}</Text>
        </View>
      )}
    </Pressable>
  );

  if (!can(workplace, 'menu:update')) return body();

  return (
    <FormSheet
      title="Edit dish"
      schema={dishSchema}
      defaultValues={dishFormValues(dish)}
      onSave={(values) => api.patch<MenuItem>(`/menu/items/${dish._id}`, values).then((res) => onSaved(res.data))}
      fields={(form) => <DishFields menu={menu} {...form} />}
      component={({ open: edit }) => (
        <MenuSheet
          title={dish.name}
          items={[
            { label: 'Edit dish', icon: 'create-outline', symbol: 'square.and.pencil', onPress: edit },
            { label: 'Delete dish', icon: 'trash-outline', symbol: 'trash', destructive: true, onPress: () => void remove() },
          ]}
          component={({ open }) => body(open)}
        />
      )}
    />
  );
}
