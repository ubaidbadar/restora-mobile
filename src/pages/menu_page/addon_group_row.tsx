import { Pressable, Text, View } from 'react-native';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import type AddonGroup from '@/types/addon_group';
import Icon from '@/ui/icon';
import MenuSheet from '@/ui/menu_sheet';
import addonRule from '@/utils/addon_rule';
import confirm from '@/utils/confirm';
import formatRs from '@/utils/format_rs';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import AddonGroupFields from './addon_group_fields';
import addonGroupSchema from './addon_group_schema';

interface AddonGroupRowProps {
  group: AddonGroup;
  /** How many dishes offer it. */
  dishes: number;
  editable: boolean;
  onSaved: (group: AddonGroup) => void;
  onDeleted: () => void;
}

/** One add-on group: its rule, how many dishes offer it, its options and prices. Tap: edit or delete. */
export default function AddonGroupRow({ group, dishes, editable, onSaved, onDeleted }: AddonGroupRowProps) {
  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${group.name}?`,
      message: dishes ? `It comes off the ${dishes} ${dishes === 1 ? 'dish' : 'dishes'} that offer it. Past orders keep what was picked.` : 'No dish offers it, so nothing else changes.',
      confirmLabel: 'Delete group',
      destructive: true,
    });
    if (!ok) return;
    await api
      .delete(`/menu/addon-groups/${group._id}`)
      .then(() => {
        toast.success(`${group.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  const body = (onPress?: () => void) => (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} className="min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-sunken">
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-ink">{group.name}</Text>
        <Text className="text-sm text-muted">
          {addonRule(group)} · on {dishes} {dishes === 1 ? 'dish' : 'dishes'}
        </Text>
        <Text className="text-sm text-body">{group.options.map((option) => (option.price ? `${option.name} +${formatRs(option.price)}` : option.name)).join(', ')}</Text>
      </View>
      {onPress && <Icon name="ellipsis-horizontal" size={20} />}
    </Pressable>
  );

  if (!editable) return body();

  return (
    <FormSheet
      title="Edit add-on group"
      schema={addonGroupSchema}
      defaultValues={{ name: group.name, min: String(group.min), max: String(group.max), options: group.options.map((option) => ({ _id: option._id, name: option.name, price: String(option.price) })) }}
      onSave={(values) => api.patch<AddonGroup>(`/menu/addon-groups/${group._id}`, values).then((res) => onSaved(res.data))}
      fields={(form) => <AddonGroupFields {...form} />}
      component={({ open: edit }) => (
        <MenuSheet
          title={group.name}
          items={[
            { label: 'Edit group', icon: 'create-outline', symbol: 'square.and.pencil', onPress: edit },
            { label: 'Delete group', icon: 'trash-outline', symbol: 'trash', destructive: true, onPress: () => void remove() },
          ]}
          component={({ open }) => body(open)}
        />
      )}
    />
  );
}
