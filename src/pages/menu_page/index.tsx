import { View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import can from '@shared/can';
import FormSheet from '@/components/form_sheet';
import LoadFailed from '@/components/load_failed';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import useAuthStore from '@/store/auth_store';
import type AddonGroup from '@/types/addon_group';
import type Menu from '@/types/menu';
import type MenuCategory from '@/types/menu_category';
import type MenuItem from '@/types/menu_item';
import IconButton from '@/ui/icon_button';
import Input from '@/ui/input';
import Tabs from '@/ui/tabs';
import fieldError from '@/utils/field_error';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import upsertById from '@/utils/upsert_by_id';
import AddonGroupFields from './addon_group_fields';
import AddonGroupRow from './addon_group_row';
import addonGroupSchema from './addon_group_schema';
import categorySchema from './category_schema';
import CategoryRow from './category_row';
import DishFields from './dish_fields';
import dishSchema from './dish_schema';
import DishesTab from './dishes_tab';
import DealFields from './deal_fields';
import dealSchema from './deal_schema';
import DealsTab from './deals_tab';
import ListTab from './list_tab';

const TABS = [
  { value: 'dishes', label: 'Dishes' },
  { value: 'deals', label: 'Deals' },
  { value: 'categories', label: 'Categories' },
  { value: 'addons', label: 'Add-ons' },
];

/** The restaurant's menu, shared by every branch: dishes, deals, their categories and add-on groups. The tab is in the URL. */
export default function MenuPage() {
  return (
    <RequirePermission permission="menu:view">
      <MenuScreen />
    </RequirePermission>
  );
}

function MenuScreen() {
  const { tab = 'dishes' } = useLocalSearchParams<{ tab?: string }>();
  const { data: menu, loading, refreshing, get, update } = useGet<Menu>('/menu');
  const editable = can(useAuthStore((state) => state.me?.workplace), 'menu:update');

  if (!menu) {
    return <View className="flex-1 bg-canvas px-4 pt-2">{loading ? <SkeletonList rows={6} /> : <LoadFailed what="the menu" onRetry={() => get()} />}</View>;
  }
  const onUpdate = (changes: Partial<Menu>) => update((current) => (current ? { ...current, ...changes } : current));
  const { categories, addonGroups } = menu;
  const header = <Tabs options={TABS} value={tab} onChange={(value) => router.setParams({ tab: value })} />;
  const reload = { refreshing: Boolean(refreshing), onRefresh: () => get() };

  // Saves the new order: each category whose place changed gets its place as `sortOrder`.
  const move = (index: number, step: -1 | 1) => {
    const next = [...categories];
    const [moved] = next.splice(index, 1);
    next.splice(index + step, 0, moved!);
    const ordered = next.map((category, sortOrder) => ({ ...category, sortOrder }));
    const changed = ordered.filter((_, place) => next[place]!.sortOrder !== place);
    Promise.all(changed.map((category) => api.patch(`/menu/categories/${category._id}`, { sortOrder: category.sortOrder })))
      .then(() => onUpdate({ categories: ordered }))
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  const add = {
    dishes: (
      <FormSheet
        title="Add dish"
        schema={dishSchema}
        defaultValues={{ categoryId: categories[0]?._id ?? '', sizes: [{ name: '', price: '' }], addonGroupIds: [], hidden: false }}
        onSave={(values) => api.post<MenuItem>('/menu/items', values).then((res) => onUpdate({ items: upsertById(menu.items, res.data) }))}
        fields={(form) => <DishFields menu={menu} {...form} />}
        component={({ open }) => <IconButton icon="add" variant="soft" label="Add dish" disabled={!categories.length} onPress={open} />}
      />
    ),
    deals: (
      <FormSheet
        title="Add deal"
        schema={dealSchema}
        defaultValues={{
          categoryId: categories.find((category) => /deal/i.test(category.name))?._id ?? categories[0]?._id ?? '',
          price: '',
          includes: [{ itemId: '', sizeId: '', qty: '1' }],
          addonGroupIds: [],
          days: [],
          from: '',
          to: '',
          hidden: false,
        }}
        onSave={(values) => api.post<MenuItem>('/menu/items', values).then((res) => onUpdate({ items: upsertById(menu.items, res.data) }))}
        fields={(form) => <DealFields menu={menu} {...form} />}
        component={({ open }) => <IconButton icon="add" variant="soft" label="Add deal" disabled={!menu.items.some((item) => !item.includes?.length)} onPress={open} />}
      />
    ),
    categories: (
      <FormSheet
        title="Add category"
        schema={categorySchema}
        onSave={(values) => api.post<MenuCategory>('/menu/categories', { name: values.name, sortOrder: categories.length }).then((res) => onUpdate({ categories: upsertById(categories, res.data) }))}
        fields={({ register, errors }) => <Input label="Name" required placeholder="e.g. Karahi" {...register('name')} error={fieldError(errors, 'name')} />}
        component={({ open }) => <IconButton icon="add" variant="soft" label="Add category" onPress={open} />}
      />
    ),
    addons: (
      <FormSheet
        title="Add add-on group"
        schema={addonGroupSchema}
        defaultValues={{ min: '0', max: '1', options: [{ name: '', price: '0' }] }}
        onSave={(values) => api.post<AddonGroup>('/menu/addon-groups', values).then((res) => onUpdate({ addonGroups: upsertById(addonGroups, res.data) }))}
        fields={(form) => <AddonGroupFields {...form} />}
        component={({ open }) => <IconButton icon="add" variant="soft" label="Add add-on group" onPress={open} />}
      />
    ),
  }[tab as 'dishes' | 'deals' | 'categories' | 'addons'];

  return (
    <>
      <Stack.Screen options={{ headerRight: editable ? () => add : undefined }} />
      {tab === 'categories' ? (
        <ListTab
          header={header}
          intro="The sections of your menu, in this order on New order and the QR menu."
          empty={{ icon: 'folder-open-outline', title: 'No categories yet', text: 'Add one with + for each part of your menu, like Karahi, BBQ, Bread and Drinks.' }}
          {...reload}
        >
          {categories.map((category, index) => (
            <CategoryRow
              key={category._id}
              category={category}
              dishes={menu.items.filter((item) => item.categoryId === category._id).length}
              first={index === 0}
              last={index === categories.length - 1}
              editable={editable}
              onMove={(step) => move(index, step)}
              onSaved={(saved) => onUpdate({ categories: upsertById(categories, saved) })}
              onDeleted={() => onUpdate({ categories: categories.filter((entry) => entry._id !== category._id) })}
            />
          ))}
        </ListTab>
      ) : tab === 'addons' ? (
        <ListTab
          header={header}
          intro="Extras or choices offered with dishes, like Raita +Rs 100 or a spice level. Pick them for each dish when you edit it."
          empty={{ icon: 'list-outline', title: 'No add-ons yet', text: 'Add a group with + like Extras (Raita, Salad) or Spice level (Mild, Medium, Hot).' }}
          {...reload}
        >
          {addonGroups.map((group) => (
            <AddonGroupRow
              key={group._id}
              group={group}
              dishes={menu.items.filter((item) => item.addonGroupIds.includes(group._id)).length}
              editable={editable}
              onSaved={(saved) => onUpdate({ addonGroups: upsertById(addonGroups, saved) })}
              // The server also takes a deleted group off its dishes; the same is done here instead of loading the menu again.
              onDeleted={() =>
                onUpdate({
                  addonGroups: addonGroups.filter((entry) => entry._id !== group._id),
                  items: menu.items.map((item) => ({ ...item, addonGroupIds: item.addonGroupIds.filter((id) => id !== group._id) })),
                })
              }
            />
          ))}
        </ListTab>
      ) : tab === 'deals' ? (
        <DealsTab menu={menu} onUpdate={onUpdate} header={header} {...reload} />
      ) : (
        <DishesTab menu={menu} onUpdate={onUpdate} header={header} {...reload} />
      )}
    </>
  );
}
