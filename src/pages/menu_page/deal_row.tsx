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
import dealContents from '@/utils/deal_contents';
import formatRs from '@/utils/format_rs';
import getAxiosMessage from '@/utils/get_axios_message';
import onSale from '@/utils/on_sale';
import saleHours from '@/utils/sale_hours';
import toast from '@/utils/toast';
import DealFields from './deal_fields';
import dealFormValues from './deal_form_values';
import dealSchema from './deal_schema';

interface DealRowProps {
  deal: MenuItem;
  menu: Menu;
  onSaved: (deal: MenuItem) => void;
  onDeleted: () => void;
}

/**
 * One deal: name, price, what is in it, choices and when it is sold. The switch says whether it is in stock at this
 * branch. Tap the deal to edit or delete it.
 */
export default function DealRow({ deal, menu, onSaved, onDeleted }: DealRowProps) {
  const workplace = useAuthStore((state) => state.me?.workplace);
  const branch = workplace?.branch?.name ?? 'this branch';
  const partSoldOut = menu.items.find((item) => deal.includes.some((part) => part.itemId === item._id) && item.soldOut);
  const hours = saleHours(deal);
  const groups = menu.addonGroups.filter((group) => deal.addonGroupIds.includes(group._id)).map((group) => group.name);
  const details = [dealContents(deal, menu.items), groups.length ? `+ ${groups.join(', ')}` : '', hours].filter(Boolean).join(' · ');

  const setInStock = (inStock: boolean) =>
    api
      .patch<MenuItem>(`/menu/items/${deal._id}/stock`, { soldOut: !inStock })
      .then((res) => {
        onSaved(res.data);
        toast.success(inStock ? `${deal.name} is back in ${branch}` : `${deal.name} marked sold out in ${branch}`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${deal.name}?`,
      message: 'It leaves the menu of every branch for good. Past orders keep its name and price. To take it off for a while, hide it or mark it sold out instead.',
      confirmLabel: 'Delete deal',
      destructive: true,
    });
    if (!ok) return;
    await api
      .delete(`/menu/items/${deal._id}`)
      .then(() => {
        toast.success(`${deal.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  const body = (onPress?: () => void) => (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityHint={onPress ? 'Edit or delete' : undefined} className={`min-h-18 flex-row items-center gap-3 rounded-card border border-border px-4 py-3 active:opacity-70 ${deal.hidden || deal.soldOut || partSoldOut ? 'bg-sunken' : 'bg-surface'}`}>
      <View className="flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text numberOfLines={1} className="shrink text-base font-semibold text-ink">
            {deal.name}
          </Text>
          {deal.hidden && <Badge>Hidden</Badge>}
          {!deal.hidden && deal.soldOut && <Badge variant="danger">Sold out here</Badge>}
          {!deal.hidden && !deal.soldOut && partSoldOut && <Badge variant="danger">{`${partSoldOut.name} sold out`}</Badge>}
          {!deal.hidden && hours !== '' && !onSale(deal) && <Badge>Not now</Badge>}
        </View>
        <Text className="text-sm font-semibold text-body">{formatRs(deal.sizes[0]?.price ?? 0)}</Text>
        <Text numberOfLines={3} className="text-sm text-muted">
          {details}
        </Text>
      </View>
      {!deal.hidden && can(workplace, 'menu:stock') && (
        <View className="items-center gap-1">
          <Switch accessibilityLabel={`${deal.name} in stock at ${branch}`} value={!deal.soldOut} onValueChange={(value) => void setInStock(value)} trackColorOnClassName="accent-primary" trackColorOffClassName="accent-border-strong" thumbColorClassName="accent-surface" />
          <Text className="text-xs text-muted">{deal.soldOut ? 'Sold out' : 'In stock'}</Text>
        </View>
      )}
    </Pressable>
  );

  if (!can(workplace, 'menu:update')) return body();

  return (
    <FormSheet
      title="Edit deal"
      schema={dealSchema}
      defaultValues={dealFormValues(deal)}
      onSave={(values) => api.patch<MenuItem>(`/menu/items/${deal._id}`, values).then((res) => onSaved(res.data))}
      fields={(form) => <DealFields menu={menu} {...form} />}
      component={({ open: edit }) => (
        <MenuSheet
          title={deal.name}
          items={[
            { label: 'Edit deal', icon: 'create-outline', symbol: 'square.and.pencil', onPress: edit },
            { label: 'Delete deal', icon: 'trash-outline', symbol: 'trash', destructive: true, onPress: () => void remove() },
          ]}
          component={({ open }) => body(open)}
        />
      )}
    />
  );
}
